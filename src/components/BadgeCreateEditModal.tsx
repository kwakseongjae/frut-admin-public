import { useState, useEffect, useRef } from 'react'
import { useCreateBadge, useUpdateBadge } from '@/hooks/useBadge'
import type { Badge } from '@/lib/api/badge'

interface BadgeCreateEditModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  badge?: Badge | null
}

const BadgeCreateEditModal = ({
  isOpen,
  onClose,
  mode = 'create',
  badge = null,
}: BadgeCreateEditModalProps) => {
  const [badgeName, setBadgeName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hasImageChanged, setHasImageChanged] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createBadgeMutation = useCreateBadge()
  const updateBadgeMutation = useUpdateBadge()

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && badge) {
        // 수정 모드: 기존 데이터로 초기화
        setBadgeName(badge.badge_name)
        setImagePreview(badge.image_url)
        setImageFile(null)
        setHasImageChanged(false)
        setErrors({})
      } else {
        // 생성 모드: 초기화
        handleReset()
      }
    }
  }, [isOpen, mode, badge])

  const handleReset = () => {
    setBadgeName('')
    setImagePreview(null)
    setImageFile(null)
    setHasImageChanged(false)
    setErrors({})
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setHasImageChanged(true)
      setErrors(prev => ({ ...prev, image: '' }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!badgeName.trim()) {
      newErrors.badgeName = '뱃지 이름을 입력해주세요.'
    }

    if (mode === 'create' && !imageFile) {
      newErrors.image = '뱃지 이미지를 업로드해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (mode === 'create') {
        // 생성 모드: 이미지 필수
        if (!imageFile) {
          return
        }

        createBadgeMutation.mutate(
          {
            badgeName: badgeName.trim(),
            imageFile,
            isActive: true,
          },
          {
            onSuccess: () => {
              handleReset()
              onClose()
            },
            onError: (error: Error) => {
              setErrors({
                submit: error.message || '뱃지 생성에 실패했습니다.',
              })
            },
          }
        )
      } else {
        // 수정 모드
        if (!badge) return

        updateBadgeMutation.mutate(
          {
            id: badge.id,
            badgeName: badgeName.trim(),
            imageFile: hasImageChanged ? imageFile || undefined : undefined,
          },
          {
            onSuccess: () => {
              handleReset()
              onClose()
            },
            onError: (error: Error) => {
              setErrors({
                submit: error.message || '뱃지 수정에 실패했습니다.',
              })
            },
          }
        )
      }
    } catch (err) {
      setErrors({
        submit:
          mode === 'create'
            ? '뱃지 생성에 실패했습니다.'
            : '뱃지 수정에 실패했습니다.',
      })
    }
  }

  if (!isOpen) return null

  const isLoading =
    createBadgeMutation.isPending || updateBadgeMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? '뱃지 수정' : '뱃지 추가'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 뱃지 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                뱃지 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={badgeName}
                onChange={e => {
                  setBadgeName(e.target.value)
                  setErrors(prev => ({ ...prev, badgeName: '' }))
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.badgeName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="뱃지 이름을 입력하세요"
              />
              {errors.badgeName && (
                <p className="mt-1 text-sm text-red-600">{errors.badgeName}</p>
              )}
            </div>

            {/* 뱃지 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                뱃지 이미지{' '}
                {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div
                    onClick={handleImageClick}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden bg-gray-50"
                  >
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div
                    onClick={handleImageClick}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 text-gray-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-xs text-gray-500">이미지 선택</span>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {imagePreview ? '이미지 변경' : '이미지 선택'}
                </button>
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? '처리 중...' : mode === 'edit' ? '수정' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BadgeCreateEditModal
