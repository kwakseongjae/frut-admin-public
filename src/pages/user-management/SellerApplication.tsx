import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import SellerApplicationList from '@/components/SellerApplicationList'
import Pagination from '@/components/Pagination'
import {
  dummySellerApplications,
  type SellerApplication,
} from '@/constants/dummy'

const SellerApplication = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<
    SellerApplication[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [, setSearchQuery] = useState('')

  const itemsPerPage = 10
  const totalApplications = 125

  // 더미 데이터 로드
  useEffect(() => {
    setApplications(dummySellerApplications)
    setFilteredApplications(dummySellerApplications)
  }, [])

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredApplications(applications)
    } else {
      const filtered = applications.filter(
        application =>
          application.farmName.toLowerCase().includes(query.toLowerCase()) ||
          application.userId.toLowerCase().includes(query.toLowerCase()) ||
          application.nickname.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredApplications(filtered)
    }
    setCurrentPage(1)
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplications = filteredApplications.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
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
      <SellerApplicationList applications={currentApplications} />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export default SellerApplication
