import { useState, useEffect } from 'react'
import { operationApi } from '@/lib/api/operation'

interface NoticeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; content: string }) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  noticeId?: number | null
}

const NoticeModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode = 'create',
  noticeId = null,
}: NoticeModalProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 수정 모드일 때 상세 정보 불러오기
  useEffect(() => {
    if (isOpen && mode === 'edit' && noticeId) {
      const fetchNoticeDetail = async () => {
        try {
          setLoadingDetail(true)
          const response = await operationApi.getNoticeDetail(noticeId)
          setTitle(response.data.title)
          setContent(response.data.content)
        } catch (err) {
          console.error('Failed to fetch notice detail:', err)
          alert('공지사항 정보를 불러오는데 실패했습니다.')
        } finally {
          setLoadingDetail(false)
        }
      }
      fetchNoticeDetail()
    } else if (isOpen && mode === 'create') {
      // 생성 모드일 때 초기화
      setTitle('')
      setContent('')
    }
  }, [isOpen, mode, noticeId])

  const handleClose = () => {
    if (!isLoading && !loadingDetail) {
      setTitle('')
      setContent('')
      onClose()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim() && !isLoading && !loadingDetail) {
      onSubmit({ title: title.trim(), content: content.trim() })
      if (mode === 'create') {
        setTitle('')
        setContent('')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'edit' ? '공지사항 수정' : '새 공지사항'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'edit'
                  ? '공지사항 내용을 수정합니다.'
                  : '새로운 공지사항을 작성합니다.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
              disabled={isLoading || loadingDetail}
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
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {loadingDetail ? (
            <div className="text-center py-8 text-gray-500">
              공지사항 정보를 불러오는 중...
            </div>
          ) : (
            <>
              {/* 제목 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading || loadingDetail}
                  required
                />
              </div>

              {/* 본문 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="공지사항 내용을 입력하세요"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  disabled={isLoading || loadingDetail}
                  required
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading || loadingDetail}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    loadingDetail ||
                    !title.trim() ||
                    !content.trim()
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? mode === 'edit'
                      ? '저장 중...'
                      : '작성 중...'
                    : mode === 'edit'
                      ? '저장'
                      : '작성'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default NoticeModal

