import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import UserList from '@/components/UserList'
import Pagination from '@/components/Pagination'
import { dummyUsers, type User } from '@/constants/dummy'

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const itemsPerPage = 10
  const totalUsers = 12543

  // 더미 데이터 로드
  useEffect(() => {
    setUsers(dummyUsers)
    setFilteredUsers(dummyUsers)
  }, [])

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.userId.toLowerCase().includes(query.toLowerCase()) ||
          user.nickname.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
    setCurrentPage(1)
  }

  // 정렬 기능
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }

    const sorted = [...filteredUsers].sort((a, b) => {
      let aValue: string | number | boolean = a[column as keyof User]
      let bValue: string | number | boolean = b[column as keyof User]

      if (column === 'purchaseCount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(sorted)
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

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
          전체 유저 : {totalUsers.toLocaleString()}명
        </div>
      </div>

      {/* 유저 리스트 */}
      <UserList users={currentUsers} onSort={handleSort} />

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

export { UserManagement as Component }
