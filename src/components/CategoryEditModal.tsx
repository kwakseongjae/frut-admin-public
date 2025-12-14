import { useState, useEffect } from 'react'

interface CategoryEditModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateCategory: (categoryName: string) => void
  title: string
  currentName: string
  isLoading?: boolean
  error?: string | null
}

const CategoryEditModal = ({
  isOpen,
  onClose,
  onUpdateCategory,
  title,
  currentName,
  isLoading = false,
  error,
}: CategoryEditModalProps) => {
  const [categoryName, setCategoryName] = useState('')

  // 모달이 열릴 때 현재 이름으로 초기화
  useEffect(() => {
    if (isOpen) {
      setCategoryName(currentName)
    }
  }, [isOpen, currentName])

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setCategoryName('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (categoryName.trim() && !isLoading) {
      onUpdateCategory(categoryName.trim())
      // 성공 시 모달 닫기는 부모 컴포넌트에서 처리
    }
  }

  // 모달이 닫힐 때 폼 초기화
  const handleClose = () => {
    if (!isLoading) {
      setCategoryName('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리명
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="카테고리명을 입력하세요"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryEditModal

