import { useState, useEffect, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import Pagination from '@/components/Pagination'
import FAQModal from '@/components/FAQModal'
import FAQDetailModal from '@/components/FAQDetailModal'
import { operationApi, type FAQ } from '@/lib/api/operation'

const FAQManagement = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [faqTypeFilter, setFaqTypeFilter] = useState<string>('all')
  const [faqTypeDropdownOpen, setFaqTypeDropdownOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const itemsPerPage = 20

  // FAQ 타입 한글 변환
  const getFaqTypeText = () => {
    switch (faqTypeFilter) {
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
      default:
        return '전체'
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // API 호출 함수
  const fetchFAQs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: {
        faq_type?: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
        page?: number
        search?: string
      } = {
        page: currentPage,
      }

      if (faqTypeFilter !== 'all') {
        params.faq_type = faqTypeFilter as
          | 'ACCOUNT'
          | 'ORDER'
          | 'DELIVERY'
          | 'CANCEL'
          | 'ETC'
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const response = await operationApi.getFAQs(params)
      setFaqs(response.data.results)
      setTotalCount(response.data.count)
      setTotalPages(Math.ceil(response.data.count / itemsPerPage))
    } catch (err) {
      setError('FAQ 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch FAQs:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, faqTypeFilter])

  // 초기 로드 및 페이지/검색/필터 변경 시 API 호출
  useEffect(() => {
    fetchFAQs()
  }, [fetchFAQs])

  // 검색 기능 (debounce 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.faq-type-dropdown')) {
        setFaqTypeDropdownOpen(false)
      }
    }

    if (faqTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [faqTypeDropdownOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFaqTypeFilterChange = (type: string) => {
    setFaqTypeFilter(type)
    setFaqTypeDropdownOpen(false)
    setCurrentPage(1)
  }

  const handleCreateFAQ = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmitFAQ = async (data: {
    faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
    title: string
    content: string
  }) => {
    setIsSubmitting(true)
    try {
      await operationApi.createFAQ({
        faq_type: data.faq_type,
        title: data.title,
        content: data.content,
      })
      // API 호출 후 목록 새로고침
      await fetchFAQs()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to create FAQ:', err)
      alert('FAQ 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateFAQ = async (data: {
    faq_type: 'ACCOUNT' | 'ORDER' | 'DELIVERY' | 'CANCEL' | 'ETC'
    title: string
    content: string
  }) => {
    if (!editingFaqId) return

    setIsUpdating(true)
    try {
      await operationApi.updateFAQ(editingFaqId, {
        faq_type: data.faq_type,
        title: data.title,
        content: data.content,
      })
      // API 호출 후 목록 새로고침
      await fetchFAQs()
      setIsEditModalOpen(false)
      setEditingFaqId(null)
    } catch (err) {
      console.error('Failed to update FAQ:', err)
      alert('FAQ 수정에 실패했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFAQClick = (id: number) => {
    setSelectedFaqId(id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedFaqId(null)
  }

  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingFaqId(id)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingFaqId(null)
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      await operationApi.deleteFAQ(id)
      // API 호출 후 목록 새로고침
      await fetchFAQs()
    } catch (err) {
      console.error('Failed to delete FAQ:', err)
      alert('FAQ 삭제에 실패했습니다.')
    }
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6 bg-white rounded-[14px] p-5">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자주 묻는 질문 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            {loading
              ? '로딩 중...'
              : `총 ${totalCount.toLocaleString()}개의 FAQ`}
          </p>
        </div>

        {/* 새 FAQ 버튼 */}
        <button
          onClick={handleCreateFAQ}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + 새 FAQ 등록
        </button>
      </div>

      {/* 검색창 및 필터 */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            onSearch={handleSearch}
            placeholder="제목으로 검색 가능합니다."
          />
        </div>

        {/* FAQ 타입 필터 */}
        <div className="relative faq-type-dropdown">
          <button
            type="button"
            onClick={() => {
              setFaqTypeDropdownOpen(!faqTypeDropdownOpen)
            }}
            className="flex items-center gap-2 px-4 py-2 pr-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span className="text-sm font-medium text-gray-700">
              {getFaqTypeText()}
            </span>
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
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                type="button"
                onClick={() => handleFaqTypeFilterChange('all')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  faqTypeFilter === 'all'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => handleFaqTypeFilterChange('ACCOUNT')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  faqTypeFilter === 'ACCOUNT'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                회원정보
              </button>
              <button
                type="button"
                onClick={() => handleFaqTypeFilterChange('ORDER')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  faqTypeFilter === 'ORDER'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                주문/결제
              </button>
              <button
                type="button"
                onClick={() => handleFaqTypeFilterChange('DELIVERY')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  faqTypeFilter === 'DELIVERY'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                배송
              </button>
              <button
                type="button"
                onClick={() => handleFaqTypeFilterChange('CANCEL')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  faqTypeFilter === 'CANCEL'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                취소/환불
              </button>
              <button
                type="button"
                onClick={() => handleFaqTypeFilterChange('ETC')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  faqTypeFilter === 'ETC'
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

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      )}

      {/* FAQ 리스트 */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-16 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      제목
                    </th>
                    <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      작성일
                    </th>
                    <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      조회수
                    </th>
                    <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faqs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        등록된 FAQ가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    faqs.map((faq, index) => (
                      <tr
                        key={faq.id}
                        onClick={() => handleFAQClick(faq.id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${
                            index === 0 ? 'rounded-tl-lg' : ''
                          } ${
                            index === faqs.length - 1 ? 'rounded-bl-lg' : ''
                          }`}
                        >
                          {faq.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {faq.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatDate(faq.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {faq.view_count.toLocaleString()}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-center ${
                            index === 0 ? 'rounded-tr-lg' : ''
                          } ${
                            index === faqs.length - 1 ? 'rounded-br-lg' : ''
                          }`}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={e => handleEdit(faq.id, e)}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              aria-label="수정"
                            >
                              <svg
                                className="w-4 h-4 text-gray-700"
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
                            </button>
                            <button
                              onClick={e => handleDelete(faq.id, e)}
                              className="p-2 bg-red-100 hover:bg-red-200 rounded transition-colors"
                              aria-label="삭제"
                            >
                              <svg
                                className="w-4 h-4 text-red-700"
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* 새 FAQ 모달 */}
      <FAQModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitFAQ}
        isLoading={isSubmitting}
        mode="create"
      />

      {/* FAQ 수정 모달 */}
      <FAQModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateFAQ}
        isLoading={isUpdating}
        mode="edit"
        faqId={editingFaqId}
      />

      {/* FAQ 상세 모달 */}
      <FAQDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        faqId={selectedFaqId}
      />
    </div>
  )
}

export default FAQManagement
