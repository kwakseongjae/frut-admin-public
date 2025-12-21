import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface SellerApplicationItem {
  application_id: number
  applicant_name: string
  business_name: string
  email: string
  phone: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  status_display: string
  applied_at: string
  file_count: number
}

export interface SellerApplicationsData {
  count: number
  next: string | null
  previous: string | null
  results: SellerApplicationItem[]
  total_applications: number
}

export type SellerApplicationsResponse = ApiResponse<SellerApplicationsData>

export interface GetSellerApplicationsParams {
  search?: string
  page?: number
  page_size?: number
  status?: 'APPROVED' | 'PENDING' | 'REJECTED'
}

export interface SellerApplicationFile {
  id: number
  kinds: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  file_url: string
  original_filename: string
  rejected_reason: string | null
}

export interface SellerApplicationDetail {
  application_id: number
  applicant_name: string
  applicant_username: string
  business_name: string
  business_number: string | null
  representative_name: string | null
  business_address: string | null
  business_phone: string | null
  application_reason: string | null
  phone: string
  email: string
  farm_description: string | null
  privacy_policy_agreed: boolean
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  status_display: string
  applied_at: string
  processed_at: string | null
  processed_by_name: string | null
  files: SellerApplicationFile[]
}

export type SellerApplicationDetailResponse =
  ApiResponse<SellerApplicationDetail>

export interface FileRejection {
  file_id: number
  rejected_reason: string
}

export interface UpdateSellerApplicationStatusRequest {
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  file_rejections?: FileRejection[]
}

export type UpdateSellerApplicationStatusResponse =
  ApiResponse<SellerApplicationDetail>

export const sellerApi = {
  getSellerApplications: async (
    params?: GetSellerApplicationsParams
  ): Promise<SellerApplicationsResponse> => {
    const response = await apiClient.get<SellerApplicationsResponse>(
      '/api/sellers/applications/admin',
      {
        params,
      }
    )
    return response.data
  },

  getSellerApplicationDetail: async (
    applicationId: number
  ): Promise<SellerApplicationDetailResponse> => {
    const response = await apiClient.get<SellerApplicationDetailResponse>(
      `/api/sellers/applications/admin/${applicationId}`
    )
    return response.data
  },

  updateSellerApplicationStatus: async (
    applicationId: number,
    data: UpdateSellerApplicationStatusRequest
  ): Promise<UpdateSellerApplicationStatusResponse> => {
    const response = await apiClient.patch<UpdateSellerApplicationStatusResponse>(
      `/api/sellers/applications/admin/${applicationId}`,
      data
    )
    return response.data
  },
}



