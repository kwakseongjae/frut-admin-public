import { useState, useRef, useEffect } from 'react'
import type { CreatePopupRequest } from '@/lib/api/popup'
import { uploadImageFile } from '@/lib/api/upload'
import { useCreatePopup, useUpdatePopup } from '@/hooks/usePopup'
import type { Popup } from '@/lib/api/popup'

interface PopupModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  popup?: Popup | null
}

const PopupModal = ({
  isOpen,
  onClose,
  mode = 'create',
  popup = null,
}: PopupModalProps) => {
  const [popupTitle, setPopupTitle] = useState('')
  const [popupContent, setPopupContent] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [hasImageChanged, setHasImageChanged] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPopupMutation = useCreatePopup()
  const updatePopupMutation = useUpdatePopup()

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && popup) {
        // 수정 모드: 기존 데이터로 초기화
        setPopupTitle(popup.popup_title)
        setPopupContent(popup.popup_content)
        setImagePreview(popup.popup_image)
        setImageFile(null)
        setStartDate(popup.start_date)
        setEndDate(popup.end_date)
        setHasImageChanged(false)
        setErrors({})
      } else {
        // 생성 모드: 초기화
        handleReset()
      }
    }
  }, [isOpen, mode, popup])

  const handleReset = () => {
    setPopupTitle('')
    setPopupContent('')
    setImagePreview(null)
    setImageFile(null)
    setStartDate('')
    setEndDate('')
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

    if (!popupTitle.trim()) {
      newErrors.title = '팝업 제목을 입력해주세요.'
    }

    if (!popupContent.trim()) {
      newErrors.content = '팝업 내용을 입력해주세요.'
    }

    if (mode === 'create' && !imageFile) {
      newErrors.image = '이미지를 선택해주세요.'
    }

    if (!startDate) {
      newErrors.startDate = '시작일을 선택해주세요.'
    }

    if (!endDate) {
      newErrors.endDate = '종료일을 선택해주세요.'
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = '종료일은 시작일보다 이후여야 합니다.'
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

        // 1. 이미지 파일 업로드
        const gcsPath = await uploadImageFile(imageFile, {
          prefix: 'popup',
          defaultContentType: 'image/png',
        })

        // 2. 팝업 생성
        const createPopupRequest: CreatePopupRequest = {
          popup_title: popupTitle.trim(),
          popup_content: popupContent.trim(),
          popup_image: gcsPath,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        }

        createPopupMutation.mutate(createPopupRequest, {
          onSuccess: () => {
            handleReset()
            onClose()
          },
          onError: (error: Error) => {
            const errorMessage = error.message || '팝업 생성에 실패했습니다.'
            alert(errorMessage)
          },
        })
      } else {
        // 수정 모드
        if (!popup) return

        let popupImage = popup.popup_image

        // 이미지가 변경된 경우에만 업로드
        if (hasImageChanged && imageFile) {
          popupImage = await uploadImageFile(imageFile, {
            prefix: 'popup',
            defaultContentType: 'image/png',
          })
        }

        // 팝업 수정
        updatePopupMutation.mutate(
          {
            id: popup.id,
            data: {
              popup_title: popupTitle.trim(),
              popup_content: popupContent.trim(),
              popup_image: popupImage,
              start_date: startDate,
              end_date: endDate,
            },
          },
          {
            onSuccess: () => {
              handleReset()
              onClose()
            },
            onError: (error: Error) => {
              const errorMessage = error.message || '팝업 수정에 실패했습니다.'
              alert(errorMessage)
            },
          }
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : mode === 'create'
            ? '팝업 생성에 실패했습니다.'
            : '팝업 수정에 실패했습니다.'
      alert(errorMessage)
    }
  }

  const handleClose = () => {
    if (!createPopupMutation.isPending && !updatePopupMutation.isPending) {
      handleReset()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? '팝업 생성' : '팝업 수정'}
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* 팝업 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팝업 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={popupTitle}
              onChange={e => {
                setPopupTitle(e.target.value)
                setErrors(prev => ({ ...prev, title: '' }))
              }}
              placeholder="팝업 제목을 입력하세요"
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* 팝업 내용 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팝업 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={popupContent}
              onChange={e => {
                setPopupContent(e.target.value)
                setErrors(prev => ({ ...prev, content: '' }))
              }}
              placeholder="팝업 내용을 입력하세요"
              rows={4}
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          {/* 이미지 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지{' '}
              {mode === 'create' && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] w-full max-w-md border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  변경
                </button>
                {errors.image && (
                  <p className="text-sm text-red-500">{errors.image}</p>
                )}
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-full px-4 py-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center space-y-2"
                >
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">이미지 선택</span>
                </button>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                )}
              </div>
            )}
          </div>

          {/* 기간 정보 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value)
                  setErrors(prev => ({ ...prev, startDate: '', endDate: '' }))
                }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value)
                  setErrors(prev => ({ ...prev, endDate: '' }))
                }}
                min={startDate || undefined}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={
                createPopupMutation.isPending || updatePopupMutation.isPending
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                createPopupMutation.isPending || updatePopupMutation.isPending
              }
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create'
                ? createPopupMutation.isPending
                  ? '저장 중...'
                  : '저장'
                : updatePopupMutation.isPending
                  ? '수정 중...'
                  : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PopupModal
