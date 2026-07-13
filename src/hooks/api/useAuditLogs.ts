import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, type GetAuditLogsParams } from '../../api/audit-logs.api';
import { queryKeys } from './useQueryKeys';

type AuditLogId = number | string;

function hasId(id: AuditLogId | undefined): id is AuditLogId {
  return id !== undefined && id !== '';
}

function requireId(id: AuditLogId | undefined): AuditLogId {
  if (!hasId(id)) throw new Error('Audit log ID is required');
  return id;
}

export function useAuditLogs(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list({ ...params }),
    queryFn: () => auditLogsApi.getAuditLogs(params),
    staleTime: 10_000,
  });
}

export function useAuditLog(id: AuditLogId | undefined) {
  return useQuery({
    queryKey: queryKeys.auditLogs.detail(id ?? ''),
    queryFn: async () => (await auditLogsApi.getAuditLogById(requireId(id))).data,
    enabled: hasId(id),
    staleTime: 10_000,
  });
}
