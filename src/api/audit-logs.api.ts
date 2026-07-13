import { ApiClient } from './api';
import { buildQueryString } from './query';
import type { ApiResponse, AuditAction, AuditLog, PaginatedResponse } from '../types';

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  actorId?: number;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'action' | 'entityType';
  sortOrder?: 'asc' | 'desc';
}

export const auditLogsApi = {
  getAuditLogs(params?: GetAuditLogsParams): Promise<PaginatedResponse<AuditLog>> {
    return ApiClient.get(`/admin/audit-logs${buildQueryString(params)}`);
  },

  getAuditLogById(id: number | string): Promise<ApiResponse<AuditLog>> {
    return ApiClient.get(`/admin/audit-logs/${id}`);
  },
};
