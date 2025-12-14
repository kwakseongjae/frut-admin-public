interface CategoryDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isMainCategory: boolean
  isLoading?: boolean
}

const CategoryDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isMainCategory,
  isLoading = false,
}: CategoryDeleteModalProps) => {
  const handleClose = () => {
    if (!isLoading) {
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
          <h2 className="text-xl font-semibold text-gray-900">카테고리 삭제</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-lg text-gray-700">
            정말 삭제하시겠습니까?
            {isMainCategory && (
              <>
                <br />
                <span className="text-base">대메뉴 삭제 시 모든 하위 소메뉴도 함께 삭제됩니다.</span>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 space-x-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryDeleteModal

