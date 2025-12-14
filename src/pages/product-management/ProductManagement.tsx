import { useState, useEffect, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import ProductList from '@/components/ProductList'
import Pagination from '@/components/Pagination'
import { productApi, type Product } from '@/lib/api/product'

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 20

  // API 호출 함수
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: {
        search?: string
        page?: number
        page_size?: number
        ordering?: string
      } = {
        page: currentPage,
        page_size: itemsPerPage,
      }

      // 검색
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      // 정렬
      if (sortColumn) {
        const ordering = sortDirection === 'asc' ? sortColumn : `-${sortColumn}`
        params.ordering = ordering
      }

      const response = await productApi.getProductList(params)
      setProducts(response.data.results)
      setTotalProducts(response.data.count)
      setTotalPages(Math.ceil(response.data.count / itemsPerPage))
    } catch (err) {
      setError('상품 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, sortColumn, sortDirection])

  // 초기 로드 및 필터/정렬/페이지 변경 시 API 호출
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // 검색 기능 (debounce 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

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

      {/* 상품 리스트 */}
      {!loading && !error && (
        <>
          <ProductList
            products={products}
            onSort={handleSort}
            onRefresh={fetchProducts}
          />

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

export default ProductManagement
