import { useState, useEffect, useCallback, useRef } from 'react'
import {
  settlementApi,
  type PeriodType,
  type SalesStatisticsData,
  type SalesTransaction,
} from '@/lib/api/settlement'
import Pagination from '@/components/Pagination'

const Settlement = () => {
  const [transactions, setTransactions] = useState<SalesTransaction[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [periodType, setPeriodType] = useState<PeriodType>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [statistics, setStatistics] = useState<SalesStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  const PAGE_SIZE = 100

  // 기간 타입별 라벨 매핑
  const periodTypeLabels: Record<PeriodType, string> = {
    today: '오늘',
    yesterday: '어제',
    last_7_days: '최근 7일',
    last_30_days: '최근 30일',
    this_month: '이번 달',
    last_month: '지난 달',
    all: '전체 기간',
    custom: '사용자 정의',
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // API 파라미터 생성
  const getApiParams = useCallback(() => {
    const params: {
      period_type: PeriodType
      start_date?: string
      end_date?: string
    } = {
      period_type: periodType,
    }

    if (periodType === 'custom') {
      if (startDate && endDate) {
        params.start_date = startDate
        params.end_date = endDate
      }
    }

    return params
  }, [periodType, startDate, endDate])

  // API에서 매출 통계 조회
  const fetchSalesStatistics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = getApiParams()

      if (periodType === 'custom' && (!startDate || !endDate)) {
        setError('시작일과 종료일을 모두 입력해주세요.')
        setLoading(false)
        return
      }

      const response = await settlementApi.getSalesStatistics(params)

      // API 응답 구조 확인
      const data =
        'data' in response && response.data ? response.data : response

      if (!data || !('total_transaction_amount' in data)) {
        throw new Error('Invalid API response structure')
      }

      setStatistics(data)
    } catch (err) {
      setError('매출 통계를 불러오는데 실패했습니다.')
      console.error('Failed to fetch sales statistics:', err)
    } finally {
      setLoading(false)
    }
  }, [periodType, startDate, endDate, getApiParams])

  // API에서 거래 내역 조회
  const fetchSalesTransactions = useCallback(
    async (page: number = 1) => {
      try {
        setTransactionsLoading(true)
        setTransactionsError(null)

        const params = {
          ...getApiParams(),
          page,
        }

        if (periodType === 'custom' && (!startDate || !endDate)) {
          setTransactionsError('시작일과 종료일을 모두 입력해주세요.')
          setTransactionsLoading(false)
          return
        }

        const response = await settlementApi.getSalesTransactions(params)

        // API 응답 구조 확인
        const data =
          'data' in response && response.data ? response.data : response

        if (!data || !('results' in data)) {
          throw new Error('Invalid API response structure')
        }

        setTransactions(data.results)
        setTotalCount(data.count)
      } catch (err) {
        setTransactionsError('거래 내역을 불러오는데 실패했습니다.')
        console.error('Failed to fetch sales transactions:', err)
      } finally {
        setTransactionsLoading(false)
      }
    },
    [periodType, startDate, endDate, getApiParams]
  )

  // 초기 로드 및 기간 변경 시 통계 및 거래 내역 조회
  useEffect(() => {
    const newPage = 1
    setCurrentPage(newPage)
    fetchSalesStatistics()
    fetchSalesTransactions(newPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType, startDate, endDate])

  const handleSearch = () => {
    const newPage = 1
    setCurrentPage(newPage)
    fetchSalesStatistics()
    fetchSalesTransactions(newPage)
  }

  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type)
    setIsDropdownOpen(false)
    if (type !== 'custom') {
      setStartDate('')
      setEndDate('')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchSalesTransactions(page)
  }

  // 총 페이지 수 계산 (최소 1페이지)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  // 날짜 포맷팅
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const getStatusBadge = (itemStatus: SalesTransaction['item_status']) => {
    const statusMap: Record<
      SalesTransaction['item_status'],
      { className: string }
    > = {
      DELIVERED: {
        className: 'bg-gray-700 text-white',
      },
      CANCELLED: {
        className: 'bg-red-100 text-red-800',
      },
      REFUNDED: {
        className: 'bg-orange-100 text-orange-800',
      },
      PENDING: {
        className: 'bg-yellow-100 text-yellow-800',
      },
    }

    const statusInfo = statusMap[itemStatus] || statusMap.DELIVERED

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
      >
        {itemStatus === 'DELIVERED'
          ? '완료'
          : itemStatus === 'CANCELLED'
            ? '취소'
            : itemStatus === 'REFUNDED'
              ? '환불'
              : '대기'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-4">
          {/* 기간 선택 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="text-sm text-gray-700">
                {periodTypeLabels[periodType]}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
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

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {(
                  [
                    'today',
                    'yesterday',
                    'last_7_days',
                    'last_30_days',
                    'this_month',
                    'last_month',
                    'all',
                    'custom',
                  ] as PeriodType[]
                ).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePeriodTypeChange(type)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      periodType === type
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700'
                    } ${type === 'all' ? 'border-t border-gray-200' : ''}`}
                  >
                    {periodTypeLabels[type]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 사용자 정의 기간 입력 필드 */}
          {periodType === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="연도-월-일"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  placeholder="연도-월-일"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* 조회 버튼 */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>조회</span>
          </button>
        </div>
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
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
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.total_transaction_amount)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">전체 거래 금액</div>
            </div>
          </div>
        </div>

        {/* 수수료 수익 */}
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
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.commission_revenue)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                플랫폼 수수료 수익
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
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.total_coupon_discount)}원`
                    : '0원'}
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
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.total_point_used)}원`
                    : '0원'}
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
                  수수료 (8.8%)
                </th>
                <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionsLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    로딩 중...
                  </td>
                </tr>
              ) : transactionsError ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    {transactionsError}
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    거래 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                transactions.map(transaction => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* 날짜/시간 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {formatDateTime(transaction.ordered_at)}
                      </span>
                    </td>

                    {/* 구매자 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {transaction.buyer_name}
                      </span>
                    </td>

                    {/* 판매자 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {transaction.seller_name}
                      </span>
                    </td>

                    {/* 상품 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {transaction.product_name}
                      </span>
                    </td>

                    {/* 거래액 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-black">
                        {formatPrice(transaction.total_price)}원
                      </span>
                    </td>

                    {/* 쿠폰할인 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {transaction.coupon_discount > 0
                          ? `${formatPrice(transaction.coupon_discount)}원`
                          : '-'}
                      </span>
                    </td>

                    {/* 포인트사용 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {transaction.point_used > 0
                          ? `${formatPrice(transaction.point_used)}원`
                          : '-'}
                      </span>
                    </td>

                    {/* 수수료 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {formatPrice(transaction.commission)}원
                      </span>
                    </td>

                    {/* 상태 */}
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(transaction.item_status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {!transactionsLoading && totalCount >= 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

export { Settlement as Component }
