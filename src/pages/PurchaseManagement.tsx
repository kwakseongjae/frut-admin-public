import { useState, useMemo } from 'react'
import {
  dummySpecialOfferPurchases,
  type SpecialOfferPurchase,
} from '@/constants/dummy'
import SearchBar from '@/components/SearchBar'

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState<SpecialOfferPurchase[]>(
    dummySpecialOfferPurchases
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  // 요약 통계 계산
  const summaryStats = useMemo(() => {
    const totalOrders = purchases.length
    const depositPending = purchases.filter(
      p => p.orderStatus === 'deposit_pending'
    ).length
    const preparing = purchases.filter(
      p => p.orderStatus === 'preparing'
    ).length
    const shipping = purchases.filter(p => p.orderStatus === 'shipping').length
    const delivered = purchases.filter(
      p => p.orderStatus === 'delivered'
    ).length
    const totalSales = purchases
      .filter(p => p.paymentStatus === 'completed')
      .reduce((sum, p) => sum + p.totalPrice, 0)

    return {
      totalOrders,
      depositPending,
      preparing,
      shipping,
      delivered,
      totalSales,
    }
  }, [purchases])

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

  const handlePaymentStatusChange = (
    id: number,
    newStatus: 'pending' | 'completed'
  ) => {
    setPurchases(prev =>
      prev.map(purchase =>
        purchase.id === id
          ? { ...purchase, paymentStatus: newStatus }
          : purchase
      )
    )
  }

  const handleOrderStatusChange = (
    id: number,
    newStatus: SpecialOfferPurchase['orderStatus']
  ) => {
    setPurchases(prev =>
      prev.map(purchase =>
        purchase.id === id ? { ...purchase, orderStatus: newStatus } : purchase
      )
    )
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const handleViewDetails = (id: number) => {
    // TODO: 상세보기 기능
    console.log('View details for purchase:', id)
  }

  return (
    <div className="space-y-6">
      {/* 페이지 타이틀 */}
      <h1 className="text-2xl font-bold text-black">구매 관리</h1>

      {/* 요약 카드 */}
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

      {/* 주문 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          주문 검색 및 필터
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="주문번호, 고객명, 상품명으로 검색...."
            />
          </div>
          <div className="flex gap-3">
            {/* 상태 필터 */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">전체 상태</option>
                <option value="deposit_pending">입금대기</option>
                <option value="preparing">배송준비</option>
                <option value="shipping">배송중</option>
                <option value="delivered">배송완료</option>
              </select>
            </div>

            {/* 결제 필터 */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                결제
              </label>
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">전체 결제</option>
                <option value="pending">입금대기</option>
                <option value="completed">입금완료</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 주문 목록 */}
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
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제상태
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문상태
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문일시
                </th>
                <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
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
                            e.target.value as 'pending' | 'completed'
                          )
                        }
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                      >
                        <option value="pending">입금대기</option>
                        <option value="completed">입금완료</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                      >
                        <option value="deposit_pending">입금대기</option>
                        <option value="preparing">배송준비</option>
                        <option value="shipping">배송중</option>
                        <option value="delivered">배송완료</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
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

                  {/* 관리 */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDetails(purchase.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>상세보기</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export { PurchaseManagement as Component }
