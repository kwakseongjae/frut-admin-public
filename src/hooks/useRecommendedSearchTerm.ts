import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  recommendedSearchTermApi,
  type CreateRecommendedSearchTermRequest,
} from '@/lib/api/product'

/**
 * 추천 검색어 목록 조회 Hook
 */
export const useRecommendedSearchTerms = () => {
  return useQuery({
    queryKey: ['recommendedSearchTerms'],
    queryFn: () => recommendedSearchTermApi.getRecommendedSearchTerms(),
  })
}

/**
 * 추천 검색어 생성 Hook
 */
export const useCreateRecommendedSearchTerm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecommendedSearchTermRequest) =>
      recommendedSearchTermApi.createRecommendedSearchTerm(data),
    onSuccess: () => {
      // 추천 검색어 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['recommendedSearchTerms'] })
    },
  })
}

/**
 * 추천 검색어 삭제 Hook
 */
export const useDeleteRecommendedSearchTerm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      recommendedSearchTermApi.deleteRecommendedSearchTerm(id),
    onSuccess: () => {
      // 추천 검색어 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['recommendedSearchTerms'] })
    },
  })
}

