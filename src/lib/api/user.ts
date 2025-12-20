import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface User {
  id: number
  name: string
  nickname: string
  username: string
  email: string
  user_type: 'SELLER' | 'BUYER' | 'ADMIN'
  is_seller: boolean
  status: 'ACTIVE' | 'BLOCKED' | 'WITHDRAWN'
  status_display: string
  date_joined: string
  purchase_count: number
}

export interface UserListData {
  count: number
  next: string | null
  previous: string | null
  results: User[]
  total_users: number
}

export type UserListResponse = ApiResponse<UserListData>

export interface GetUserListParams {
  search?: string
  user_type?: 'SELLER' | 'BUYER' | 'ADMIN'
  status?: 'ACTIVE' | 'BLOCKED' | 'WITHDRAWN'
  ordering?: 'date_joined' | '-date_joined' | 'name' | '-name'
  page?: number
  page_size?: number
}

export interface ActivityHistory {
  type: 'purchase' | 'point_use' | 'coupon_acquire' | 'coupon_use'
  date?: string
  product_name?: string
  point_amount?: number
  coupon_name?: string
  discount_amount?: number
  discount_percentage?: number
}

export interface SellerInfo {
  seller_registration_date: string
  farm_name: string
  privacy_policy_agreed: boolean
  business_verified: boolean
  safety_certified: boolean
}

export interface UserDetail {
  id: number
  username: string
  name: string
  email: string
  phone: string | null
  profile_image: string | null
  user_type: 'SELLER' | 'BUYER' | 'ADMIN'
  point_balance: number
  is_marketing_consented: boolean
  user_note: string | null
  date_joined: string
  activity_history: ActivityHistory[]
  seller_info: SellerInfo | null
}

export type UserDetailResponse = ApiResponse<UserDetail>

export interface UpdateUserRequest {
  username?: string
  name?: string
  email?: string
  phone?: string
  profile_image?: string
  user_type?: 'SELLER' | 'BUYER' | 'ADMIN'
  user_note?: string
  is_marketing_consented?: boolean
}

export const userApi = {
  getUserList: async (
    params?: GetUserListParams
  ): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>(
      '/api/users/admin/list',
      {
        params,
      }
    )
    return response.data
  },

  getUserDetail: async (id: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get<UserDetailResponse>(`/api/users/${id}`)
    return response.data
  },

  updateUser: async (
    id: number,
    data: UpdateUserRequest
  ): Promise<UserDetailResponse> => {
    const response = await apiClient.patch<UserDetailResponse>(
      `/api/users/${id}`,
      data
    )
    return response.data
  },

  deleteUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/api/users/${id}`
    )
    return response.data
  },

  resetPassword: async (
    id: number
  ): Promise<
    ApiResponse<{ user_id: number; username: string; temp_password: string }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{ user_id: number; username: string; temp_password: string }>
    >(`/api/users/${id}/reset-password`)
    return response.data
  },
}
