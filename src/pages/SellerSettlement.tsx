import { useState, useEffect, useCallback } from 'react'
import {
  settlementApi,
  type SellerSettlementStatistics,
  type SellerSettlement as SellerSettlementType,
} from '@/lib/api/settlement'
import SearchBar from '@/components/SearchBar'
import SellerSettlementDetailModal from '@/components/SellerSettlementDetailModal'

const SellerSettlement = () => {
  const [settlements, setSettlements] = useState<SellerSettlementType[]>([])
  const [statistics, setStatistics] =
    useState<SellerSettlementStatistics | null>(null)
  // 현재 월을 YYYY-MM 형식으로 가져오기
  const getCurrentMonth = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  const [settlementMonth, setSettlementMonth] =
    useState<string>(getCurrentMonth())
  const [settlementRound, setSettlementRound] = useState<'1' | '2'>('1')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'PENDING' | 'COMPLETED'
  >('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSettlementId, setSelectedSettlementId] = useState<
    number | null
  >(null)

  // API 파라미터 생성
  const getApiParams = useCallback(() => {
    const [year, month] = settlementMonth.split('-').map(Number)
    const periodType = settlementRound === '1' ? 'FIRST_HALF' : 'SECOND_HALF'

    const params: {
      year?: number
      month?: number
      period_type?: 'FIRST_HALF' | 'SECOND_HALF'
      status?: 'PENDING' | 'COMPLETED'
      search?: string
    } = {
      year,
      month,
      period_type: periodType,
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim()
    }

    return params
  }, [settlementMonth, settlementRound, statusFilter, searchQuery])

  // API에서 판매자별 정산 목록 조회
  const fetchSellerSettlements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = getApiParams()
      const response = await settlementApi.getSellerSettlements(params)

      // API 응답 구조 확인
      const data =
        'data' in response && response.data ? response.data : response

      if (!data || !('results' in data) || !('statistics' in data)) {
        throw new Error('Invalid API response structure')
      }

      setSettlements(data.results)
      setStatistics(data.statistics)
    } catch (err) {
      setError('정산 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch seller settlements:', err)
    } finally {
      setLoading(false)
    }
  }, [getApiParams])

  // 초기 로드 및 파라미터 변경 시 조회
  useEffect(() => {
    fetchSellerSettlements()
  }, [fetchSellerSettlements])

  const handleExcelDownload = () => {
    // TODO: 엑셀 다운로드 기능
    console.log('Excel download:', settlementMonth, settlementRound)
  }

  const handleSettlementComplete = async (id: number) => {
    // 이미 완료된 정산은 처리하지 않음
    const settlement = settlements.find(s => s.id === id)
    if (settlement?.status === 'COMPLETED') {
      return
    }

    if (!confirm('정산을 완료 처리하시겠습니까?')) {
      return
    }

    try {
      await settlementApi.completeSellerSettlement(id)
      // 정산 목록 다시 조회
      await fetchSellerSettlements()
    } catch (err) {
      alert('정산 완료 처리에 실패했습니다.')
      console.error('Failed to complete settlement:', err)
    }
  }

  const handleSearch = () => {
    fetchSellerSettlements()
  }

  const handleRowClick = (id: number) => {
    setSelectedSettlementId(id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedSettlementId(null)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const getMonthDisplay = (month: string) => {
    const [year, monthNum] = month.split('-')
    return `${year}년 ${monthNum}월`
  }

  return (
    <div className="space-y-6">
      {/* 정산 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            정산 설정
          </h2>
          <p className="text-sm text-gray-500">
            정산할 월과 차수를 선택하고 데이터를 다운로드할 수 있습니다.
          </p>
        </div>
        <div className="flex items-end gap-4">
          <div className="w-48">
            <input
              type="month"
              value={settlementMonth}
              onChange={e => setSettlementMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정산 차수
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="settlementRound"
                  value="1"
                  checked={settlementRound === '1'}
                  onChange={e =>
                    setSettlementRound(e.target.value as '1' | '2')
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">1차(15일)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="settlementRound"
                  value="2"
                  checked={settlementRound === '2'}
                  onChange={e =>
                    setSettlementRound(e.target.value as '1' | '2')
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">2차(말일)</span>
              </label>
            </div>
          </div>
          <button
            onClick={handleExcelDownload}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {/* 총 매출액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.total_sales_sum)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {settlementRound}차 정산 매출
              </div>
            </div>
          </div>
        </div>

        {/* 취소 금액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-red-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.cancelled_amount_sum)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">주문 취소된 금액</div>
            </div>
          </div>
        </div>

        {/* 이월 금액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.carried_over_sum)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                이전 차수에서 이월
              </div>
            </div>
          </div>
        </div>

        {/* 실제 정산액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.settlement_amount_sum)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                실제 지급 예정 금액
              </div>
            </div>
          </div>
        </div>

        {/* 수수료 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.commission_sum)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">플랫폼 수수료</div>
            </div>
          </div>
        </div>

        {/* 부가가치세 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-red-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? `${formatPrice(statistics.vat_sum)}원`
                    : '0원'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                부가가치세 납부액
              </div>
            </div>
          </div>
        </div>

        {/* 정산 완료 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? statistics.completed_count
                    : 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                정산 완료된 판매자
              </div>
            </div>
          </div>
        </div>

        {/* 정산 대기 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-orange-600">
                {loading
                  ? '로딩 중...'
                  : statistics
                    ? statistics.pending_count
                    : 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                정산 대기중인 판매자
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 판매자별 정산 현황 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            판매자별 정산 현황 - {settlementRound}차
          </h2>
          <p className="text-sm text-gray-500">
            {getMonthDisplay(settlementMonth)} {settlementRound}차 정산 현황을
            확인하고 정산 처리를 할 수 있습니다.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            * 1차: 매월 1일~15일 거래분 (16일 정산), 2차: 매월 16일~31일 거래분
            (익월 1일 정산)
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="농장명으로 검색"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              정산 상태:
            </label>
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(
                  e.target.value as 'all' | 'PENDING' | 'COMPLETED'
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="PENDING">정산 대기</option>
              <option value="COMPLETED">정산 완료</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            조회
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매자 정보
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 매출
                </th>
                <th className="w-40 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  취소 금액
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수수료 (7%)
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  부가가치세 (0.7%)
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이월 금액
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  실제 정산액
                </th>
                <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래 건수
                </th>
                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정산 상태
                </th>
                <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    로딩 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                settlements.map(settlement => (
                  <tr
                    key={settlement.id}
                    onClick={() => handleRowClick(settlement.id)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {/* 판매자 정보 */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-black">
                        {settlement.farm_name}
                      </span>
                    </td>

                    {/* 총 매출 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {formatPrice(settlement.total_sales)}원
                      </span>
                    </td>

                    {/* 취소 금액 */}
                    <td className="px-6 py-4 text-right">
                      {settlement.cancelled_amount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-red-600">
                            {formatPrice(settlement.cancelled_amount)}원
                          </span>
                          <span className="text-xs text-red-600">
                            ({settlement.cancelled_count}건)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    {/* 수수료 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {formatPrice(settlement.commission_amount)}원
                      </span>
                    </td>

                    {/* 부가가치세 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {formatPrice(settlement.vat_amount)}원
                      </span>
                    </td>

                    {/* 이월 금액 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {settlement.carried_over_amount > 0
                          ? `${formatPrice(settlement.carried_over_amount)}원`
                          : '-'}
                      </span>
                    </td>

                    {/* 실제 정산액 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        {formatPrice(settlement.settlement_amount)}원
                      </span>
                    </td>

                    {/* 거래 건수 */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-black">
                        {settlement.order_count}건
                      </span>
                    </td>

                    {/* 정산 상태 */}
                    <td className="px-6 py-4">
                      {settlement.status === 'COMPLETED' ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                            정산완료
                          </span>
                          {settlement.completed_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(
                                settlement.completed_at
                              ).toLocaleDateString('ko-KR')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            정산대기
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 관리 */}
                    <td
                      className="px-6 py-4 text-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <label className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={settlement.status === 'COMPLETED'}
                          disabled={settlement.status === 'COMPLETED'}
                          onChange={() =>
                            handleSettlementComplete(settlement.id)
                          }
                          className={`w-4 h-4 rounded focus:ring-blue-500 ${
                            settlement.status === 'COMPLETED'
                              ? 'accent-green-600 bg-green-600 border-green-600'
                              : 'text-blue-600 border-gray-300'
                          } disabled:cursor-not-allowed`}
                        />
                        <span className="ml-2 text-sm text-gray-700">완료</span>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 정산 상세 모달 */}
      <SellerSettlementDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        settlementId={selectedSettlementId}
      />
    </div>
  )
}

export { SellerSettlement as Component }
