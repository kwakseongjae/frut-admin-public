import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import ProductList from '@/components/ProductList'
import Pagination from '@/components/Pagination'
import { dummyProducts, type Product } from '@/constants/dummy'

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const itemsPerPage = 10
  const totalProducts = 1250

  // 더미 데이터 로드
  useEffect(() => {
    setProducts(dummyProducts)
    setFilteredProducts(dummyProducts)
  }, [])

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.seller.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredProducts(filtered)
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

    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue: string | number | boolean = a[column as keyof Product]
      let bValue: string | number | boolean = b[column as keyof Product]

      if (column === 'price' || column === 'stock') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (column === 'createdAt') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(sorted)
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <SearchBar
            onSearch={handleSearch}
            placeholder="상품명, 판매자명, 카테고리로 검색 가능합니다."
          />
        </div>
        <div className="text-sm text-gray-600">
          전체 상품 : {totalProducts.toLocaleString()}개
        </div>
      </div>

      {/* 상품 리스트 */}
      <ProductList products={currentProducts} onSort={handleSort} />

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

export default ProductManagement
