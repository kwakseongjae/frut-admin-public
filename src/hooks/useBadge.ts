import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBadges,
  createBadge,
  toggleBadgeActive,
  updateBadge,
  deleteBadge,
} from '@/lib/api/badge'
import type { CreateBadgeRequest, UpdateBadgeRequest } from '@/lib/api/badge'
import { uploadImageFile } from '@/lib/api/upload'

/**
 * 뱃지 목록 조회 Hook
 */
export const useBadges = () => {
  return useQuery({
    queryKey: ['badges'],
    queryFn: () => getBadges(),
  })
}

/**
 * 뱃지 생성 Hook
 */
export const useCreateBadge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      badgeName,
      imageFile,
      isActive = true,
    }: {
      badgeName: string
      imageFile: File
      isActive?: boolean
    }) => {
      // 1. 이미지 파일 업로드 (공통 유틸리티 사용)
      const gcsPath = await uploadImageFile(imageFile, {
        defaultContentType: 'image/png',
      })

      // 2. 뱃지 생성
      const createBadgeRequest: CreateBadgeRequest = {
        badge_name: badgeName,
        image_url: gcsPath,
        is_active: isActive,
      }

      return createBadge(createBadgeRequest)
    },
    onSuccess: () => {
      // 뱃지 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })
}

/**
 * 뱃지 활성/비활성 토글 Hook
 */
export const useToggleBadgeActive = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => toggleBadgeActive(id),
    onSuccess: () => {
      // 뱃지 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })
}

/**
 * 뱃지 수정 Hook
 */
export const useUpdateBadge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      badgeName,
      imageFile,
      isActive,
    }: {
      id: number
      badgeName?: string
      imageFile?: File
      isActive?: boolean
    }) => {
      const updateData: UpdateBadgeRequest = {}

      // 뱃지명이 변경된 경우
      if (badgeName !== undefined) {
        updateData.badge_name = badgeName
      }

      // 이미지가 변경된 경우 (새 파일이 선택된 경우에만 업로드)
      if (imageFile) {
        // 공통 유틸리티를 사용하여 이미지 업로드
        const gcsPath = await uploadImageFile(imageFile, {
          defaultContentType: 'image/png',
        })
        updateData.image_url = gcsPath
      }

      // is_active가 변경된 경우
      if (isActive !== undefined) {
        updateData.is_active = isActive
      }

      return updateBadge(id, updateData)
    },
    onSuccess: () => {
      // 뱃지 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })
}

/**
 * 뱃지 삭제 Hook
 */
export const useDeleteBadge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteBadge(id),
    onSuccess: () => {
      // 뱃지 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })
}
