import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * Public detail endpoints currently wrap the resource under a resource-specific
 * key (`event`, `arena`, ...). `data` remains optional so the frontend also
 * tolerates a backend migration to the common ApiResponse envelope.
 */
export type PublicDetailEnvelope<Key extends string, Value> = {
  success: boolean;
  message?: string;
  data?: Value;
} & Partial<Record<Key, Value>>;

/** Public list/detail payloads omit `isActive` because public endpoints filter it. */
export type PublicActiveWire<Value extends { isActive: boolean }> = Omit<
  Value,
  'isActive'
> & {
  isActive?: boolean;
};

export function normalizePublicActive<Value extends { isActive: boolean }>(
  value: PublicActiveWire<Value>,
): Value {
  return {
    ...value,
    isActive: value.isActive ?? true,
  } as Value;
}

export function normalizePublicDetail<
  Key extends string,
  Source,
  Result,
>(
  response: PublicDetailEnvelope<Key, Source>,
  key: Key,
  normalize: (value: Source) => Result,
): ApiResponse<Result> {
  const value = response[key] ?? response.data;
  if (value === undefined || value === null) {
    throw new Error(`Public API response is missing the "${key}" resource`);
  }

  return {
    success: response.success,
    message: response.message,
    data: normalize(value),
  };
}

export function normalizePublicPage<Source, Result>(
  response: PaginatedResponse<Source>,
  normalize: (value: Source) => Result,
): PaginatedResponse<Result> {
  return {
    ...response,
    data: response.data.map(normalize),
  };
}
