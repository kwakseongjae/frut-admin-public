import { useState } from 'react'
import BadgeModal from './BadgeModal'
import {
  productApi,
  type Product,
  type ProductBadgeInfo,
} from '@/lib/api/product'

interface ProductListProps {
  products: Product[]
  onSort: (column: string) => void
  onRefresh?: () => void
}

const ProductList = ({ products, onSort, onRefresh }: ProductListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deletingBadgeId, setDeletingBadgeId] = useState<number | null>(null)
  const [togglingProductId, setTogglingProductId] = useState<number | null>(
    null
  )

  const handleBadgeClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleDeleteBadge = async (
    productId: number,
    badgeId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    if (!confirm('뱃지를 삭제하시겠습니까?')) return

    try {
      setDeletingBadgeId(badgeId)
      await productApi.deleteProductBadge(productId, badgeId)
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      console.error('Failed to delete badge:', err)
      alert('뱃지 삭제에 실패했습니다.')
    } finally {
      setDeletingBadgeId(null)
    }
  }

  const handleToggleRecommend = async (
    productId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    try {
      setTogglingProductId(productId)
      await productApi.toggleProductRecommend(productId)
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      console.error('Failed to toggle recommend:', err)
      alert('추천지정 변경에 실패했습니다.')
    } finally {
      setTogglingProductId(null)
    }
  }

  const isBadgeInfo = (
    badge: string | ProductBadgeInfo
  ): badge is ProductBadgeInfo => {
    return typeof badge === 'object' && 'id' in badge && 'badge_id' in badge
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
                    {product.main_image ? (
                      <img
                        src={product.main_image}
                        alt={product.product_name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs text-gray-500">이미지</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.category_name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 판매자 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {product.farm_name}
                </td>

                {/* 가격 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {product.display_price.toLocaleString()}원
                </td>

                {/* 상태 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.status === 'ACTIVE' ? '판매중' : '판매중단'}
                  </span>
                </td>

                {/* 뱃지 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {product.badges.map((badge, index) => {
                        if (isBadgeInfo(badge)) {
                          return (
                            <div
                              key={badge.id}
                              className="relative inline-block group"
                            >
                              <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                {badge.badge_image_url || badge.image_url ? (
                                  <img
                                    src={
                                      badge.badge_image_url || badge.image_url
                                    }
                                    alt={badge.badge_name}
                                    className="w-full h-full object-contain"
                                    onError={e => {
                                      // 이미지 로드 실패 시 첫 글자 표시
                                      const target =
                                        e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (
                                        parent &&
                                        !parent.querySelector(
                                          '.badge-placeholder'
                                        )
                                      ) {
                                        const placeholder =
                                          document.createElement('span')
                                        placeholder.className =
                                          'text-xs text-gray-500 badge-placeholder'
                                        placeholder.textContent =
                                          badge.badge_name.charAt(0)
                                        parent.appendChild(placeholder)
                                      }
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    {badge.badge_name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={e =>
                                  handleDeleteBadge(
                                    product.id,
                                    badge.badge_id,
                                    e
                                  )
                                }
                                disabled={deletingBadgeId === badge.badge_id}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label={`${badge.badge_name} 삭제`}
                              >
                                {deletingBadgeId === badge.badge_id ? (
                                  <svg
                                    className="w-2 h-2 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <span>×</span>
                                )}
                              </button>
                            </div>
                          )
                        } else {
                          // 기존 string 형태의 뱃지 (하위 호환성)
                          return (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                            >
                              {badge}
                            </span>
                          )
                        }
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                {/* 관리 컬럼 - 추천지정과 뱃지 버튼 */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={e => handleToggleRecommend(product.id, e)}
                      disabled={togglingProductId === product.id}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        product.is_recommended
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-700 text-white hover:bg-green-800'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {togglingProductId === product.id
                        ? '처리중...'
                        : product.is_recommended
                          ? '추천지정완료'
                          : '추천지정'}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => handleBadgeClick(product)}
                        className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        뱃지
                        <svg
                          className="w-3 h-3"
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
                      {isModalOpen && selectedProduct?.id === product.id && (
                        <BadgeModal
                          isOpen={isModalOpen}
                          onClose={handleCloseModal}
                          productId={selectedProduct.id}
                          productName={selectedProduct.product_name}
                          onSelectBadge={() => {
                            if (onRefresh) {
                              onRefresh()
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductList
