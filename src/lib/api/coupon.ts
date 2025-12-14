import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export interface Coupon {
  id: number
  coupon_name: string
  coupon_type: CouponType
  coupon_type_display: string
  discount_value: number
  max_discount_amount: number
  min_order_amount: number
  start_date: string
  end_date: string
  description: string
  is_active: boolean
  usage_count: number
}

export interface CreateCouponRequest {
  coupon_name: string
  coupon_type: CouponType
  discount_value: number
  max_discount_amount?: number
  min_order_amount?: number
  start_date: string
  end_date: string
  description?: string
  is_active?: boolean
}

export interface UpdateCouponRequest {
  coupon_name?: string
  coupon_type?: CouponType
  discount_value?: number
  max_discount_amount?: number
  min_order_amount?: number
  start_date?: string
  end_date?: string
  description?: string
  is_active?: boolean
}

export interface CouponStatistics {
  total_coupons: number
  active_coupons: number
  total_usage: number
  inactive_coupons: number
}

export interface CouponsListData {
  count: number
  next: string | null
  previous: string | null
  results: Coupon[]
  statistics: CouponStatistics
}

export type CreateCouponResponse = ApiResponse<Coupon>
export type CouponsResponse = ApiResponse<CouponsListData>
export type ToggleCouponActiveResponse = ApiResponse<Coupon>
export type UpdateCouponResponse = ApiResponse<Coupon>

/**
 * 쿠폰 생성 API
 */
export const createCoupon = async (
  data: CreateCouponRequest
): Promise<CreateCouponResponse> => {
  const response = await apiClient.post<CreateCouponResponse>(
    '/api/benefits/coupons',
    data
  )
  return response.data
}

/**
 * 쿠폰 목록 조회 API
 */
export const getCoupons = async (page: number = 1): Promise<CouponsResponse> => {
  const response = await apiClient.get<CouponsResponse>(
    `/api/benefits/coupons?page=${page}`
  )
  return response.data
}

/**
 * 쿠폰 활성/비활성 토글 API
 */
export const toggleCouponActive = async (
  id: number
): Promise<ToggleCouponActiveResponse> => {
  const response = await apiClient.patch<ToggleCouponActiveResponse>(
    `/api/benefits/coupons/${id}/toggle-active`
  )
  return response.data
}

/**
 * 쿠폰 수정 API
 */
export const updateCoupon = async (
  id: number,
  data: UpdateCouponRequest
): Promise<UpdateCouponResponse> => {
  const response = await apiClient.patch<UpdateCouponResponse>(
    `/api/benefits/coupons/${id}`,
    data
  )
  return response.data
}

/**
 * 쿠폰 삭제 API
 */
export const deleteCoupon = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/api/benefits/coupons/${id}`
  )
  return response.data
}

