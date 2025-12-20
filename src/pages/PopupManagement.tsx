import { useState } from 'react'
import PopupModal from '@/components/PopupModal'
import {
  usePopups,
  useTogglePopupActive,
  useDeletePopup,
} from '@/hooks/usePopup'
import type { Popup } from '@/lib/api/popup'

const PopupManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null)
  const { data: popupsResponse, isLoading, error } = usePopups()
  const togglePopupMutation = useTogglePopupActive()
  const deletePopupMutation = useDeletePopup()

  const popups = popupsResponse?.data?.results || []

  const handleStatusToggle = (id: number) => {
    togglePopupMutation.mutate(id)
  }

  const handleEdit = (id: number) => {
    const popup = popups.find(p => p.id === id)
    if (popup) {
      setEditingPopup(popup)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePopupMutation.mutate(id)
    }
  }

  const handleCreateClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingPopup(null)
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-end items-center">
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">
            팝업 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      ) : popups.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">등록된 팝업이 없습니다.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popups.map(popup => (
            <div
              key={popup.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* 이미지 */}
              <div className="relative aspect-[4/3]">
                {popup.popup_image ? (
                  <>
                    <img
                      src={popup.popup_image}
                      alt={popup.popup_title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (
                          parent &&
                          !parent.querySelector('.image-placeholder')
                        ) {
                          const placeholder = document.createElement('div')
                          placeholder.className =
                            'image-placeholder w-full h-full bg-gray-200 flex items-center justify-center'
                          placeholder.innerHTML = `
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          `
                          parent.appendChild(placeholder)
                        }
                      }}
                    />
                    {!popup.is_active && (
                      <div className="absolute inset-0 bg-black/60" />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
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
                )}
                {/* 상태 태그 */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-black text-white">
                    {popup.is_active ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              {/* 팝업 정보 */}
              <div className="p-6">
                {/* 이벤트 명 및 토글 */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-black">
                    {popup.popup_title}
                  </h3>
                  <button
                    onClick={() => handleStatusToggle(popup.id)}
                    disabled={togglePopupMutation.isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      popup.is_active ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={`팝업 ${popup.is_active ? '활성' : '비활성'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        popup.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 이벤트 내용 */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{popup.popup_content}</p>
                </div>

                {/* 기간 정보 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      시작일
                    </span>
                    <span className="text-sm text-black">
                      {popup.start_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      종료일
                    </span>
                    <span className="text-sm text-black">{popup.end_date}</span>
                  </div>
                </div>

                {/* 연결 URL */}
                {popup.popup_url && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 block mb-1">
                      연결 URL
                    </span>
                    <a
                      href={popup.popup_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      <span className="truncate max-w-[200px]">
                        {popup.popup_url}
                      </span>
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}

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
                    disabled={deletePopupMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}

      {/* 팝업 생성 모달 */}
      <PopupModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode="create"
      />

      {/* 팝업 수정 모달 */}
      <PopupModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        popup={editingPopup}
      />
    </div>
  )
}

export { PopupManagement as Component }
