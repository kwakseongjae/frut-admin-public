import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { type SpecialOfferPurchase } from '@/constants/dummy'
import SearchBar from '@/components/SearchBar'
import { orderApi, type SpecialOrder } from '@/lib/api/order'

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState<SpecialOfferPurchase[]>([])
  const [summary, setSummary] = useState<{
    totalOrders: number
    depositPending: number
    preparing: number
    shipping: number
    delivered: number
    totalSales: number
  }>({
    totalOrders: 0,
    depositPending: 0,
    preparing: 0,
    shipping: 0,
    delivered: 0,
    totalSales: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const paymentDropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false)
      }
      if (
        paymentDropdownRef.current &&
        !paymentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPaymentDropdownOpen(false)
      }
    }

    if (isStatusDropdownOpen || isPaymentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen, isPaymentDropdownOpen])

  // API에서 특가 주문 목록 조회
  const fetchSpecialOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: {
        payment_status?: 'READY' | 'PAID' | 'CANCELLED' | 'FAILED'
        status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
      } = {}

      // 필터 파라미터 설정
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'pending') {
          params.payment_status = 'READY'
        } else if (paymentFilter === 'completed') {
          params.payment_status = 'PAID'
        } else if (paymentFilter === 'failed') {
          params.payment_status = 'FAILED'
        } else if (paymentFilter === 'cancelled') {
          params.payment_status = 'CANCELLED'
        }
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'deposit_pending') {
          params.status = 'PENDING'
        } else if (statusFilter === 'preparing') {
          params.status = 'CONFIRMED'
        } else if (statusFilter === 'shipping') {
          params.status = 'SHIPPED'
        } else if (statusFilter === 'delivered') {
          params.status = 'DELIVERED'
        } else if (statusFilter === 'cancelled') {
          params.status = 'CANCELLED'
        }
      }

      const response = await orderApi.getSpecialOrders(params)

      // API 응답 구조 확인
      if (!response) {
        throw new Error('Invalid API response: response is missing')
      }

      // response가 이미 데이터 구조인 경우 (ApiResponse wrapper가 없는 경우)
      // response.data가 있으면 그것을 사용하고, 없으면 response 자체를 사용
      const ordersData =
        'data' in response && response.data ? response.data : response

      if (
        !ordersData ||
        !('results' in ordersData) ||
        !ordersData.results ||
        !('summary' in ordersData)
      ) {
        console.error('Response structure:', response)
        throw new Error('Invalid API response: results is missing')
      }

      // results 배열 확인
      if (!Array.isArray(ordersData.results)) {
        console.error('Invalid results:', ordersData.results)
        throw new Error('Invalid API response: results is not an array')
      }

      // API 응답을 SpecialOfferPurchase 형식으로 변환
      const mappedPurchases: SpecialOfferPurchase[] = ordersData.results.map(
        (item: SpecialOrder) => {
          try {
            return {
              id: item.id,
              orderNumber: item.order_number || '',
              customerName: item.customer_name || '',
              customerPhone: item.customer_phone || '',
              productName: item.product_name || '',
              quantity: item.quantity || 0,
              totalPrice: item.total_price || 0,
              paymentStatus:
                item.payment_status === 'PAID'
                  ? 'completed'
                  : item.payment_status === 'FAILED'
                    ? 'failed'
                    : item.payment_status === 'CANCELLED'
                      ? 'cancelled'
                      : 'pending',
              orderStatus:
                item.item_status === 'PENDING'
                  ? 'deposit_pending'
                  : item.item_status === 'CONFIRMED'
                    ? 'preparing'
                    : item.item_status === 'SHIPPED'
                      ? 'shipping'
                      : item.item_status === 'DELIVERED'
                        ? 'delivered'
                        : item.item_status === 'CANCELLED'
                          ? 'cancelled'
                          : 'refunded',
              orderDateTime: item.ordered_at
                ? new Date(item.ordered_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '',
            }
          } catch (err) {
            console.error('Error mapping order item:', item, err)
            throw err
          }
        }
      )

      setPurchases(mappedPurchases)

      // Summary 설정
      if (ordersData.summary) {
        setSummary({
          totalOrders: ordersData.summary.total_orders || 0,
          depositPending: ordersData.summary.pending_payment || 0,
          preparing: ordersData.summary.preparing || 0,
          shipping: ordersData.summary.shipping || 0,
          delivered: ordersData.summary.delivered || 0,
          totalSales: ordersData.summary.total_sales || 0,
        })
      } else {
        // Summary가 없으면 기본값 설정
        setSummary({
          totalOrders: mappedPurchases.length,
          depositPending: 0,
          preparing: 0,
          shipping: 0,
          delivered: 0,
          totalSales: 0,
        })
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        '주문 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to fetch special orders:', err)
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, paymentFilter])

  // 컴포넌트 마운트 및 필터 변경 시 조회
  useEffect(() => {
    fetchSpecialOrders()
  }, [fetchSpecialOrders])

  // 요약 통계는 API에서 받아온 summary 사용
  const summaryStats = summary

  // 필터링된 구매 목록
  const filteredPurchases = useMemo(() => {
    let filtered = purchases

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        purchase =>
          purchase.orderNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          purchase.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          purchase.productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        purchase => purchase.orderStatus === statusFilter
      )
    }

    // 결제 필터
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(
        purchase => purchase.paymentStatus === paymentFilter
      )
    }

    return filtered
  }, [purchases, searchQuery, statusFilter, paymentFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handlePaymentStatusChange = async (
    id: number,
    newStatus: 'pending' | 'completed' | 'failed' | 'cancelled'
  ) => {
    // 로컬 상태 매핑을 API 상태로 변환
    const statusMap: Record<
      'pending' | 'completed' | 'failed' | 'cancelled',
      'READY' | 'PAID' | 'FAILED' | 'CANCELLED'
    > = {
      pending: 'READY',
      completed: 'PAID',
      failed: 'FAILED',
      cancelled: 'CANCELLED',
    }

    const apiStatus = statusMap[newStatus]

    try {
      await orderApi.updatePaymentStatus(id, { payment_status: apiStatus })

      // 성공 시 로컬 상태 업데이트
      setPurchases(prev =>
        prev.map(purchase =>
          purchase.id === id
            ? { ...purchase, paymentStatus: newStatus }
            : purchase
        )
      )

      // 목록 새로고침
      await fetchSpecialOrders()
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        '결제 상태 변경에 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to update payment status:', err)
    }
  }

  const handleOrderStatusChange = async (
    id: number,
    newStatus: SpecialOfferPurchase['orderStatus']
  ) => {
    // 로컬 상태 매핑을 API 상태로 변환
    const statusMap: Record<
      SpecialOfferPurchase['orderStatus'],
      | 'PENDING'
      | 'CONFIRMED'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELLED'
      | 'REFUNDED'
    > = {
      deposit_pending: 'PENDING',
      preparing: 'CONFIRMED',
      shipping: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
      refunded: 'REFUNDED',
    }

    const apiStatus = statusMap[newStatus]

    try {
      await orderApi.updateOrderStatus(id, { order_status: apiStatus })

      // 성공 시 로컬 상태 업데이트
      setPurchases(prev =>
        prev.map(purchase =>
          purchase.id === id
            ? { ...purchase, orderStatus: newStatus }
            : purchase
        )
      )

      // 목록 새로고침
      await fetchSpecialOrders()
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        '주문 상태 변경에 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to update order status:', err)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  return (
    <div className="space-y-6">
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

      {/* 요약 카드 */}
      {!loading && (
        <div className="grid grid-cols-6 gap-4">
          {/* 전체 주문 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <div className="text-2xl font-bold text-black">
                  {summaryStats.totalOrders}
                </div>
                <div className="text-xs text-gray-500">총 주문 건수</div>
              </div>
            </div>
          </div>

          {/* 입금대기 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="text-2xl font-bold text-black">
                  {summaryStats.depositPending}
                </div>
                <div className="text-xs text-gray-500">입금 대기중</div>
              </div>
            </div>
          </div>

          {/* 배송준비 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <div>
                <div className="text-2xl font-bold text-black">
                  {summaryStats.preparing}
                </div>
                <div className="text-xs text-gray-500">배송 준비중</div>
              </div>
            </div>
          </div>

          {/* 배송중 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="text-2xl font-bold text-black">
                  {summaryStats.shipping}
                </div>
                <div className="text-xs text-gray-500">배송 진행중</div>
              </div>
            </div>
          </div>

          {/* 배송완료 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <div className="text-2xl font-bold text-black">
                  {summaryStats.delivered}
                </div>
                <div className="text-xs text-gray-500">완료된 주문</div>
              </div>
            </div>
          </div>

          {/* 총 매출 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="text-2xl font-bold text-black">
                  {formatPrice(summaryStats.totalSales)}원
                </div>
                <div className="text-xs text-gray-500">입금완료 기준</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 주문 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          주문 검색 및 필터
        </h2>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="주문번호, 고객명, 상품명으로 검색...."
            />
          </div>
          <div className="flex gap-3">
            {/* 상태 필터 */}
            <div className="relative w-40" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen)
                  setIsPaymentDropdownOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <span className="text-sm text-gray-900">
                  {statusFilter === 'all'
                    ? '전체 상태'
                    : statusFilter === 'deposit_pending'
                      ? '주문접수'
                      : statusFilter === 'preparing'
                        ? '주문확인'
                        : statusFilter === 'shipping'
                          ? '배송중'
                          : statusFilter === 'delivered'
                            ? '배송완료'
                            : statusFilter === 'cancelled'
                              ? '주문취소'
                              : '환불완료'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isStatusDropdownOpen ? 'rotate-180' : ''
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
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    전체 상태
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('deposit_pending')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === 'deposit_pending'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    주문접수
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('preparing')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === 'preparing'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    주문확인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('shipping')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === 'shipping'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    배송중
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('delivered')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === 'delivered'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    배송완료
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('cancelled')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === 'cancelled'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    주문취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('refunded')
                      setIsStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors rounded-b-lg ${
                      statusFilter === 'refunded'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    환불완료
                  </button>
                </div>
              )}
            </div>

            {/* 결제 필터 */}
            <div className="relative w-40" ref={paymentDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentDropdownOpen(!isPaymentDropdownOpen)
                  setIsStatusDropdownOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <span className="text-sm text-gray-900">
                  {paymentFilter === 'all'
                    ? '전체 결제'
                    : paymentFilter === 'pending'
                      ? '결제대기'
                      : paymentFilter === 'completed'
                        ? '결제완료'
                        : paymentFilter === 'failed'
                          ? '결제실패'
                          : '결제취소'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isPaymentDropdownOpen ? 'rotate-180' : ''
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
              {isPaymentDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter('all')
                      setIsPaymentDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      paymentFilter === 'all'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    전체 결제
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter('pending')
                      setIsPaymentDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      paymentFilter === 'pending'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    결제대기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter('completed')
                      setIsPaymentDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      paymentFilter === 'completed'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    결제완료
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter('failed')
                      setIsPaymentDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      paymentFilter === 'failed'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    결제실패
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter('cancelled')
                      setIsPaymentDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors rounded-b-lg ${
                      paymentFilter === 'cancelled'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    결제취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 주문 목록 */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-black mb-1">주문 목록</h2>
            <p className="text-sm text-gray-600">
              총 {filteredPurchases.length}건의 주문이 있습니다.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문정보
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객정보
                  </th>
                  <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품정보
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제상태
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문상태
                  </th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문일시
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map(purchase => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* 주문정보 */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-black">
                          {purchase.orderNumber}
                        </span>
                        <span className="text-sm text-black mt-1">
                          {formatPrice(purchase.totalPrice)}원
                        </span>
                      </div>
                    </td>

                    {/* 고객정보 */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-black font-medium">
                          {purchase.customerName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {purchase.customerPhone}
                        </span>
                      </div>
                    </td>

                    {/* 상품정보 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm text-black">
                            {purchase.productName}
                          </span>
                          <span className="text-xs text-gray-500">
                            수량: {purchase.quantity}개
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 결제상태 */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={purchase.paymentStatus}
                          onChange={e =>
                            handlePaymentStatusChange(
                              purchase.id,
                              e.target.value as
                                | 'pending'
                                | 'completed'
                                | 'failed'
                                | 'cancelled'
                            )
                          }
                          className="w-full px-3 py-1.5 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white whitespace-nowrap"
                        >
                          <option value="pending">결제대기</option>
                          <option value="completed">결제완료</option>
                          <option value="failed">결제실패</option>
                          <option value="cancelled">결제취소</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                        </div>
                      </div>
                    </td>

                    {/* 주문상태 */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={purchase.orderStatus}
                          onChange={e =>
                            handleOrderStatusChange(
                              purchase.id,
                              e.target
                                .value as SpecialOfferPurchase['orderStatus']
                            )
                          }
                          className="w-full px-3 py-1.5 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white whitespace-nowrap"
                        >
                          <option value="deposit_pending">주문접수</option>
                          <option value="preparing">주문확인</option>
                          <option value="shipping">배송중</option>
                          <option value="delivered">배송완료</option>
                          <option value="cancelled">주문취소</option>
                          <option value="refunded">환불완료</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                        </div>
                      </div>
                    </td>

                    {/* 주문일시 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {purchase.orderDateTime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export { PurchaseManagement as Component }
