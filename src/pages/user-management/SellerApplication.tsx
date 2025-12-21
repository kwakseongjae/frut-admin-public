import { useState, useEffect, useCallback, useRef } from 'react'
import SearchBar from '@/components/SearchBar'
import SellerApplicationList from '@/components/SellerApplicationList'
import Pagination from '@/components/Pagination'
import { type SellerApplication } from '@/constants/dummy'
import { sellerApi } from '@/lib/api/seller'

const SellerApplication = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'APPROVED' | 'PENDING' | 'REJECTED'
  >('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalApplications, setTotalApplications] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 20

  // API에서 판매자 신청 목록 조회
  const fetchSellerApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: {
        search?: string
        page?: number
        page_size?: number
        status?: 'APPROVED' | 'PENDING' | 'REJECTED'
      } = {
        page: currentPage,
        page_size: itemsPerPage,
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await sellerApi.getSellerApplications(params)

      // API 응답 구조 확인
      const data =
        'data' in response && response.data ? response.data : response

      if (!data || !('results' in data) || !Array.isArray(data.results)) {
        throw new Error('Invalid API response structure')
      }

      // API 응답을 SellerApplication 형식으로 변환
      const mappedApplications: SellerApplication[] = data.results.map(
        item => ({
          id: item.application_id,
          farmName: item.business_name,
          userId: item.email,
          nickname: item.applicant_name,
          requestDate: item.applied_at,
          registrationDate:
            item.status === 'APPROVED' ? item.applied_at : undefined,
          isBusiness: item.file_count > 0, // file_count가 있으면 사업자로 간주
          status: item.status,
          statusDisplay: item.status_display,
        })
      )

      setApplications(mappedApplications)
      const totalCount = data.total_applications || data.count || 0
      setTotalApplications(totalCount)
      setTotalPages(Math.max(1, Math.ceil(totalCount / itemsPerPage)))
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        '판매자 신청 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to fetch seller applications:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, currentPage, statusFilter, itemsPerPage])

  useEffect(() => {
    fetchSellerApplications()
  }, [fetchSellerApplications])

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false)
      }
    }

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // 상태 필터 변경
  const handleStatusFilterChange = (
    status: 'all' | 'APPROVED' | 'PENDING' | 'REJECTED'
  ) => {
    setStatusFilter(status)
    setCurrentPage(1)
    setIsStatusDropdownOpen(false)
  }

  // 상태 필터 표시 텍스트
  const getStatusFilterText = () => {
    switch (statusFilter) {
      case 'all':
        return '전체'
      case 'PENDING':
        return '검토 중'
      case 'APPROVED':
        return '승인'
      case 'REJECTED':
        return '거부'
      default:
        return '전체'
    }
  }

  // 페이지네이션
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 상단 정보 */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="flex items-center gap-4">
          {/* 상태 필터 드롭다운 */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>{getStatusFilterText()}</span>
              <svg
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  isStatusDropdownOpen ? 'rotate-180' : ''
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
            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleStatusFilterChange('all')}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => handleStatusFilterChange('PENDING')}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    statusFilter === 'PENDING'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  검토 중
                </button>
                <button
                  onClick={() => handleStatusFilterChange('APPROVED')}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    statusFilter === 'APPROVED'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  승인
                </button>
                <button
                  onClick={() => handleStatusFilterChange('REJECTED')}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors rounded-b-lg ${
                    statusFilter === 'REJECTED'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  거부
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            판매자 수 : {totalApplications.toLocaleString()}명
          </div>
        </div>
      </div>

      {/* 판매자 신청 리스트 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : (
        <>
          <SellerApplicationList applications={applications} />

          {/* 페이지네이션 */}
          {!loading && totalPages >= 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}

export default SellerApplication
