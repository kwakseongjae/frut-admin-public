import { useState, useEffect, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import SellerApplicationList from '@/components/SellerApplicationList'
import Pagination from '@/components/Pagination'
import { type SellerApplication } from '@/constants/dummy'
import { sellerApi } from '@/lib/api/seller'

const SellerApplication = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalApplications, setTotalApplications] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 10

  // API에서 판매자 신청 목록 조회
  const fetchSellerApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: { search?: string } = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
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
        })
      )

      setApplications(mappedApplications)
      setTotalApplications(data.total_applications || data.count || 0)
      setTotalPages(
        Math.max(
          1,
          Math.ceil((data.total_applications || data.count || 0) / itemsPerPage)
        )
      )
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
  }, [searchQuery])

  useEffect(() => {
    fetchSellerApplications()
  }, [fetchSellerApplications])

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // 페이지네이션
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplications = applications.slice(startIndex, endIndex)

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
        <div className="text-sm text-gray-600">
          판매자 수 : {totalApplications.toLocaleString()}명
        </div>
      </div>

      {/* 판매자 신청 리스트 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : (
        <>
          <SellerApplicationList applications={currentApplications} />

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
