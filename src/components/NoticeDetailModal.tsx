import { useEffect, useState } from 'react'
import { operationApi, type NoticeDetail } from '@/lib/api/operation'

interface NoticeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  noticeId: number | null
}

const NoticeDetailModal = ({
  isOpen,
  onClose,
  noticeId,
}: NoticeDetailModalProps) => {
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNoticeDetail = async () => {
    if (!noticeId) return

    try {
      setLoading(true)
      setError(null)
      const response = await operationApi.getNoticeDetail(noticeId)
      setNotice(response.data)
    } catch (err) {
      setError('공지사항 상세 정보를 불러오는데 실패했습니다.')
      console.error('Failed to fetch notice detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && noticeId) {
      fetchNoticeDetail()
    } else {
      setNotice(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, noticeId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {loading ? (
                <div className="text-gray-500">로딩 중...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : notice ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {notice.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>작성일: {formatDate(notice.created_at)}</span>
                    <span>|</span>
                    <span>조회수: {notice.view_count.toLocaleString()}</span>
                  </div>
                </>
              ) : null}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              aria-label="닫기"
              disabled={loading}
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
        {!loading && !error && notice && (
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {notice.content}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoticeDetailModal

