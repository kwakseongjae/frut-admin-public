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
}

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
}

