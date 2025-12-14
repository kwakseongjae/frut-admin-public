import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface SubCategory {
  id: number
  category_name: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  category_name: string
  sort_order: number
  is_active: boolean
  subcategory_count: number
  subcategories: SubCategory[]
  created_at: string
  updated_at: string
}

export type CategoriesResponse = ApiResponse<Category[]>
export type CategoryResponse = ApiResponse<Category>

export interface CreateCategoryRequest {
  category_name: string
  is_active: boolean
}

export interface CreateSubCategoryRequest {
  category_name: string
  parent_category_id: number
  parent_category_name: string
  is_active: boolean
}

export interface UpdateCategoryRequest {
  category_name: string
  is_active: boolean
}

export const categoryApi = {
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>(
      '/api/products/categories'
    )
    return response.data
  },

  createCategory: async (
    data: CreateCategoryRequest
  ): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>(
      '/api/products/categories',
      data
    )
    return response.data
  },

  createSubCategory: async (
    data: CreateSubCategoryRequest
  ): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>(
      '/api/products/categories/subcategories',
      data
    )
    return response.data
  },

  toggleCategoryActive: async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.patch<CategoryResponse>(
      `/api/products/categories/${id}/toggle-active`
    )
    return response.data
  },

  updateCategory: async (
    id: number,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> => {
    const response = await apiClient.patch<CategoryResponse>(
      `/api/products/categories/${id}`,
      data
    )
    return response.data
  },

  deleteCategory: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/products/categories/${id}`
    )
    // 204 No Content 응답의 경우 빈 응답이므로 성공 응답으로 변환
    if (response.status === 204) {
      return {
        success: true,
        data: null,
        message: '카테고리가 성공적으로 삭제되었습니다.',
      }
    }
    return response.data
  },
}

