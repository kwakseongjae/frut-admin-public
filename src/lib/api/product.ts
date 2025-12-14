import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface ProductBadgeInfo {
  id: number
  badge_id: number
  badge_name: string
  badge_image_url?: string
  image_url?: string // 하위 호환성을 위해 유지
}

export interface Product {
  id: number
  main_image: string | null
  product_name: string
  farm_name: string
  category_name: string
  display_cost_price: number
  display_price: number
  status: 'ACTIVE' | 'INACTIVE'
  badges: string[] | ProductBadgeInfo[]
  is_recommended: boolean
  created_at: string
}

export interface ProductListData {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export type ProductListResponse = ApiResponse<ProductListData>

export interface GetProductListParams {
  search?: string
  page?: number
  page_size?: number
  ordering?: string
}

export interface ProductBadge {
  id: number
  badge_name: string
  image_url: string
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export type ProductBadgesResponse = ApiResponse<ProductBadge[]>

export interface AddProductBadgeRequest {
  badge_id: number
}

export interface AddProductBadgeResponse {
  id: number
  product_id: number
  badge_id: number
  badge_name: string
}

export type AddProductBadgeApiResponse = ApiResponse<AddProductBadgeResponse>

export interface SpecialOfferProduct {
  id: number
  product_id: number
  product_name: string
  category_name: string
  main_image: string
  cost_price: number
  price: number
  discount_rate: number
  start_date: string
  end_date: string
  delivery_fee: number
  status: 'ACTIVE' | 'INACTIVE'
  view_count: string
  order_count: number
  created_at: string
  updated_at: string
}

export type SpecialOffersResponse = ApiResponse<SpecialOfferProduct[]>

export const productApi = {
  getProductList: async (
    params?: GetProductListParams
  ): Promise<ProductListResponse> => {
    const response = await apiClient.get<ProductListResponse>(
      '/api/products/admin',
      {
        params,
      }
    )
    return response.data
  },

  getBadges: async (): Promise<ProductBadgesResponse> => {
    const response = await apiClient.get<ProductBadgesResponse>(
      '/api/products/badges'
    )
    return response.data
  },

  addProductBadge: async (
    productId: number,
    data: AddProductBadgeRequest
  ): Promise<AddProductBadgeApiResponse> => {
    const response = await apiClient.post<AddProductBadgeApiResponse>(
      `/api/products/admin/${productId}/badges`,
      data
    )
    return response.data
  },

  deleteProductBadge: async (
    productId: number,
    badgeId: number
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/products/admin/${productId}/badges/${badgeId}`
    )
    return response.data
  },

  toggleProductRecommend: async (
    productId: number
  ): Promise<ApiResponse<{ is_recommended: boolean }>> => {
    const response = await apiClient.patch<
      ApiResponse<{ is_recommended: boolean }>
    >(`/api/products/admin/${productId}/toggle-recommend`)
    return response.data
  },

  getSpecialOffers: async (): Promise<SpecialOffersResponse> => {
    const response = await apiClient.get<SpecialOffersResponse>(
      '/api/products/special'
    )
    return response.data
  },

  toggleSpecialOfferStatus: async (
    id: number
  ): Promise<ApiResponse<{ status: 'ACTIVE' | 'INACTIVE' }>> => {
    const response = await apiClient.patch<
      ApiResponse<{ status: 'ACTIVE' | 'INACTIVE' }>
    >(`/api/products/special/${id}/toggle-status`)
    return response.data
  },

  deleteSpecialOffer: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/products/special/${id}`
    )
    return response.data
  },
}
