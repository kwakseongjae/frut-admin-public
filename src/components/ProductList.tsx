import { useState } from 'react'
import BadgeModal from './BadgeModal'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  isRecommended: boolean
  badge: string
  seller: string
  createdAt: string
  status: 'active' | 'inactive'
}

interface ProductListProps {
  products: Product[]
  onSort: (column: string) => void
}

const ProductList = ({ products, onSort }: ProductListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleBadgeClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleAddBadge = (badgeName: string) => {
    // 여기서 실제 뱃지 추가 로직을 구현할 수 있습니다
    console.log(
      `Adding badge "${badgeName}" to product "${selectedProduct?.name}"`
    )
    // 예: API 호출 또는 상태 업데이트
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                상품
              </th>
              <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                판매자
              </th>
              <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <button
                  onClick={() => onSort('price')}
                  className="flex items-center justify-center space-x-1 hover:text-gray-700 mx-auto"
                >
                  <span>가격</span>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </th>
              <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                상태
              </th>
              <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                뱃지
              </th>
              <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 cursor-pointer">
                {/* 상품 컬럼 - 이미지와 상품명, 카테고리 */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500">이미지</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.category}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 판매자 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {product.seller}
                </td>

                {/* 가격 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {product.price.toLocaleString()}원
                </td>

                {/* 상태 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.status === 'active' ? '판매중' : '판매중단'}
                  </span>
                </td>

                {/* 뱃지 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {product.badge}
                  </span>
                </td>

                {/* 관리 컬럼 - 추천지정과 뱃지 버튼 */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex space-x-1">
                    <button
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        product.isRecommended
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      추천지정
                    </button>
                    <button
                      onClick={() => handleBadgeClick(product)}
                      className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      뱃지
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Badge Modal */}
      {selectedProduct && (
        <BadgeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productName={selectedProduct.name}
          onAddBadge={handleAddBadge}
        />
      )}
    </div>
  )
}

export default ProductList
