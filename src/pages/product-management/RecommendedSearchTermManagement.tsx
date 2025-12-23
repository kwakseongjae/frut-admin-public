import { useState } from 'react'
import RecommendedSearchTermModal from '@/components/RecommendedSearchTermModal'
import RecommendedSearchTermDeleteModal from '@/components/RecommendedSearchTermDeleteModal'
import {
  useRecommendedSearchTerms,
  useCreateRecommendedSearchTerm,
  useDeleteRecommendedSearchTerm,
} from '@/hooks/useRecommendedSearchTerm'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/lib/api/types'

const RecommendedSearchTermManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingTerm, setDeletingTerm] = useState<{
    id: number
    term: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: termsResponse, isLoading, error: queryError } =
    useRecommendedSearchTerms()
  const createTermMutation = useCreateRecommendedSearchTerm()
  const deleteTermMutation = useDeleteRecommendedSearchTerm()

  const terms = termsResponse?.data || []

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleOpenModal = () => {
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setError(null)
  }

  const handleAddTerm = (term: string) => {
    setError(null)

    createTermMutation.mutate(
      { term },
      {
        onSuccess: () => {
          setIsModalOpen(false)
          setError(null)
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<ApiErrorResponse>
          const errorMessage =
            axiosError.response?.data?.message ||
            error.message ||
            '추천 검색어 추가에 실패했습니다.'

          // 중복 에러 체크
          if (
            axiosError.response?.data?.message?.includes('중복') ||
            axiosError.response?.data?.message?.includes('이미 존재')
          ) {
            setError('이미 존재하는 검색어입니다.')
          } else {
            setError(errorMessage)
          }
        },
      }
    )
  }

  const handleOpenDeleteModal = (termId: number, term: string) => {
    setDeletingTerm({ id: termId, term })
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingTerm(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingTerm) return

    deleteTermMutation.mutate(deletingTerm.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        setDeletingTerm(null)
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>
        const message =
          axiosError.response?.data?.message ||
          error.message ||
          '추천 검색어 삭제에 실패했습니다.'
        alert(message)
      },
    })
  }

  return (
    <div className="space-y-6 bg-white p-5 rounded-[14px]">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">추천 검색어 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            추천 검색어를 관리할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#3C82F6' }}
        >
          + 추천 검색어 추가
        </button>
      </div>

      {/* 추천 검색어 리스트 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-[1fr_200px_200px_auto] gap-4 px-6 py-4">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                검색어
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                수정일
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </span>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="p-8 text-center text-gray-600">
            추천 검색어 목록을 불러오는 중...
          </div>
        )}

        {/* 에러 상태 */}
        {queryError && (
          <div className="p-8 text-center text-red-600">
            추천 검색어 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* 테이블 바디 */}
        {!isLoading && !queryError && (
          <div className="divide-y divide-gray-200">
            {terms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                추천 검색어가 없습니다.
              </div>
            ) : (
              terms.map(term => (
                <div
                  key={term.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-[1fr_200px_200px_auto] gap-4 px-6 py-4">
                    {/* 검색어 컬럼 */}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {term.term}
                      </span>
                    </div>

                    {/* 생성일 컬럼 */}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {formatDate(term.created_at)}
                      </span>
                    </div>

                    {/* 수정일 컬럼 */}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {formatDate(term.updated_at)}
                      </span>
                    </div>

                    {/* 관리 컬럼 */}
                    <div className="flex items-center justify-center">
                      <div className="flex space-x-1 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleOpenDeleteModal(term.id, term.term)
                          }
                          disabled={deleteTermMutation.isPending}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 rounded transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="삭제"
                        >
                          <svg
                            className="w-4 h-4 text-red-700 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="text-sm text-red-700 whitespace-nowrap">
                            삭제
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 추천 검색어 추가 모달 */}
      <RecommendedSearchTermModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddTerm}
        isLoading={createTermMutation.isPending}
        error={error}
      />

      {/* 추천 검색어 삭제 모달 */}
      {deletingTerm && (
        <RecommendedSearchTermDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          term={deletingTerm.term}
          isLoading={deleteTermMutation.isPending}
        />
      )}
    </div>
  )
}

export default RecommendedSearchTermManagement

