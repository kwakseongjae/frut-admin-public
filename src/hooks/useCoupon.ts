import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCoupon,
  getCoupons,
  toggleCouponActive,
  updateCoupon,
  deleteCoupon,
  type CreateCouponRequest,
  type UpdateCouponRequest,
} from '@/lib/api/coupon'

/**
 * 쿠폰 목록 조회 Hook
 */
export const useCoupons = (page: number = 1) => {
  return useQuery({
    queryKey: ['coupons', page],
    queryFn: async () => {
      const response = await getCoupons(page)
      if (!response.success) {
        throw new Error(response.message || '쿠폰 목록 조회에 실패했습니다.')
      }
      return response
    },
  })
}

/**
 * 쿠폰 생성 Hook
 */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCouponRequest) => createCoupon(data),
    onSuccess: () => {
      // 쿠폰 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * 쿠폰 활성/비활성 토글 Hook
 */
export const useToggleCouponActive = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => toggleCouponActive(id),
    onSuccess: () => {
      // 쿠폰 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * 쿠폰 수정 Hook
 */
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCouponRequest }) =>
      updateCoupon(id, data),
    onSuccess: () => {
      // 쿠폰 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

/**
 * 쿠폰 삭제 Hook
 */
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: () => {
      // 쿠폰 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

