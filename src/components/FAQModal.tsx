import { useState, useEffect } from 'react'
import { operationApi } from '@/lib/api/operation'

interface FAQModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
    title: string
    content: string
  }) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  faqId?: number | null
}

const FAQModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode = 'create',
  faqId = null,
}: FAQModalProps) => {
  const [faqType, setFaqType] = useState<
    'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
  >('ETC')
  const [faqTypeDropdownOpen, setFaqTypeDropdownOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 수정 모드일 때 상세 정보 불러오기
  useEffect(() => {
    if (isOpen && mode === 'edit' && faqId) {
      const fetchFAQDetail = async () => {
        try {
          setLoadingDetail(true)
          const response = await operationApi.getFAQDetail(faqId)
          setFaqType(response.data.faq_type)
          setTitle(response.data.title)
          setContent(response.data.content)
        } catch (err) {
          console.error('Failed to fetch FAQ detail:', err)
          alert('FAQ 정보를 불러오는데 실패했습니다.')
        } finally {
          setLoadingDetail(false)
        }
      }
      fetchFAQDetail()
    } else if (isOpen && mode === 'create') {
      // 생성 모드일 때 초기화
      setFaqType('ETC')
      setTitle('')
      setContent('')
    }
  }, [isOpen, mode, faqId])

  // FAQ 타입 한글 변환
  const getFaqTypeText = () => {
    switch (faqType) {
      case 'ACCOUNT':
        return '회원정보'
      case 'ORDER':
        return '주문/결제'
      case 'DELIVERY':
        return '배송'
      case 'CANCEL':
        return '취소/환불'
      case 'ETC':
        return '기타'
    }
  }

  const handleClose = () => {
    if (!isLoading && !loadingDetail) {
      setFaqType('ETC')
      setTitle('')
      setContent('')
      setFaqTypeDropdownOpen(false)
      onClose()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim() && !isLoading && !loadingDetail) {
      onSubmit({
        faq_type: faqType,
        title: title.trim(),
        content: content.trim(),
      })
      if (mode === 'create') {
        setFaqType('ETC')
        setTitle('')
        setContent('')
      }
    }
  }

  // 외부 클릭 시 드롭다운 닫기
  const handleClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.faq-type-dropdown')) {
      setFaqTypeDropdownOpen(false)
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
                {mode === 'edit' ? 'FAQ 수정' : '새 FAQ'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'edit'
                  ? 'FAQ 내용을 수정합니다.'
                  : '새로운 FAQ를 작성합니다.'}
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
        <form onSubmit={handleSubmit} className="px-6 py-6" onClick={handleClickOutside}>
          {loadingDetail ? (
            <div className="text-center py-8 text-gray-500">
              FAQ 정보를 불러오는 중...
            </div>
          ) : (
            <>
              {/* 질문 유형 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 유형
                </label>
                <div className="relative faq-type-dropdown">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setFaqTypeDropdownOpen(!faqTypeDropdownOpen)
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading || loadingDetail}
                  >
                    <span className="text-sm text-gray-700">{getFaqTypeText()}</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        faqTypeDropdownOpen ? 'rotate-180' : ''
                      }`}
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
                  </button>
                  {faqTypeDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setFaqType('ACCOUNT')
                          setFaqTypeDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          faqType === 'ACCOUNT'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        회원정보
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setFaqType('ORDER')
                          setFaqTypeDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          faqType === 'ORDER'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        주문/결제
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setFaqType('DELIVERY')
                          setFaqTypeDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          faqType === 'DELIVERY'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        배송
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setFaqType('CANCEL')
                          setFaqTypeDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          faqType === 'CANCEL'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        취소/환불
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setFaqType('ETC')
                          setFaqTypeDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          faqType === 'ETC'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        기타
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 질문 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="질문을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading || loadingDetail}
                  required
                />
              </div>

              {/* 답변 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답변
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="답변을 입력하세요"
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

export default FAQModal

