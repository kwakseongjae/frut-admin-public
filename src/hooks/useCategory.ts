import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  categoryApi,
  type CreateCategoryRequest,
  type CreateSubCategoryRequest,
  type UpdateCategoryRequest,
  type ReorderCategoriesRequest,
} from '@/lib/api/category'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryApi.createCategory(data),
    onSuccess: () => {
      // 카테고리 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubCategoryRequest) =>
      categoryApi.createSubCategory(data),
    onSuccess: () => {
      // 카테고리 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useToggleCategoryActive = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoryApi.toggleCategoryActive(id),
    onSuccess: () => {
      // 카테고리 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateCategoryRequest
    }) => categoryApi.updateCategory(id, data),
    onSuccess: () => {
      // 카테고리 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      // 카테고리 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useReorderCategories = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReorderCategoriesRequest) =>
      categoryApi.reorderCategories(data),
    onSuccess: () => {
      // 카테고리 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

