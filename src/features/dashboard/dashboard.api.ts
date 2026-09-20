import { api } from '@/lib/api';
import { USE_MOCKS } from '@/lib/env';
import { mockApi } from '@/mocks/mock-api';

import type { ActivityItem, DashboardData, RangeKey } from './dashboard.types';

export const dashboardApi = {
  async metrics(range: RangeKey): Promise<DashboardData> {
    if (USE_MOCKS) return mockApi.dashboard.metrics(range);

    const { data } = await api.get<DashboardData>('/dashboard/metrics', {
      params: { range },
    });
    return data;
  },

  async activity(): Promise<ActivityItem[]> {
    if (USE_MOCKS) return mockApi.dashboard.activity();

    const { data } = await api.get<ActivityItem[]>('/dashboard/activity');
    return data;
  },
};
