import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPopups,
  createPopup,
  updatePopup,
  deletePopup,
  togglePopupActive,
  type CreatePopupRequest,
  type UpdatePopupRequest,
} from '@/lib/api/popup'

/**
 * 팝업 목록 조회 Hook
 */
export const usePopups = () => {
  return useQuery({
    queryKey: ['popups'],
    queryFn: async () => {
      const response = await getPopups()
      if (!response.success) {
        throw new Error(response.message || '팝업 목록 조회에 실패했습니다.')
      }
      return response
    },
  })
}

/**
 * 팝업 생성 Hook
 */
export const useCreatePopup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePopupRequest) => createPopup(data),
    onSuccess: () => {
      // 팝업 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['popups'] })
    },
  })
}

/**
 * 팝업 수정 Hook
 */
export const useUpdatePopup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePopupRequest }) =>
      updatePopup(id, data),
    onSuccess: () => {
      // 팝업 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['popups'] })
    },
  })
}

/**
 * 팝업 삭제 Hook
 */
export const useDeletePopup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deletePopup(id),
    onSuccess: () => {
      // 팝업 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['popups'] })
    },
  })
}

/**
 * 팝업 활성/비활성 토글 Hook
 */
export const useTogglePopupActive = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => togglePopupActive(id),
    onSuccess: () => {
      // 팝업 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['popups'] })
    },
  })
}
