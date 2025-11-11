import { useState } from 'react'
import { dummyPopups, type Popup } from '@/constants/dummy'

const PopupManagement = () => {
  const [popups, setPopups] = useState<Popup[]>(dummyPopups)

  const handleStatusToggle = (id: number) => {
    setPopups(prev =>
      prev.map(popup =>
        popup.id === id ? { ...popup, isActive: !popup.isActive } : popup
      )
    )
  }

  const handleEdit = (id: number) => {
    // TODO: 팝업 수정 기능
    console.log('Edit popup:', id)
  }

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setPopups(prev => prev.filter(popup => popup.id !== id))
    }
  }

  const handleCreateClick = () => {
    // TODO: 팝업 생성 기능
    console.log('Create new popup')
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">팝업 관리</h1>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span>팝업 생성</span>
        </button>
      </div>

      {/* 팝업 카드 목록 */}
      <div className="grid grid-cols-3 gap-4">
        {popups.map(popup => (
          <div
            key={popup.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* 이미지 플레이스홀더 */}
            <div className="relative">
              {popup.isActive ? (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                  <span className="text-white font-semibold">비활성</span>
                </div>
              )}
              {/* 상태 태그 */}
              <div className="absolute top-2 right-2">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                    popup.isActive
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {popup.isActive ? '활성' : '비활성'}
                </span>
              </div>
            </div>

            {/* 팝업 정보 */}
            <div className="p-6">
              {/* 제목 및 토글 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-1">
                    {popup.title}
                  </h3>
                  <p className="text-sm text-gray-500">{popup.description}</p>
                </div>
                <button
                  onClick={() => handleStatusToggle(popup.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ml-4 ${
                    popup.isActive ? 'bg-black' : 'bg-gray-300'
                  }`}
                  aria-label={`팝업 ${popup.isActive ? '활성' : '비활성'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      popup.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 기간 정보 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    시작일:
                  </span>
                  <span className="text-sm text-black">{popup.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    종료일:
                  </span>
                  <span className="text-sm text-black">{popup.endDate}</span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(popup.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>수정</span>
                </button>
                <button
                  onClick={() => handleDelete(popup.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  aria-label="삭제"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { PopupManagement as Component }
