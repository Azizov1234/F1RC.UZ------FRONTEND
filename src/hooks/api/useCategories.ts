import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  categoriesApi,
  type CreateCategoryDto,
  type GetAdminCategoriesParams,
  type GetPublicCategoriesParams,
  type UpdateCategoryDto,
} from '../../api/categories.api';
import { queryKeys } from './useQueryKeys';

type CategoryId = number | string;

function hasCategoryId(id: CategoryId | undefined): id is CategoryId {
  return id !== undefined && id !== '';
}

function requireCategoryId(id: CategoryId | undefined): CategoryId {
  if (!hasCategoryId(id)) {
    throw new Error('Category ID is required');
  }
  return id;
}

export function useCategories(params?: GetAdminCategoriesParams) {
  return useQuery({
    queryKey: queryKeys.categories.list({ ...params, scope: 'admin' }),
    queryFn: async () => {
      const res = await categoriesApi.getCategories(params);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export const useAdminCategories = useCategories;

export function usePublicCategories(params?: GetPublicCategoriesParams) {
  return useQuery({
    queryKey: queryKeys.categories.list({ ...params, scope: 'public' }),
    queryFn: ({ signal }) => categoriesApi.getPublicCategories(params, { signal }),
    staleTime: 60_000,
  });
}

export function usePublicCategory(id: CategoryId | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.publicDetail(id ?? ''),
    queryFn: async ({ signal }) => {
      const response = await categoriesApi.getPublicCategoryById(
        requireCategoryId(id),
        { signal },
      );
      return response.data;
    },
    enabled: hasCategoryId(id),
    staleTime: 60_000,
  });
}

export function useAdminCategory(id: CategoryId | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.adminDetail(id ?? ''),
    queryFn: async () => {
      const response = await categoriesApi.getAdminCategoryById(requireCategoryId(id));
      return response.data;
    },
    enabled: hasCategoryId(id),
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData | CreateCategoryDto) => {
      const res = await categoriesApi.createCategory(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: CategoryId;
      data: FormData | UpdateCategoryDto;
    }) => {
      const res = await categoriesApi.updateCategory(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: CategoryId) => {
      const res = await categoriesApi.deleteCategory(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}
