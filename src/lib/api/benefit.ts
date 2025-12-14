import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface PointHistoryItem {
  id: number
  created_at: string
  user_name: string
  point_type: 'EARN' | 'USE' | 'CANCEL_EARN' | 'CANCEL_USE' | 'EXPIRE' | 'ADMIN'
  point_type_display: string
  order_amount: number | null
  point_amount: number
  description: string
}

export interface PointStatistics {
  total_earned: number
  total_used: number
  total_balance: number
  this_month_earned: number
  this_month_used: number
  members_with_points: number
}

export interface PointHistoryData {
  statistics: PointStatistics
  count: number
  next: string | null
  previous: string | null
  results: PointHistoryItem[]
}

export type PointHistoryResponse = ApiResponse<PointHistoryData>

export interface PointSystemStatus {
  is_enabled: boolean
  updated_at: string
  updated_by_name: string
}

export type PointSystemStatusResponse = ApiResponse<PointSystemStatus>

export interface TogglePointSystemRequest {
  is_enabled: boolean
}

export type TogglePointSystemResponse = ApiResponse<null>

export interface CurrentPointRate {
  current_rate: number
  effective_date: string
  updated_at: string
}

export type CurrentPointRateResponse = ApiResponse<CurrentPointRate>

export interface PointRate {
  id: number
  purchase_earn_rate: string
  rate_percent: number
  effective_date: string
  reason: string | null
  created_at: string
  created_by_name: string
}

export interface PointRatesData {
  count: number
  next: string | null
  previous: string | null
  results: PointRate[]
}

export type PointRatesResponse = ApiResponse<PointRatesData>

export interface CreatePointRateRequest {
  purchase_earn_rate: string
  effective_date: string
}

export type CreatePointRateResponse = ApiResponse<PointRate>

export const benefitApi = {
  getPointHistory: async (): Promise<PointHistoryResponse> => {
    const response = await apiClient.get<PointHistoryResponse>(
      '/api/benefits/admin/points'
    )
    return response.data
  },

  getPointSystemStatus: async (): Promise<PointSystemStatusResponse> => {
    const response = await apiClient.get<PointSystemStatusResponse>(
      '/api/benefits/admin/point-system'
    )
    return response.data
  },

  togglePointSystem: async (
    data: TogglePointSystemRequest
  ): Promise<TogglePointSystemResponse> => {
    const response = await apiClient.patch<TogglePointSystemResponse>(
      '/api/benefits/admin/point-system/toggle',
      data
    )
    return response.data
  },

  getCurrentPointRate: async (): Promise<CurrentPointRateResponse> => {
    const response = await apiClient.get<CurrentPointRateResponse>(
      '/api/benefits/admin/point-rates/current'
    )
    return response.data
  },

  createPointRate: async (
    data: CreatePointRateRequest
  ): Promise<CreatePointRateResponse> => {
    const response = await apiClient.post<CreatePointRateResponse>(
      '/api/benefits/admin/point-rates',
      data
    )
    return response.data
  },

  getPointRates: async (): Promise<PointRatesResponse> => {
    const response = await apiClient.get<PointRatesResponse>(
      '/api/benefits/admin/point-rates'
    )
    return response.data
  },
}
