import { useState } from 'react'
import BadgeDeleteModal from '@/components/BadgeDeleteModal'
import BadgeCreateEditModal from '@/components/BadgeCreateEditModal'
import {
  useBadges,
  useToggleBadgeActive,
  useDeleteBadge,
} from '@/hooks/useBadge'
import type { Badge } from '@/lib/api/badge'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/lib/api/types'

const BadgeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingBadge, setDeletingBadge] = useState<{
    id: number
    name: string
  } | null>(null)
  const { data: badgesResponse, isLoading, error } = useBadges()
  const toggleBadgeMutation = useToggleBadgeActive()
  const deleteBadgeMutation = useDeleteBadge()

  const badges = badgesResponse?.data || []

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleOpenCreateModal = () => {
    setIsEditMode(false)
    setEditingBadge(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (badge: Badge) => {
    setIsEditMode(true)
    setEditingBadge(badge)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingBadge(null)
  }

  const handleOpenDeleteModal = (badgeId: number, badgeName: string) => {
    setDeletingBadge({ id: badgeId, name: badgeName })
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingBadge(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingBadge) return

    deleteBadgeMutation.mutate(deletingBadge.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        setDeletingBadge(null)
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>
        const message =
          axiosError.response?.data?.message ||
          error.message ||
          '뱃지 삭제에 실패했습니다.'
        alert(message)
      },
    })
  }

  return (
    <div className="space-y-6 bg-white p-5 rounded-[14px]">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">뱃지 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            상품의 뱃지를 관리할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#3C82F6' }}
        >
          + 뱃지 추가
        </button>
      </div>

      {/* 뱃지 리스트 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-[100px_150px_120px_120px_140px_auto] gap-4 px-6 py-4">
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                뱃지
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용횟수
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
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
            뱃지 목록을 불러오는 중...
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="p-8 text-center text-red-600">
            뱃지 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* 테이블 바디 */}
        {!isLoading && !error && (
          <div className="divide-y divide-gray-200">
            {badges.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                뱃지가 없습니다.
              </div>
            ) : (
              badges.map(badge => (
                <div
                  key={badge.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-[100px_150px_120px_120px_140px_auto] gap-4 px-6 py-4">
                    {/* 뱃지 컬럼 */}
                    <div className="flex items-center justify-center">
                      <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={badge.image_url || ''}
                          alt={badge.badge_name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            // 이미지 로드 실패 시 기본 플레이스홀더 표시
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (
                              parent &&
                              !parent.querySelector('.badge-placeholder')
                            ) {
                              const placeholder = document.createElement('span')
                              placeholder.className =
                                'text-xs text-gray-500 badge-placeholder'
                              placeholder.textContent = '뱃지'
                              parent.appendChild(placeholder)
                            }
                          }}
                        />
                        {!badge.image_url && (
                          <span className="text-xs text-gray-500">뱃지</span>
                        )}
                      </div>
                    </div>

                    {/* 이름 컬럼 */}
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-900">
                        {badge.badge_name}
                      </span>
                    </div>

                    {/* 상태 컬럼 */}
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                          badge.is_active
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {badge.is_active ? '활성' : '비활성'}
                      </span>
                    </div>

                    {/* 사용횟수 컬럼 */}
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-900">
                        {badge.usage_count}회
                      </span>
                    </div>

                    {/* 생성일 컬럼 */}
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-900">
                        {formatDate(badge.created_at)}
                      </span>
                    </div>

                    {/* 관리 컬럼 */}
                    <div className="flex items-center justify-center">
                      <div className="flex space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => toggleBadgeMutation.mutate(badge.id)}
                          disabled={toggleBadgeMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {badge.is_active ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(badge)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white"
                        >
                          수정
                        </button>
                        <button
                          onClick={() =>
                            handleOpenDeleteModal(badge.id, badge.badge_name)
                          }
                          disabled={deleteBadgeMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          삭제
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

      {/* 뱃지 추가/수정 모달 */}
      <BadgeCreateEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={isEditMode ? 'edit' : 'create'}
        badge={editingBadge}
      />

      {/* 뱃지 삭제 모달 */}
      {deletingBadge && (
        <BadgeDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          badgeName={deletingBadge.name}
          isLoading={deleteBadgeMutation.isPending}
        />
      )}
    </div>
  )
}

export default BadgeManagement
