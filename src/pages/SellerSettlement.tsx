import { useState, useMemo } from 'react'
import { dummySellerSettlements } from '@/constants/dummy'
import type { SellerSettlement as SellerSettlementType } from '@/constants/dummy'

const SellerSettlement = () => {
  const [settlements] = useState<SellerSettlementType[]>(dummySellerSettlements)
  const [settlementMonth, setSettlementMonth] = useState<string>('2025-01')
  const [settlementRound, setSettlementRound] = useState<'1' | '2'>('1')

  // 통계 계산
  const statistics = useMemo(() => {
    const totalSales = settlements.reduce((sum, s) => sum + s.totalSales, 0)

    const cancelAmount = settlements.reduce((sum, s) => sum + s.cancelAmount, 0)

    const carryOverAmount = settlements.reduce(
      (sum, s) => sum + s.carryOverAmount,
      0
    )

    const actualSettlementAmount = settlements.reduce(
      (sum, s) => sum + s.actualSettlementAmount,
      0
    )

    const totalFee = settlements.reduce((sum, s) => sum + s.fee, 0)

    const totalVat = settlements.reduce((sum, s) => sum + s.vat, 0)

    const completedCount = settlements.filter(
      s => s.settlementStatus === 'completed'
    ).length

    const pendingCount = settlements.filter(
      s => s.settlementStatus === 'pending'
    ).length

    return {
      totalSales,
      cancelAmount,
      carryOverAmount,
      actualSettlementAmount,
      totalFee,
      totalVat,
      completedCount,
      pendingCount,
    }
  }, [settlements])

  const handleExcelDownload = () => {
    // TODO: 엑셀 다운로드 기능
    console.log('Excel download:', settlementMonth, settlementRound)
  }

  const handleSettlementComplete = (id: number) => {
    // TODO: 정산 완료 처리
    console.log('Settlement complete:', id)
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
      {/* 페이지 헤더 */}
      <h1 className="text-2xl font-bold text-black">판매자별 정산</h1>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정산 월
            </label>
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
                {formatPrice(statistics.totalSales)}원
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
                {formatPrice(statistics.cancelAmount)}원
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
                {formatPrice(statistics.carryOverAmount)}원
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
                {formatPrice(statistics.actualSettlementAmount)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">
                실제 지급 예정 금액
              </div>
            </div>
          </div>
        </div>

        {/* 수수료 (7%) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(statistics.totalFee)}원
              </div>
              <div className="text-xs text-gray-500 mt-1">플랫폼 수수료</div>
            </div>
          </div>
        </div>

        {/* 부가가치세 (0.7%) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(statistics.totalVat)}원
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
                {statistics.completedCount}
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
                {statistics.pendingCount}
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
              {settlements.map(settlement => (
                <tr
                  key={settlement.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 판매자 정보 */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-black">
                      {settlement.sellerName}
                    </span>
                  </td>

                  {/* 총 매출 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {formatPrice(settlement.totalSales)}원
                    </span>
                  </td>

                  {/* 취소 금액 */}
                  <td className="px-6 py-4 text-right">
                    {settlement.cancelAmount > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-red-600">
                          {formatPrice(settlement.cancelAmount)}원
                        </span>
                        <span className="text-xs text-red-600">
                          ({settlement.cancelCount}건)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* 수수료 (7%) */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {formatPrice(settlement.fee)}원
                    </span>
                  </td>

                  {/* 부가가치세 (0.7%) */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {formatPrice(settlement.vat)}원
                    </span>
                  </td>

                  {/* 이월 금액 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {settlement.carryOverAmount > 0
                        ? `${formatPrice(settlement.carryOverAmount)}원`
                        : '-'}
                    </span>
                  </td>

                  {/* 실제 정산액 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-blue-600">
                      {formatPrice(settlement.actualSettlementAmount)}원
                    </span>
                  </td>

                  {/* 거래 건수 */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-black">
                      {settlement.transactionCount}건
                    </span>
                  </td>

                  {/* 정산 상태 */}
                  <td className="px-6 py-4">
                    {settlement.settlementStatus === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                          정산완료
                        </span>
                        <span className="text-xs text-gray-500">
                          {settlement.settlementDate}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        정산대기
                      </span>
                    )}
                  </td>

                  {/* 관리 */}
                  <td className="px-6 py-4 text-center">
                    <label className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={settlement.settlementStatus === 'completed'}
                        onChange={() => handleSettlementComplete(settlement.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">완료</span>
                    </label>
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

export { SellerSettlement as Component }
