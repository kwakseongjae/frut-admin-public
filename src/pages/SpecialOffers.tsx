import { useState } from 'react'
import { dummySpecialOffers, type SpecialOffer } from '@/constants/dummy'
import SpecialOfferModal, {
  type SpecialOfferFormData,
} from '@/components/SpecialOfferModal'

const SpecialOffers = () => {
  const [specialOffers, setSpecialOffers] =
    useState<SpecialOffer[]>(dummySpecialOffers)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStatusToggle = (id: number) => {
    setSpecialOffers(prev =>
      prev.map(offer =>
        offer.id === id ? { ...offer, status: !offer.status } : offer
      )
    )
  }

  const handleEdit = (id: number) => {
    // TODO: Edit functionality
    console.log('Edit special offer:', id)
  }

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setSpecialOffers(prev => prev.filter(offer => offer.id !== id))
    }
  }

  const handleRegisterClick = () => {
    setIsModalOpen(true)
  }

  const handleRegister = (formData: SpecialOfferFormData) => {
    // 새로운 특가 상품 생성
    const newId =
      specialOffers.length > 0
        ? Math.max(...specialOffers.map(o => o.id)) + 1
        : 1

    const newOffer: SpecialOffer = {
      id: newId,
      name: formData.productName,
      category: `${formData.mainCategory} > ${formData.subCategory}`,
      originalPrice: formData.originalPrice,
      discountedPrice: formData.discountedPrice,
      salesPeriodStart: formData.startDate,
      salesPeriodEnd: formData.endDate,
      views: 0,
      orders: 0,
      status: true,
    }

    setSpecialOffers(prev => [...prev, newOffer])
    setIsModalOpen(false)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-black mb-1">특가 상품 목록</h2>
          <p className="text-sm text-gray-600">
            총 {specialOffers.length}개의 특가 상품이 있습니다.
          </p>
        </div>
        <button
          onClick={handleRegisterClick}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#3C82F6' }}
        >
          + 특가 상품 등록
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품정보
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격
              </th>
              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                판매기간
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                성과
              </th>
              <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {specialOffers.map(offer => (
              <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                {/* 상품정보 */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded shrink-0" />
                    <span className="text-sm text-black">{offer.name}</span>
                  </div>
                </td>

                {/* 카테고리 */}
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-black rounded-full">
                    {offer.category}
                  </span>
                </td>

                {/* 가격 */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-red-600">
                      {formatPrice(offer.discountedPrice)}원
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(offer.originalPrice)}원
                    </span>
                  </div>
                </td>

                {/* 판매기간 */}
                <td className="px-6 py-4">
                  <span className="text-sm text-black">
                    {offer.salesPeriodStart} ~ {offer.salesPeriodEnd}
                  </span>
                </td>

                {/* 성과 */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-blue-600">
                      조회 {offer.views.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600">
                      주문 {offer.orders.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* 상태 */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleStatusToggle(offer.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        offer.status ? 'bg-black' : 'bg-gray-300'
                      }`}
                      aria-label={`상태 ${offer.status ? '활성' : '비활성'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          offer.status ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </td>

                {/* 관리 */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(offer.id)}
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
                      onClick={() => handleDelete(offer.id)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* 특가 상품 등록 모달 */}
      <SpecialOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegister}
      />
    </div>
  )
}

export { SpecialOffers as Component }
