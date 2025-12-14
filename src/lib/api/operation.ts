import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface BannerAd {
  id: number
  ad_title: string
  ad_company: string
  ad_type: 'MAIN' | 'MIDDLE' | 'MYPAGE'
  company_call_number: string
  budget: number
  inquired_at: string
  ad_image: string
  ad_url: string
  display_order: number
  start_date: string
  end_date: string
  view_count: number
  click_count: number
  status: 'IN_PROGRESS' | 'PENDING' | 'REVIEW' | 'COMPLETED' | 'CANCELED'
  reviewed_at: string | null
  is_active: boolean
  ctr: number
  created_at: string
}

export interface BannerAdsAggregates {
  total_views: number
  total_clicks: number
  average_ctr: number
  active_ads_count: number
}

export interface BannerAdsData {
  results: BannerAd[]
  aggregates: BannerAdsAggregates
}

export interface CreateBannerAdRequest {
  ad_title?: string
  ad_company?: string
  ad_image: string
  ad_url?: string
  start_date: string
  end_date: string
  ad_type: 'MAIN' | 'MIDDLE' | 'MYPAGE'
}

export interface UpdateBannerAdRequest {
  ad_title?: string
  ad_company?: string
  ad_image?: string
  ad_url?: string
  start_date?: string
  end_date?: string
  ad_type?: 'MAIN' | 'MIDDLE' | 'MYPAGE'
}

export type BannerAdsResponse = ApiResponse<BannerAdsData>
export type ToggleBannerAdActiveResponse = ApiResponse<BannerAd>
export type DeleteBannerAdResponse = ApiResponse<null>
export type BannerAdDetailResponse = ApiResponse<BannerAd>
export type CreateBannerAdResponse = ApiResponse<BannerAd>
export type UpdateBannerAdResponse = ApiResponse<BannerAd>

export const operationApi = {
  getBannerAds: async (): Promise<BannerAdsResponse> => {
    const response = await apiClient.get<BannerAdsResponse>(
      '/api/operations/banner-ads'
    )
    return response.data
  },

  toggleBannerAdActive: async (
    id: number
  ): Promise<ToggleBannerAdActiveResponse> => {
    const response = await apiClient.post<ToggleBannerAdActiveResponse>(
      `/api/operations/banner-ads/${id}/toggle-active`
    )
    return response.data
  },

  deleteBannerAd: async (id: number): Promise<DeleteBannerAdResponse> => {
    const response = await apiClient.delete<DeleteBannerAdResponse>(
      `/api/operations/banner-ads/${id}`
    )
    return response.data
  },

  getBannerAdDetail: async (id: number): Promise<BannerAdDetailResponse> => {
    const response = await apiClient.get<BannerAdDetailResponse>(
      `/api/operations/banner-ads/${id}`
    )
    return response.data
  },

  createBannerAd: async (
    data: CreateBannerAdRequest
  ): Promise<CreateBannerAdResponse> => {
    const response = await apiClient.post<CreateBannerAdResponse>(
      '/api/operations/banner-ads',
      data
    )
    return response.data
  },

  updateBannerAd: async (
    id: number,
    data: UpdateBannerAdRequest
  ): Promise<UpdateBannerAdResponse> => {
    const response = await apiClient.patch<UpdateBannerAdResponse>(
      `/api/operations/banner-ads/${id}`,
      data
    )
    return response.data
  },
}
