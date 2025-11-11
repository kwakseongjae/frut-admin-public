import { useState } from 'react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCategory: (categoryName: string, parentCategoryId?: number) => void
  title: string
  isSubMenu?: boolean
  parentCategories?: Array<{ id: number; name: string }>
}

const CategoryModal = ({
  isOpen,
  onClose,
  onAddCategory,
  title,
  isSubMenu = false,
  parentCategories = [],
}: CategoryModalProps) => {
  const [categoryName, setCategoryName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (categoryName.trim()) {
      if (isSubMenu && selectedParentId) {
        onAddCategory(categoryName.trim(), selectedParentId as number)
      } else {
        onAddCategory(categoryName.trim())
      }
      setCategoryName('')
      setSelectedParentId('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {isSubMenu && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대메뉴 선택
              </label>
              <div className="relative">
                <select
                  value={selectedParentId}
                  onChange={e => setSelectedParentId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                  required
                >
                  <option value="">대메뉴를 선택하세요</option>
                  {parentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isSubMenu ? '소메뉴명' : '대메뉴명'}
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder={
                isSubMenu ? '소메뉴명을 입력하세요' : '대메뉴명을 입력하세요'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
