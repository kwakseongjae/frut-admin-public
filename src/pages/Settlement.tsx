import { useState, useMemo } from 'react'
import {
  dummySalesTransactions,
  type SalesTransaction,
} from '@/constants/dummy'

const Settlement = () => {
  const [transactions] = useState<SalesTransaction[]>(dummySalesTransactions)
  const [periodType, setPeriodType] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // 통계 계산
  const statistics = useMemo(() => {
    const totalTransactionAmount = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.transactionAmount, 0)

    const feeRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.fee, 0)

    const vat = Math.floor(feeRevenue * 0.1) // 부가가치세 (수수료 수익의 10%)

    const couponDiscount = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.couponDiscount || 0), 0)

    const pointUsage = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.pointUsage || 0), 0)

    return {
      totalTransactionAmount,
      feeRevenue,
      vat,
      couponDiscount,
      pointUsage,
    }
  }, [transactions])

  const handleSearch = () => {
    // TODO: 기간에 따른 조회 기능
    console.log('Search with period:', periodType, startDate, endDate)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const getStatusBadge = (status: 'completed' | 'cancelled') => {
    if (status === 'completed') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
          완료
        </span>
      )
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        취소
      </span>
    )
  }

  // 날짜순 역순 정렬
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  })

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <h1 className="text-2xl font-bold text-black">매출 관리</h1>

      {/* 기간 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            기간 설정
          </h2>
          <p className="text-sm text-gray-500">
            매출 데이터를 조회할 기간을 선택하세요.
          </p>
        </div>
        <div className="flex items-end gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기간
            </label>
            <select
              value={periodType}
              onChange={e => setPeriodType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">전체기간</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">이번 해</option>
              <option value="custom">사용자 지정</option>
            </select>
          </div>
          {periodType === 'custom' && (
            <>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            조회
          </button>
        </div>
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-5 gap-4">
        {/* 총 거래액 */}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(statistics.totalTransactionAmount)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">전체 거래 금액</div>
            </div>
          </div>
        </div>

        {/* 수수료 수익 (7%) */}
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(statistics.feeRevenue)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">
                플랫폼 수수료 수익
              </div>
            </div>
          </div>
        </div>

        {/* 부가가치세 (0.7%) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <svg
              className="w-6 h-6 text-red-600"
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
            <div className="flex-1">
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(statistics.vat)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">
                부가가치세 납부액
              </div>
            </div>
          </div>
        </div>

        {/* 쿠폰 할인액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <div className="flex-1">
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(statistics.couponDiscount)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">
                쿠폰으로 할인된 금액
              </div>
            </div>
          </div>
        </div>

        {/* 포인트 사용액 */}
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <div className="flex-1">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(statistics.pointUsage)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">
                포인트로 결제된 금액
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            거래 내역
          </h2>
          <p className="text-sm text-gray-500">
            날짜순으로 정렬된 거래 내역을 확인할 수 있습니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜/시간
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구매자
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매자
                </th>
                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래액
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  쿠폰할인
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  포인트사용
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수수료 (7%)
                </th>
                <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.map(transaction => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 날짜/시간 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {transaction.dateTime}
                    </span>
                  </td>

                  {/* 구매자 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {transaction.buyerName}
                    </span>
                  </td>

                  {/* 판매자 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {transaction.sellerName}
                    </span>
                  </td>

                  {/* 상품 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {transaction.productName}
                    </span>
                  </td>

                  {/* 거래액 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-black">
                      {formatPrice(transaction.transactionAmount)}원
                    </span>
                  </td>

                  {/* 쿠폰할인 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {transaction.couponDiscount
                        ? `${formatPrice(transaction.couponDiscount)}원`
                        : '-'}
                    </span>
                  </td>

                  {/* 포인트사용 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {transaction.pointUsage
                        ? `${formatPrice(transaction.pointUsage)}원`
                        : '-'}
                    </span>
                  </td>

                  {/* 수수료 (7%) */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {formatPrice(transaction.fee)}원
                    </span>
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(transaction.status)}
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

export { Settlement as Component }
