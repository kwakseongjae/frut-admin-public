import { useState } from 'react'

interface BadgeModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  onAddBadge: (badgeName: string) => void
}

const BadgeModal = ({ isOpen, onClose, onAddBadge }: BadgeModalProps) => {
  const [selectedBadge, setSelectedBadge] = useState('')

  const badgeOptions = [
    '신상품',
    '인기상품',
    '할인상품',
    '추천상품',
    '베스트',
    '신선',
    '유기농',
    '무농약',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedBadge) {
      onAddBadge(selectedBadge)
      setSelectedBadge('')
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
          <h2 className="text-xl font-semibold text-gray-900">뱃지 추가</h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              뱃지명
            </label>
            <div className="relative">
              <select
                value={selectedBadge}
                onChange={e => setSelectedBadge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                required
              >
                <option value="">뱃지를 선택하세요</option>
                {badgeOptions.map(badge => (
                  <option key={badge} value={badge}>
                    {badge}
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

export default BadgeModal
