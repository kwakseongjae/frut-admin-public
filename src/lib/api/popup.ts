import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface Popup {
  id: number
  popup_title: string
  popup_content: string
  popup_image: string
  popup_url?: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreatePopupRequest {
  popup_title: string
  popup_content: string
  popup_image: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface UpdatePopupRequest {
  popup_title?: string
  popup_content?: string
  popup_image?: string
  start_date?: string
  end_date?: string
  is_active?: boolean
}

export interface PopupsListData {
  count: number
  next: string | null
  previous: string | null
  results: Popup[]
}

export type PopupsResponse = ApiResponse<PopupsListData>
export type CreatePopupResponse = ApiResponse<Popup>
export type UpdatePopupResponse = ApiResponse<Popup>
export type DeletePopupResponse = ApiResponse<null>
export type TogglePopupActiveResponse = ApiResponse<Popup>

/**
 * 팝업 목록 조회 API
 */
export const getPopups = async (): Promise<PopupsResponse> => {
  const response = await apiClient.get<PopupsResponse>('/api/operations/popups')
  return response.data
}

/**
 * 팝업 생성 API
 */
export const createPopup = async (
  data: CreatePopupRequest
): Promise<CreatePopupResponse> => {
  const response = await apiClient.post<CreatePopupResponse>(
    '/api/operations/popups',
    data
  )
  return response.data
}

/**
 * 팝업 수정 API
 */
export const updatePopup = async (
  id: number,
  data: UpdatePopupRequest
): Promise<UpdatePopupResponse> => {
  const response = await apiClient.put<UpdatePopupResponse>(
    `/api/operations/popups/${id}`,
    data
  )
  return response.data
}

/**
 * 팝업 삭제 API
 */
export const deletePopup = async (id: number): Promise<DeletePopupResponse> => {
  const response = await apiClient.delete<DeletePopupResponse>(
    `/api/operations/popups/${id}`
  )
  return response.data
}

/**
 * 팝업 활성/비활성 토글 API
 */
export const togglePopupActive = async (
  id: number
): Promise<TogglePopupActiveResponse> => {
  const response = await apiClient.post<TogglePopupActiveResponse>(
    `/api/operations/popups/${id}/toggle-active`
  )
  return response.data
}
