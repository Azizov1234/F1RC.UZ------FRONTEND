import { ApiClient } from './api';
import type { HealthStatus } from '../types';

export const healthApi = {
  getHealth(): Promise<HealthStatus> {
    return ApiClient.get('/health');
  },
};
