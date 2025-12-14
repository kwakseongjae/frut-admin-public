import { useState, useEffect, useRef } from 'react'
import { productApi, type ProductBadge } from '@/lib/api/product'

interface BadgeModalProps {
  isOpen: boolean
  onClose: () => void
  productId?: number
  productName?: string
  onSelectBadge?: (badgeId: number) => void
}

const BadgeModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSelectBadge,
}: BadgeModalProps) => {
  const [badges, setBadges] = useState<ProductBadge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 모달이 열릴 때 뱃지 목록 조회
  useEffect(() => {
    if (isOpen) {
      const fetchBadges = async () => {
        try {
          setLoading(true)
          setError(null)
          const response = await productApi.getBadges()
          setBadges(response.data)
        } catch (err) {
          setError('뱃지 목록을 불러오는데 실패했습니다.')
          console.error('Failed to fetch badges:', err)
        } finally {
          setLoading(false)
        }
      }

      fetchBadges()
    } else {
      setSelectedBadgeId(null)
      setIsDropdownOpen(false)
    }
  }, [isOpen])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleBadgeSelect = (badgeId: number) => {
    setSelectedBadgeId(badgeId)
    setIsDropdownOpen(false)
  }

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleClose = () => {
    setSelectedBadgeId(null)
    setIsDropdownOpen(false)
    setError(null)
    onClose()
  }

  const handleAddBadge = async () => {
    if (!selectedBadgeId || !productId) return

    try {
      setIsSubmitting(true)
      setError(null)
      await productApi.addProductBadge(productId, {
        badge_id: selectedBadgeId,
      })

      if (onSelectBadge) {
        onSelectBadge(selectedBadgeId)
      }

      handleClose()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          '뱃지 추가에 실패했습니다. 다시 시도해주세요.'
      )
      console.error('Failed to add badge:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBadge = badges.find(badge => badge.id === selectedBadgeId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">뱃지 추가</h2>
          <p className="text-sm text-gray-600">
            {productName
              ? `${productName}에 뱃지를 추가하세요.`
              : '상품에 뱃지를 추가하세요.'}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* 선택한 뱃지 Preview */}
          {selectedBadge && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                선택한 뱃지
              </label>
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                {selectedBadge.image_url && (
                  <img
                    src={selectedBadge.image_url}
                    alt={selectedBadge.badge_name}
                    className="w-12 h-12 object-contain shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedBadge.badge_name}
                  </div>
                  {!selectedBadge.is_active && (
                    <div className="text-xs text-gray-500">(비활성)</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 드롭다운 필드 */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              뱃지명
            </label>
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedBadge ? (
                  <>
                    {selectedBadge.image_url && (
                      <img
                        src={selectedBadge.image_url}
                        alt={selectedBadge.badge_name}
                        className="w-4 h-4 object-contain shrink-0"
                      />
                    )}
                    <span className="text-sm text-gray-900 truncate">
                      {selectedBadge.badge_name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">
                    뱃지를 선택하세요
                  </span>
                )}
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 드롭다운 옵션 */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                {loading && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    로딩 중...
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {!loading && !error && (
                  <div className="py-1">
                    {badges.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        등록된 뱃지가 없습니다.
                      </div>
                    ) : (
                      badges.map(badge => (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => handleBadgeSelect(badge.id)}
                          className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors ${
                            selectedBadgeId === badge.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          {/* 뱃지 이미지 - 작게 */}
                          {badge.image_url && (
                            <div className="shrink-0">
                              <img
                                src={badge.image_url}
                                alt={badge.badge_name}
                                className="w-4 h-4 object-contain"
                              />
                            </div>
                          )}

                          {/* 뱃지명 */}
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-gray-900">
                              {badge.badge_name}
                            </div>
                            {!badge.is_active && (
                              <div className="text-xs text-gray-500">
                                (비활성)
                              </div>
                            )}
                          </div>

                          {/* 선택 표시 */}
                          {selectedBadgeId === badge.id && (
                            <div className="shrink-0">
                              <svg
                                className="w-4 h-4 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 space-x-2">
          {error && <div className="flex-1 text-sm text-red-600">{error}</div>}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleAddBadge}
            disabled={!selectedBadgeId || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BadgeModal
