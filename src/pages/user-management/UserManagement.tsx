import { useState, useEffect, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import UserList from '@/components/UserList'
import Pagination from '@/components/Pagination'
import { userApi, type User } from '@/lib/api/user'

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [userTypeDropdownOpen, setUserTypeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 20

  // API 호출 함수
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: {
        search?: string
        user_type?: 'SELLER' | 'BUYER' | 'ADMIN'
        status?: 'ACTIVE' | 'BLOCKED' | 'WITHDRAWN'
        ordering?: 'date_joined' | '-date_joined' | 'name' | '-name'
        page?: number
        page_size?: number
      } = {
        page: currentPage,
        page_size: itemsPerPage,
      }

      // 검색
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      // 필터링
      if (userTypeFilter !== 'all') {
        params.user_type = userTypeFilter as 'SELLER' | 'BUYER' | 'ADMIN'
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter as 'ACTIVE' | 'BLOCKED' | 'WITHDRAWN'
      }

      // 정렬
      if (sortColumn) {
        const ordering = sortDirection === 'asc' ? sortColumn : `-${sortColumn}`
        params.ordering = ordering as
          | 'date_joined'
          | '-date_joined'
          | 'name'
          | '-name'
      }

      const response = await userApi.getUserList(params)
      setUsers(response.data.results)
      setTotalUsers(response.data.total_users)
      setTotalPages(Math.ceil(response.data.count / itemsPerPage))
    } catch (err) {
      setError('유저 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    searchQuery,
    userTypeFilter,
    statusFilter,
    sortColumn,
    sortDirection,
  ])

  // 초기 로드 및 필터/정렬/페이지 변경 시 API 호출
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
      if (
        !target.closest('.user-type-dropdown') &&
        !target.closest('.status-dropdown')
      ) {
        setUserTypeDropdownOpen(false)
        setStatusDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // 정렬 기능
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 필터 변경 핸들러
  const handleUserTypeFilterChange = (value: string) => {
    setUserTypeFilter(value)
    setUserTypeDropdownOpen(false)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setStatusDropdownOpen(false)
    setCurrentPage(1)
  }

  // 필터 옵션 텍스트
  const getUserTypeText = () => {
    switch (userTypeFilter) {
      case 'SELLER':
        return '판매자'
      case 'BUYER':
        return '소비자'
      default:
        return '유저 타입'
    }
  }

  const getStatusText = () => {
    switch (statusFilter) {
      case 'ACTIVE':
        return '활성'
      case 'BLOCKED':
        return '차단'
      case 'WITHDRAWN':
        return '탈퇴'
      default:
        return '상태'
    }
  }

  return (
    <div className="space-y-6">
      {/* 상단 정보 및 필터 */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <SearchBar
              onSearch={handleSearch}
              placeholder="이름, 아이디, 이메일로 검색 가능합니다."
            />
          </div>
          <div className="text-sm text-gray-600">
            전체 유저 : {totalUsers.toLocaleString()}명
          </div>
        </div>

        {/* 필터 */}
        <div className="flex justify-end gap-3">
          {/* 유저 타입 필터 */}
          <div className="relative user-type-dropdown">
            <button
              type="button"
              onClick={() => {
                setUserTypeDropdownOpen(!userTypeDropdownOpen)
                setStatusDropdownOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="text-sm font-medium text-gray-700">
                {getUserTypeText()}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  userTypeDropdownOpen ? 'rotate-180' : ''
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
            {userTypeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => handleUserTypeFilterChange('all')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    userTypeFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeFilterChange('SELLER')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    userTypeFilter === 'SELLER'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  판매자
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeFilterChange('BUYER')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    userTypeFilter === 'BUYER'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  소비자
                </button>
              </div>
            )}
          </div>

          {/* 상태 필터 */}
          <div className="relative status-dropdown">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen)
                setUserTypeDropdownOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="text-sm font-medium text-gray-700">
                {getStatusText()}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  statusDropdownOpen ? 'rotate-180' : ''
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
            {statusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('all')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    statusFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('ACTIVE')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  활성
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('BLOCKED')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    statusFilter === 'BLOCKED'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  차단
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('WITHDRAWN')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    statusFilter === 'WITHDRAWN'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  탈퇴
                </button>
              </div>
            )}
          </div>
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

      {/* 유저 리스트 */}
      {!loading && !error && (
        <>
          <UserList users={users} onSort={handleSort} />

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
    </div>
  )
}

export { UserManagement as Component }
