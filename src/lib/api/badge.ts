import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface Badge {
  id: number
  badge_name: string
  image_url: string
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface CreateBadgeRequest {
  badge_name: string
  image_url: string
  is_active?: boolean
}

export interface UpdateBadgeRequest {
  badge_name?: string
  image_url?: string
  is_active?: boolean
}

export type BadgesResponse = ApiResponse<Badge[]>
export type CreateBadgeResponse = ApiResponse<Badge>
export type ToggleBadgeActiveResponse = ApiResponse<Badge>
export type UpdateBadgeResponse = ApiResponse<Badge>
export type DeleteBadgeResponse = ApiResponse<null>

/**
 * 뱃지 목록 조회 API
 */
export const getBadges = async (): Promise<BadgesResponse> => {
  const response = await apiClient.get<BadgesResponse>('/api/products/badges')
  return response.data
}

/**
 * 뱃지 생성 API
 */
export const createBadge = async (
  data: CreateBadgeRequest
): Promise<CreateBadgeResponse> => {
  const response = await apiClient.post<CreateBadgeResponse>(
    '/api/products/badges',
    data
  )
  return response.data
}

/**
 * 뱃지 활성/비활성 토글 API
 */
export const toggleBadgeActive = async (
  id: number
): Promise<ToggleBadgeActiveResponse> => {
  const response = await apiClient.patch<ToggleBadgeActiveResponse>(
    `/api/products/badges/${id}/toggle-active`
  )
  return response.data
}

/**
 * 뱃지 수정 API
 */
export const updateBadge = async (
  id: number,
  data: UpdateBadgeRequest
): Promise<UpdateBadgeResponse> => {
  const response = await apiClient.patch<UpdateBadgeResponse>(
    `/api/products/badges/${id}`,
    data
  )
  return response.data
}

/**
 * 뱃지 삭제 API
 */
export const deleteBadge = async (id: number): Promise<DeleteBadgeResponse> => {
  const response = await apiClient.delete<DeleteBadgeResponse>(
    `/api/products/badges/${id}`
  )
  return response.data
}
