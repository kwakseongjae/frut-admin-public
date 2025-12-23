import { useState, useEffect } from 'react'

interface RecommendedSearchTermModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (term: string) => void
  isLoading?: boolean
  error?: string | null
}

const RecommendedSearchTermModal = ({
  isOpen,
  onClose,
  onAdd,
  isLoading = false,
  error,
}: RecommendedSearchTermModalProps) => {
  const [term, setTerm] = useState('')

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setTerm('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (term.trim() && !isLoading) {
      onAdd(term.trim())
      // 성공 시 모달 닫기는 부모 컴포넌트에서 처리
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTerm('')
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
          <h2 className="text-xl font-semibold text-gray-900">
            추천 검색어 추가
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색어
            </label>
            <input
              type="text"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="검색어를 입력하세요 (최대 100자)"
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {term.length}/100자
            </p>
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
              {isLoading ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecommendedSearchTermModal

