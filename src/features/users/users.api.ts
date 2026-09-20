import { api } from '@/lib/api';
import { USE_MOCKS } from '@/lib/env';
import { mockApi } from '@/mocks/mock-api';

import type { Paginated, User, UserInput, UserListParams } from './users.types';

export const usersApi = {
  async list(params: UserListParams): Promise<Paginated<User>> {
    if (USE_MOCKS) return mockApi.users.list(params);

    const { data } = await api.get<Paginated<User>>('/users', {
      // Les filtres à `all` ne partent pas sur le réseau : une absence de
      // paramètre est plus simple à traiter côté serveur qu'une valeur
      // sentinelle qu'il faudrait connaître.
      params: {
        search: params.search || undefined,
        role: params.role === 'all' ? undefined : params.role,
        status: params.status === 'all' ? undefined : params.status,
        sortBy: params.sort?.columnId,
        sortDir: params.sort?.direction,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
    return data;
  },

  async create(input: UserInput): Promise<User> {
    if (USE_MOCKS) return mockApi.users.create(input);

    const { data } = await api.post<User>('/users', input);
    return data;
  },

  async update(id: string, input: UserInput): Promise<User> {
    if (USE_MOCKS) return mockApi.users.update(id, input);

    const { data } = await api.put<User>(`/users/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCKS) return mockApi.users.remove(id);

    await api.delete(`/users/${id}`);
  },
};
