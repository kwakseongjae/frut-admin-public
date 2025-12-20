import { useState, useEffect, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import Pagination from '@/components/Pagination'
import NoticeModal from '@/components/NoticeModal'
import NoticeDetailModal from '@/components/NoticeDetailModal'
import { operationApi, type Notice } from '@/lib/api/operation'

const NoticeManagement = () => {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const itemsPerPage = 20

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // API 호출 함수
  const fetchNotices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: {
        page?: number
        search?: string
      } = {
        page: currentPage,
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const response = await operationApi.getNotices(params)
      setNotices(response.data.results)
      setTotalCount(response.data.count)
      setTotalPages(Math.ceil(response.data.count / itemsPerPage))
    } catch (err) {
      setError('공지사항 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch notices:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery])

  // 초기 로드 및 페이지/검색 변경 시 API 호출
  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  // 검색 기능 (debounce 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCreateNotice = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmitNotice = async (data: {
    title: string
    content: string
  }) => {
    setIsSubmitting(true)
    try {
      await operationApi.createNotice({
        title: data.title,
        content: data.content,
      })
      // API 호출 후 목록 새로고침
      await fetchNotices()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to create notice:', err)
      alert('공지사항 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateNotice = async (data: {
    title: string
    content: string
  }) => {
    if (!editingNoticeId) return

    setIsUpdating(true)
    try {
      await operationApi.updateNotice(editingNoticeId, {
        title: data.title,
        content: data.content,
      })
      // API 호출 후 목록 새로고침
      await fetchNotices()
      setIsEditModalOpen(false)
      setEditingNoticeId(null)
    } catch (err) {
      console.error('Failed to update notice:', err)
      alert('공지사항 수정에 실패했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleNoticeClick = (id: number) => {
    setSelectedNoticeId(id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedNoticeId(null)
  }

  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingNoticeId(id)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingNoticeId(null)
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      await operationApi.deleteNotice(id)
      // API 호출 후 목록 새로고침
      await fetchNotices()
    } catch (err) {
      console.error('Failed to delete notice:', err)
      alert('공지사항 삭제에 실패했습니다.')
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
          <h1 className="text-2xl font-bold text-gray-900">공지사항 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            {loading
              ? '로딩 중...'
              : `총 ${totalCount.toLocaleString()}개의 공지사항`}
          </p>
        </div>

        {/* 새 공지사항 버튼 */}
        <button
          onClick={handleCreateNotice}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + 새 공지사항
        </button>
      </div>

      {/* 검색창 */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <SearchBar
            onSearch={handleSearch}
            placeholder="제목으로 검색 가능합니다."
          />
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

      {/* 공지사항 리스트 */}
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
                  {notices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        등록된 공지사항이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    notices.map((notice, index) => (
                      <tr
                        key={notice.id}
                        onClick={() => handleNoticeClick(notice.id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${
                            index === 0 ? 'rounded-tl-lg' : ''
                          } ${
                            index === notices.length - 1 ? 'rounded-bl-lg' : ''
                          }`}
                        >
                          {notice.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {notice.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatDate(notice.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {notice.view_count.toLocaleString()}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-center ${
                            index === 0 ? 'rounded-tr-lg' : ''
                          } ${
                            index === notices.length - 1 ? 'rounded-br-lg' : ''
                          }`}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={e => handleEdit(notice.id, e)}
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
                              onClick={e => handleDelete(notice.id, e)}
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

      {/* 새 공지사항 모달 */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitNotice}
        isLoading={isSubmitting}
        mode="create"
      />

      {/* 공지사항 수정 모달 */}
      <NoticeModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateNotice}
        isLoading={isUpdating}
        mode="edit"
        noticeId={editingNoticeId}
      />

      {/* 공지사항 상세 모달 */}
      <NoticeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        noticeId={selectedNoticeId}
      />
    </div>
  )
}

export default NoticeManagement

