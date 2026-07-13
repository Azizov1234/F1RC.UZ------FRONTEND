import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const outputPath = path.join(root, 'api_coverage.md');
const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(resolved) : [resolved];
  }));
  return files.flat();
}

function slash(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

async function readEnvironmentValue(key) {
  if (process.env[key]) return process.env[key];

  for (const filename of ['.env.local', '.env']) {
    try {
      const content = await readFile(path.join(root, filename), 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const separator = line.indexOf('=');
        if (separator < 0 || line.slice(0, separator).trim() !== key) continue;
        return line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
      }
    } catch {
      // Optional environment files may be absent.
    }
  }
  return undefined;
}

const configuredApiUrl = await readEnvironmentValue('VITE_API_URL');
if (!configuredApiUrl || !/^https?:\/\//i.test(configuredApiUrl)) {
  throw new Error('audit:api requires an absolute VITE_API_URL in .env or the process environment');
}
const apiUrl = configuredApiUrl.replace(/\/$/, '');

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  if (!node) return '';
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return '';
}

function isQueryBuilder(node) {
  const expression = unwrapExpression(node);
  if (!ts.isCallExpression(expression)) return false;
  const callee = unwrapExpression(expression.expression);
  if (ts.isIdentifier(callee)) return callee.text === 'buildQueryString';
  return ts.isPropertyAccessExpression(callee) && callee.name.text === 'buildQueryString';
}

function interpolationName(node) {
  const expression = unwrapExpression(node);
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return 'param';
}

function staticRequestPath(node) {
  const expression = unwrapExpression(node);
  let result;

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    result = expression.text;
  } else if (ts.isTemplateExpression(expression)) {
    result = expression.head.text;
    for (const span of expression.templateSpans) {
      if (!isQueryBuilder(span.expression)) {
        result += `{${interpolationName(span.expression)}}`;
      }
      result += span.literal.text;
    }
  } else {
    return undefined;
  }

  const withoutQuery = result.split(/[?#]/, 1)[0];
  return withoutQuery.startsWith('/') ? withoutQuery.replace(/\/$/, '') || '/' : undefined;
}

function normalizedPath(value) {
  return value
    .split(/[?#]/, 1)[0]
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/\/$/, '') || '/';
}

function operationKey(method, operationPath) {
  return `${method.toUpperCase()} ${normalizedPath(operationPath)}`;
}

function nodeModifiersContainExport(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function collectPropertyReferences(node, currentObject) {
  const references = new Set();
  const visit = (child) => {
    if (ts.isPropertyAccessExpression(child)) {
      const owner = unwrapExpression(child.expression);
      if (owner.kind === ts.SyntaxKind.ThisKeyword && currentObject) {
        references.add(`${currentObject}.${child.name.text}`);
      } else if (ts.isIdentifier(owner)) {
        references.add(`${owner.text}.${child.name.text}`);
      }
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return references;
}

function collectCalledIdentifiers(sourceFile) {
  const names = new Set();
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = unwrapExpression(node.expression);
      if (ts.isIdentifier(callee)) names.add(callee.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return names;
}

function resolveImport(fromFile, specifier, fileSet) {
  let base;
  if (specifier.startsWith('@/')) {
    base = path.join(sourceRoot, specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return undefined;
  }

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ].map((candidate) => path.normalize(candidate));
  return candidates.find((candidate) => fileSet.has(candidate));
}

function directImports(sourceFile, fromFile, fileSet) {
  const imports = [];
  const addSpecifier = (specifier) => {
    const resolved = resolveImport(fromFile, specifier, fileSet);
    if (resolved) imports.push(resolved);
  };
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      addSpecifier(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      addSpecifier(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return imports;
}

function authenticationRequired(method, operationPath, definition, document) {
  const declaredSecurity = definition.security ?? document.security;
  if (Array.isArray(declaredSecurity) && declaredSecurity.length > 0) return true;

  if (
    operationPath.startsWith('/admin/') ||
    operationPath.startsWith('/operator/') ||
    operationPath.startsWith('/me/') ||
    operationPath.startsWith('/profiles/') ||
    operationPath.startsWith('/teams') ||
    operationPath.startsWith('/users/') ||
    operationPath.startsWith('/categories/admin') ||
    operationPath.startsWith('/vehicles/admin')
  ) return true;

  if (operationPath === '/auth/me') return true;
  if (method === 'POST' && operationPath === '/payments') return true;
  return method === 'POST' && /^\/events\/\{[^}]+\}\/book$/.test(operationPath);
}

function roleFor(operation, document) {
  if (!authenticationRequired(operation.method, operation.path, operation.definition, document)) {
    return 'PUBLIC';
  }
  if (
    operation.path.startsWith('/admin/') ||
    operation.path.startsWith('/users/') ||
    operation.path.startsWith('/categories/admin') ||
    operation.path.startsWith('/vehicles/admin')
  ) return 'ADMIN / SUPERADMIN';
  if (operation.path.startsWith('/operator/')) return 'OPERATOR';
  if (operation.path.startsWith('/teams')) return 'TEAM_MANAGER';
  return 'AUTHENTICATED';
}

function probeValue(parameter) {
  if (parameter.schema?.enum?.length) return String(parameter.schema.enum[0]);
  if (parameter.schema?.type === 'boolean') return 'true';
  if (parameter.schema?.format === 'uuid') return '00000000-0000-4000-8000-000000000001';
  if (parameter.schema?.type === 'string') return 'test';
  return '1';
}

function probePath(operationPath, definition) {
  let result = operationPath;
  for (const parameter of definition.parameters || []) {
    if (parameter.in !== 'path') continue;
    result = result.replace(`{${parameter.name}}`, encodeURIComponent(probeValue(parameter)));
  }
  result = result.replace(/\{[^}]+\}/g, '1');
  const query = (definition.parameters || [])
    .filter((parameter) => parameter.in === 'query' && parameter.required)
    .map((parameter) => `${encodeURIComponent(parameter.name)}=${encodeURIComponent(probeValue(parameter))}`);
  if (query.length) result += `?${query.join('&')}`;
  return result;
}

async function probe(operation, document) {
  const requestPath = probePath(operation.path, operation.definition);
  const options = {
    method: operation.method,
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  };

  if (!['GET', 'DELETE'].includes(operation.method)) {
    const content = operation.definition.requestBody?.content || {};
    if (content['multipart/form-data']) {
      options.body = new FormData();
    } else if (content['application/x-www-form-urlencoded']) {
      options.body = new URLSearchParams();
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      options.body = '{}';
      options.headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(`${apiUrl}${requestPath}`, options);
    const protectedRoute = authenticationRequired(
      operation.method,
      operation.path,
      operation.definition,
      document,
    );
    let verdict = 'PASS';
    if (response.status >= 500) verdict = 'BROKEN';
    else if (protectedRoute && ![401, 403].includes(response.status)) verdict = 'REVIEW';
    else if (!protectedRoute && [401, 403].includes(response.status)) verdict = 'REVIEW';
    return { status: String(response.status), verdict };
  } catch (error) {
    return {
      status: `NETWORK ERROR: ${error instanceof Error ? error.message : 'unknown error'}`,
      verdict: 'BROKEN',
    };
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

const specResponse = await fetch(`${apiUrl}/swagger-json`, { signal: AbortSignal.timeout(15_000) });
if (!specResponse.ok) throw new Error(`OpenAPI fetch failed with HTTP ${specResponse.status}`);
const spec = await specResponse.json();

const operations = [];
const operationsByKey = new Map();
for (const [operationPath, pathItem] of Object.entries(spec.paths || {})) {
  for (const [method, definition] of Object.entries(pathItem)) {
    if (!httpMethods.has(method)) continue;
    const operation = {
      key: operationKey(method, operationPath),
      method: method.toUpperCase(),
      path: operationPath,
      tag: definition.tags?.[0] || 'Untagged',
      definition,
    };
    operations.push(operation);
    operationsByKey.set(operation.key, operation);
  }
}

const allFiles = (await walk(sourceRoot))
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .map((file) => path.normalize(file));
const fileSet = new Set(allFiles);
const sourceByFile = new Map();
const astByFile = new Map();
for (const file of allFiles) {
  const source = await readFile(file, 'utf8');
  sourceByFile.set(file, source);
  astByFile.set(file, ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  ));
}

const reachableFiles = new Set();
const queue = [path.normalize(path.join(sourceRoot, 'main.tsx'))];
while (queue.length) {
  const file = queue.shift();
  if (!file || reachableFiles.has(file) || !fileSet.has(file)) continue;
  reachableFiles.add(file);
  for (const imported of directImports(astByFile.get(file), file, fileSet)) {
    if (!reachableFiles.has(imported)) queue.push(imported);
  }
}

const apiFiles = allFiles.filter((file) => {
  const relative = slash(file);
  return relative.startsWith('src/api/') && !relative.endsWith('/api.ts');
});
const hookFiles = allFiles.filter((file) => slash(file).startsWith('src/hooks/api/'));

const apiMethods = new Map();
const directTransports = [];
for (const file of apiFiles) {
  const sourceFile = astByFile.get(file);
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (!ts.isObjectLiteralExpression(initializer)) continue;
      const objectName = declaration.name.text;

      for (const member of initializer.properties) {
        let name = '';
        let body;
        if (ts.isMethodDeclaration(member)) {
          name = propertyName(member.name);
          body = member.body;
        } else if (ts.isPropertyAssignment(member)) {
          name = propertyName(member.name);
          const value = unwrapExpression(member.initializer);
          if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) body = value.body;
        }
        if (!name || !body) continue;

        const key = `${objectName}.${name}`;
        const info = {
          key,
          objectName,
          name,
          file,
          calls: collectPropertyReferences(body, objectName),
          operations: new Set(),
        };
        apiMethods.set(key, info);

        const visit = (node) => {
          if (ts.isCallExpression(node)) {
            const callee = unwrapExpression(node.expression);
            if (
              ts.isPropertyAccessExpression(callee) &&
              ts.isIdentifier(unwrapExpression(callee.expression)) &&
              unwrapExpression(callee.expression).text === 'ApiClient' &&
              httpMethods.has(callee.name.text) &&
              node.arguments.length > 0
            ) {
              const requestPath = staticRequestPath(node.arguments[0]);
              if (requestPath) {
                directTransports.push({
                  operationKey: operationKey(callee.name.text, requestPath),
                  method: callee.name.text.toUpperCase(),
                  path: requestPath,
                  info,
                });
              }
            }
          }
          ts.forEachChild(node, visit);
        };
        visit(body);
      }
    }
  }
}

for (const transport of directTransports) {
  if (operationsByKey.has(transport.operationKey)) {
    transport.info.operations.add(transport.operationKey);
  }
}

let changed = true;
while (changed) {
  changed = false;
  for (const info of apiMethods.values()) {
    for (const targetKey of info.calls) {
      const target = apiMethods.get(targetKey);
      if (!target) continue;
      for (const key of target.operations) {
        if (!info.operations.has(key)) {
          info.operations.add(key);
          changed = true;
        }
      }
    }
  }
}

const transportByOperation = new Map();
for (const transport of directTransports) {
  if (!operationsByKey.has(transport.operationKey)) continue;
  const list = transportByOperation.get(transport.operationKey) || [];
  list.push(transport.info);
  transportByOperation.set(transport.operationKey, list);
}

const refreshKey = operationKey('POST', '/auth/refresh');
if (operationsByKey.has(refreshKey)) {
  transportByOperation.set(refreshKey, [{
    key: 'ApiClient.automaticRefresh',
    objectName: 'ApiClient',
    name: 'automaticRefresh',
    file: path.join(sourceRoot, 'api', 'api.ts'),
    calls: new Set(),
    operations: new Set([refreshKey]),
  }]);
}

const hookRecords = new Map();
const hookAliases = [];
for (const file of hookFiles) {
  const sourceFile = astByFile.get(file);
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && nodeModifiersContainExport(statement)) {
      const references = collectPropertyReferences(statement, undefined);
      const operationKeys = new Set();
      for (const reference of references) {
        for (const key of apiMethods.get(reference)?.operations || []) operationKeys.add(key);
      }
      hookRecords.set(statement.name.text, { name: statement.name.text, file, operationKeys });
    }

    if (ts.isVariableStatement(statement) && nodeModifiersContainExport(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        const initializer = unwrapExpression(declaration.initializer);
        if (ts.isIdentifier(initializer)) {
          hookAliases.push({ alias: declaration.name.text, target: initializer.text, file });
        } else if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
          const references = collectPropertyReferences(initializer, undefined);
          const operationKeys = new Set();
          for (const reference of references) {
            for (const key of apiMethods.get(reference)?.operations || []) operationKeys.add(key);
          }
          hookRecords.set(declaration.name.text, { name: declaration.name.text, file, operationKeys });
        }
      }
    }
  }
}

changed = true;
while (changed) {
  changed = false;
  for (const alias of hookAliases) {
    if (hookRecords.has(alias.alias)) continue;
    const target = hookRecords.get(alias.target);
    if (!target) continue;
    hookRecords.set(alias.alias, {
      name: alias.alias,
      file: alias.file,
      operationKeys: new Set(target.operationKeys),
    });
    changed = true;
  }
}

const hooksByOperation = new Map();
for (const hook of hookRecords.values()) {
  for (const key of hook.operationKeys) {
    const list = hooksByOperation.get(key) || [];
    list.push(hook);
    hooksByOperation.set(key, list);
  }
}

const consumerFiles = [...reachableFiles].filter((file) => {
  const relative = slash(file);
  return !relative.startsWith('src/hooks/') &&
    !relative.startsWith('src/test/') &&
    !relative.startsWith('src/mocks/');
});
const consumersByOperation = new Map();
const calledIdentifiersByFile = new Map(
  consumerFiles.map((file) => [file, collectCalledIdentifiers(astByFile.get(file))]),
);

for (const [operationKeyValue, hooks] of hooksByOperation) {
  for (const hook of hooks) {
    for (const file of consumerFiles) {
      if (!calledIdentifiersByFile.get(file).has(hook.name)) continue;
      const list = consumersByOperation.get(operationKeyValue) || new Set();
      list.add(file);
      consumersByOperation.set(operationKeyValue, list);
    }
  }
}

for (const file of consumerFiles) {
  const references = collectPropertyReferences(astByFile.get(file), undefined);
  for (const reference of references) {
    const method = apiMethods.get(reference);
    if (!method) continue;
    for (const key of method.operations) {
      const list = consumersByOperation.get(key) || new Set();
      list.add(file);
      consumersByOperation.set(key, list);
    }
  }
}

if (operationsByKey.has(refreshKey)) {
  consumersByOperation.set(refreshKey, new Set([path.join(sourceRoot, 'api', 'api.ts')]));
}

const fakePatterns = [
  /\b(?:verifyOtp|resendOtp|resetPasswordRequest|markAllAsRead)\b/,
  /\bPromise\.resolve\s*\(/,
  /\bdev-mock-token\b/i,
  /\bDEV_MOCK_/,
];
const fakeFindings = [];
for (const file of reachableFiles) {
  const relative = slash(file);
  if (relative.startsWith('src/test/') || relative.startsWith('src/mocks/')) continue;
  const source = sourceByFile.get(file);
  for (const pattern of fakePatterns) {
    if (pattern.test(source)) fakeFindings.push(`${relative}: ${pattern.source}`);
  }
}

const probeResults = await mapWithConcurrency(operations, 12, (operation) => probe(operation, spec));
for (let index = 0; index < operations.length; index += 1) {
  const operation = operations[index];
  const transports = transportByOperation.get(operation.key) || [];
  const hooks = hooksByOperation.get(operation.key) || [];
  const consumers = [...(consumersByOperation.get(operation.key) || [])];
  const probeResult = probeResults[index];

  operation.service = transports.length
    ? [...new Set(transports.map((item) => `${slash(item.file)}#${item.name}`))].join('<br>')
    : '—';
  operation.hook = hooks.length
    ? [...new Set(hooks.map((item) => `${slash(item.file)}#${item.name}`))].slice(0, 3).join('<br>')
    : '— (direct/infrastructure)';
  operation.ui = consumers.length
    ? consumers.map(slash).sort().slice(0, 4).join('<br>')
    : '—';
  operation.realHttp = probeResult.status;
  operation.test = probeResult.verdict;
  operation.status = transports.length && consumers.length
    ? 'CONNECTED'
    : transports.length
      ? 'PARTIAL'
      : 'NOT CONNECTED';
}

operations.sort((a, b) => a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
const counts = operations.reduce((result, operation) => {
  result[operation.status] = (result[operation.status] || 0) + 1;
  return result;
}, {});
const brokenCount = operations.filter((operation) => operation.test === 'BROKEN').length;
const reviewCount = operations.filter((operation) => operation.test === 'REVIEW').length;
const extraTransports = directTransports.filter((transport) => !operationsByKey.has(transport.operationKey));
const generatedAt = new Date().toISOString();

const lines = [
  '# F1RC.UZ API Coverage',
  '',
  `Generated from live OpenAPI: \`${apiUrl}/swagger-json\` at ${generatedAt}.`,
  '',
  '> Static coverage is method + normalized-path aware and follows API compatibility wrappers into reachable hooks/pages. Reachability starts at `src/main.tsx`. Real HTTP checks are non-destructive, unauthenticated route probes: 401/403 is the expected pass result for protected routes; authenticated mutation success still requires role credentials and seeded IDs.',
  '',
  `- TOTAL SWAGGER ENDPOINTS: ${operations.length}`,
  `- CONNECTED: ${counts.CONNECTED || 0}`,
  `- PARTIAL: ${counts.PARTIAL || 0}`,
  `- NOT CONNECTED: ${counts['NOT CONNECTED'] || 0}`,
  `- BROKEN: ${brokenCount}`,
  `- HTTP REVIEW: ${reviewCount}`,
  `- FAKE (production-reachable): ${fakeFindings.length}`,
  `- FRONTEND REST OPERATIONS OUTSIDE SWAGGER: ${extraTransports.length}`,
  '- KNOWN OPENAPI SCHEMA ANNOTATION DEFECTS: 1',
  '',
  '| Method | Path | Tag | Role | Service | Hook | Reachable UI / consumer | Real HTTP | Test | Status |',
  '|---|---|---|---|---|---|---|---:|---|---|',
  ...operations.map((operation) => `| ${operation.method} | \`${operation.path}\` | ${operation.tag} | ${roleFor(operation, spec)} | ${operation.service} | ${operation.hook} | ${operation.ui} | ${operation.realHttp} | ${operation.test} | ${operation.status} |`),
  '',
  '## Audit notes',
  '',
  `- Live Swagger currently exposes ${operations.length} operations; this report does not preserve a stale planned count.`,
  '- HTTP probes do not send access tokens and do not claim authenticated CRUD success.',
  '- Multipart probes use an actual empty `FormData` boundary; JSON probes use an empty object only to validate route/auth behavior.',
  '- Test/dev mocks under `src/mocks` are excluded from the production fake count: `.env.production` configures the real `/api` backend and disables mocks, so Vite removes that guarded dynamic branch from the production bundle.',
  '- `GET /streams` publishes `eventId` as a generic `Object` while also declaring numeric `minimum: 1`; the equivalent admin query correctly publishes `number`. The frontend intentionally keeps `eventId` numeric.',
  '- Live OpenAPI does not publish response schemas, so response-only fields cannot be mechanically checked from Swagger.',
  '',
];

if (extraTransports.length) {
  lines.push('## Frontend operations absent from Swagger', '');
  for (const transport of extraTransports) {
    lines.push(`- ${transport.method} \`${transport.path}\` — ${slash(transport.info.file)}#${transport.info.name}`);
  }
  lines.push('');
}

if (fakeFindings.length) {
  lines.push('## Production-reachable fake-code findings', '');
  for (const finding of fakeFindings) lines.push(`- ${finding}`);
  lines.push('');
}

await writeFile(outputPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${path.relative(root, outputPath)} with ${operations.length} endpoints.`);
console.log(
  `CONNECTED=${counts.CONNECTED || 0} PARTIAL=${counts.PARTIAL || 0} ` +
  `NOT_CONNECTED=${counts['NOT CONNECTED'] || 0} BROKEN=${brokenCount} ` +
  `FAKE=${fakeFindings.length} EXTRA=${extraTransports.length}`,
);
