import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface SpecialOrder {
  id: number
  order_number: string
  total_price: number
  customer_name: string
  customer_phone: string
  product_name: string
  quantity: number
  payment_status: 'READY' | 'PAID' | 'CANCELLED' | 'FAILED'
  payment_status_display: string
  item_status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  item_status_display: string
  ordered_at: string
}

export interface SpecialOrdersSummary {
  total_orders: number
  pending_payment: number
  preparing: number
  shipping: number
  delivered: number
  total_sales: number
}

export interface SpecialOrdersData {
  count: number
  next: string | null
  previous: string | null
  results: SpecialOrder[]
  summary: SpecialOrdersSummary
}

export type SpecialOrdersResponse = ApiResponse<SpecialOrdersData>

export interface GetSpecialOrdersParams {
  payment_status?: 'READY' | 'PAID' | 'CANCELLED' | 'FAILED'
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface UpdateOrderStatusRequest {
  order_status: OrderStatus
}

export type UpdateOrderStatusResponse = ApiResponse<null>

export type PaymentStatus = 'READY' | 'PAID' | 'FAILED' | 'CANCELLED'

export interface UpdatePaymentStatusRequest {
  payment_status: PaymentStatus
}

export type UpdatePaymentStatusResponse = ApiResponse<null>

export const orderApi = {
  getSpecialOrders: async (
    params?: GetSpecialOrdersParams
  ): Promise<SpecialOrdersResponse> => {
    const response = await apiClient.get<SpecialOrdersResponse>(
      '/api/orders/admin/special-orders',
      {
        params,
      }
    )
    return response.data
  },

  updateOrderStatus: async (
    id: number,
    data: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> => {
    const response = await apiClient.patch<UpdateOrderStatusResponse>(
      `/api/orders/admin/special-orders/${id}/update-order-status`,
      data
    )
    return response.data
  },

  updatePaymentStatus: async (
    id: number,
    data: UpdatePaymentStatusRequest
  ): Promise<UpdatePaymentStatusResponse> => {
    const response = await apiClient.patch<UpdatePaymentStatusResponse>(
      `/api/orders/admin/special-orders/${id}/update-payment-status`,
      data
    )
    return response.data
  },
}
