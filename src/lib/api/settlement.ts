import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export type PeriodType =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'all'
  | 'custom'

export interface GetSalesStatisticsParams {
  period_type: PeriodType
  start_date?: string
  end_date?: string
}

export interface GetSalesTransactionsParams extends GetSalesStatisticsParams {
  page?: number
  page_size?: number
}

export interface SalesStatisticsPeriod {
  start_date: string
  end_date: string
}

export interface SalesStatisticsData {
  period: SalesStatisticsPeriod
  total_transaction_amount: number
  commission_revenue: number
  total_coupon_discount: number
  total_point_used: number
  delivered_count: number
  cancelled_count: number
  refunded_count: number
}

export type SalesStatisticsResponse = ApiResponse<SalesStatisticsData>

export interface SalesTransaction {
  id: number
  ordered_at: string
  buyer_name: string
  seller_name: string
  product_name: string
  total_price: number
  coupon_discount: number
  point_used: number
  commission: number
  item_status: 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'PENDING'
  status_display: string
}

export interface SalesTransactionsData {
  count: number
  next: string | null
  previous: string | null
  results: SalesTransaction[]
}

export type SalesTransactionsResponse = ApiResponse<SalesTransactionsData>

export interface GetSellerSettlementsParams {
  year?: number
  month?: number
  period_type?: 'FIRST_HALF' | 'SECOND_HALF'
  status?: 'PENDING' | 'COMPLETED'
  search?: string
}

export interface SellerSettlementStatistics {
  total_sales_sum: number
  cancelled_amount_sum: number
  carried_over_sum: number
  settlement_amount_sum: number
  commission_sum: number
  vat_sum: number
  completed_count: number
  pending_count: number
}

export interface SellerSettlement {
  id: number
  farm_name: string
  total_sales: number
  cancelled_amount: number
  cancelled_count: number
  commission_amount: number
  vat_amount: number
  carried_over_amount: number
  settlement_amount: number
  order_count: number
  period_type: 'FIRST_HALF' | 'SECOND_HALF'
  period_type_display: string
  status: 'PENDING' | 'COMPLETED'
  completed_at: string | null
  settlement_period: string
}

export interface SellerSettlementsData {
  statistics: SellerSettlementStatistics
  count: number
  next: string | null
  previous: string | null
  results: SellerSettlement[]
}

export type SellerSettlementsResponse = ApiResponse<SellerSettlementsData>

export interface BankInfo {
  bank_name: string
  account_number: string
  account_holder: string
}

export interface OrderItem {
  id: number
  order_number: string
  product_name: string
  quantity: number
  total_price: number
  ordered_at: string
  item_status: 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'PENDING'
  delivery_status: 'DELIVERED' | 'SHIPPING' | 'PREPARING' | 'CANCELLED'
}

export interface SellerSettlementDetail extends SellerSettlement {
  bank_info: BankInfo
  order_items: OrderItem[]
}

export type SellerSettlementDetailResponse = ApiResponse<SellerSettlementDetail>

export const settlementApi = {
  getSalesStatistics: async (
    params: GetSalesStatisticsParams
  ): Promise<SalesStatisticsResponse> => {
    const response = await apiClient.get<SalesStatisticsResponse>(
      '/api/settlements/admin/sales/statistics',
      {
        params,
      }
    )
    return response.data
  },

  getSalesTransactions: async (
    params: GetSalesTransactionsParams
  ): Promise<SalesTransactionsResponse> => {
    const response = await apiClient.get<SalesTransactionsResponse>(
      '/api/settlements/admin/sales/transactions',
      {
        params: {
          ...params,
          page_size: 100, // 고정값
        },
      }
    )
    return response.data
  },

  getSellerSettlements: async (
    params: GetSellerSettlementsParams
  ): Promise<SellerSettlementsResponse> => {
    const response = await apiClient.get<SellerSettlementsResponse>(
      '/api/settlements/admin',
      {
        params,
      }
    )
    return response.data
  },

  completeSellerSettlement: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      `/api/settlements/admin/${id}/complete`
    )
    return response.data
  },

  getSellerSettlementDetail: async (
    id: number
  ): Promise<SellerSettlementDetailResponse> => {
    const response = await apiClient.get<SellerSettlementDetailResponse>(
      `/api/settlements/admin/${id}`
    )
    return response.data
  },
}
