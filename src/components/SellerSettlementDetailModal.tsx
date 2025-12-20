import { useEffect, useState } from 'react'
import {
  settlementApi,
  type SellerSettlementDetail,
  type OrderItem,
} from '@/lib/api/settlement'

interface SellerSettlementDetailModalProps {
  isOpen: boolean
  onClose: () => void
  settlementId: number | null
}

const SellerSettlementDetailModal = ({
  isOpen,
  onClose,
  settlementId,
}: SellerSettlementDetailModalProps) => {
  const [detail, setDetail] = useState<SellerSettlementDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = async () => {
    if (!settlementId) return

    try {
      setLoading(true)
      setError(null)
      const response =
        await settlementApi.getSellerSettlementDetail(settlementId)

      const data =
        'data' in response && response.data ? response.data : response

      if (!data || !('bank_info' in data) || !('order_items' in data)) {
        throw new Error('Invalid API response structure')
      }

      setDetail(data)
    } catch (err) {
      setError('상세 정보를 불러오는데 실패했습니다.')
      console.error('Failed to fetch settlement detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && settlementId) {
      fetchDetail()
    } else {
      setDetail(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, settlementId])

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDeliveryStatusBadge = (
    deliveryStatus: OrderItem['delivery_status']
  ) => {
    if (deliveryStatus === 'DELIVERED') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-green-700 text-white">
          배송완료
        </span>
      )
    }

    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
        배송중
      </span>
    )
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[900px] max-w-[90vw] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {detail?.farm_name || '상세 정보'} 상세 정보
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                계좌 정보로 판매 내역을 확인할 수 있습니다.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : detail ? (
            <div className="space-y-6">
              {/* 계좌 정보 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  계좌 정보
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      은행명
                    </label>
                    <div className="text-sm text-black">
                      {detail.bank_info.bank_name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      계좌번호
                    </label>
                    <div className="text-sm text-black">
                      {detail.bank_info.account_number}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      예금주명
                    </label>
                    <div className="text-sm text-black">
                      {detail.bank_info.account_holder}
                    </div>
                  </div>
                </div>
              </div>

              {/* 판매 내역 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    판매 내역
                  </h3>
                  <p className="text-sm text-gray-500">
                    {detail.period_type_display} 정산 기간의 판매 내역입니다.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상품
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          선택 옵션
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          판매일
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          구매자
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          수량
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          가격
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          배송상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detail.order_items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            판매 내역이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        detail.order_items.map(item => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* 상품 */}
                            <td className="px-4 py-3 text-sm text-black">
                              {item.product_name}
                            </td>

                            {/* 선택 옵션 */}
                            <td className="px-4 py-3 text-sm text-gray-500">
                              -
                            </td>

                            {/* 판매일 */}
                            <td className="px-4 py-3 text-sm text-black">
                              {formatDate(item.ordered_at)}
                            </td>

                            {/* 구매자 */}
                            <td className="px-4 py-3 text-sm text-black">-</td>

                            {/* 수량 */}
                            <td className="px-4 py-3 text-sm text-black text-right">
                              {item.quantity}개
                            </td>

                            {/* 가격 */}
                            <td className="px-4 py-3 text-sm text-black text-right">
                              {formatPrice(item.total_price)}원
                            </td>

                            {/* 배송상태 */}
                            <td className="px-4 py-3 text-right">
                              {getDeliveryStatusBadge(item.delivery_status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SellerSettlementDetailModal





