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

export interface Notice {
  id: number
  title: string
  view_count: number
  created_at: string
}

export interface NoticeDetail {
  id: number
  title: string
  content: string
  view_count: number
  created_at: string
}

export interface FAQ {
  id: number
  faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
  title: string
  view_count: number
  created_at: string
}

export interface FAQDetail {
  id: number
  faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
  title: string
  content: string
  view_count: number
  created_at: string
}

export interface FAQListData {
  count: number
  next: string | null
  previous: string | null
  results: FAQ[]
}

export interface GetFAQsParams {
  faq_type?: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
  page?: number
  search?: string
}

export interface CreateFAQRequest {
  faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
  title: string
  content: string
}

export interface UpdateFAQRequest {
  faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
  title: string
  content: string
}

export interface NoticeListData {
  count: number
  next: string | null
  previous: string | null
  results: Notice[]
}

export interface GetNoticesParams {
  page?: number
  search?: string
}

export interface CreateNoticeRequest {
  title: string
  content: string
}

export interface UpdateNoticeRequest {
  title: string
  content: string
}

export type BannerAdsResponse = ApiResponse<BannerAdsData>
export type ToggleBannerAdActiveResponse = ApiResponse<BannerAd>
export type DeleteBannerAdResponse = ApiResponse<null>
export type BannerAdDetailResponse = ApiResponse<BannerAd>
export type CreateBannerAdResponse = ApiResponse<BannerAd>
export type UpdateBannerAdResponse = ApiResponse<BannerAd>
export type NoticeListResponse = ApiResponse<NoticeListData>
export type CreateNoticeResponse = ApiResponse<Notice>
export type UpdateNoticeResponse = ApiResponse<Notice>
export type DeleteNoticeResponse = ApiResponse<null>
export type NoticeDetailResponse = ApiResponse<NoticeDetail>
export type FAQListResponse = ApiResponse<FAQListData>
export type CreateFAQResponse = ApiResponse<FAQ>
export type UpdateFAQResponse = ApiResponse<FAQ>
export type DeleteFAQResponse = ApiResponse<null>
export type FAQDetailResponse = ApiResponse<FAQDetail>

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

  getNotices: async (
    params?: GetNoticesParams
  ): Promise<NoticeListResponse> => {
    const response = await apiClient.get<NoticeListResponse>(
      '/api/operations/notices',
      { params }
    )
    return response.data
  },

  createNotice: async (
    data: CreateNoticeRequest
  ): Promise<CreateNoticeResponse> => {
    const response = await apiClient.post<CreateNoticeResponse>(
      '/api/operations/notices',
      data
    )
    return response.data
  },

  getNoticeDetail: async (id: number): Promise<NoticeDetailResponse> => {
    const response = await apiClient.get<NoticeDetailResponse>(
      `/api/operations/notices/${id}`
    )
    return response.data
  },

  updateNotice: async (
    id: number,
    data: UpdateNoticeRequest
  ): Promise<UpdateNoticeResponse> => {
    const response = await apiClient.put<UpdateNoticeResponse>(
      `/api/operations/notices/${id}`,
      data
    )
    return response.data
  },

  deleteNotice: async (id: number): Promise<DeleteNoticeResponse> => {
    const response = await apiClient.delete<DeleteNoticeResponse>(
      `/api/operations/notices/${id}`
    )
    return response.data
  },

  getFAQs: async (params?: GetFAQsParams): Promise<FAQListResponse> => {
    const response = await apiClient.get<FAQListResponse>(
      '/api/operations/faqs',
      { params }
    )
    return response.data
  },

  createFAQ: async (data: CreateFAQRequest): Promise<CreateFAQResponse> => {
    const response = await apiClient.post<CreateFAQResponse>(
      '/api/operations/faqs',
      data
    )
    return response.data
  },

  getFAQDetail: async (id: number): Promise<FAQDetailResponse> => {
    const response = await apiClient.get<FAQDetailResponse>(
      `/api/operations/faqs/${id}`
    )
    return response.data
  },

  updateFAQ: async (
    id: number,
    data: UpdateFAQRequest
  ): Promise<UpdateFAQResponse> => {
    const response = await apiClient.put<UpdateFAQResponse>(
      `/api/operations/faqs/${id}`,
      data
    )
    return response.data
  },

  deleteFAQ: async (id: number): Promise<DeleteFAQResponse> => {
    const response = await apiClient.delete<DeleteFAQResponse>(
      `/api/operations/faqs/${id}`
    )
    return response.data
  },
}
