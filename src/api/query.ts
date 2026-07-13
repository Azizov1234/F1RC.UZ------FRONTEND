type QueryValue = string | number | boolean | null | undefined;

export function buildQueryString(params?: object): string {
  if (!params) return '';

  const query = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(params)) {
    const value = rawValue as QueryValue;
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export function appendFormField(
  formData: FormData,
  key: string,
  value: string | number | boolean | File | null | undefined,
): void {
  if (value === undefined || value === null) return;
  formData.append(key, value instanceof File ? value : String(value));
}
