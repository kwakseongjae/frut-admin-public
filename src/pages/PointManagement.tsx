import { useState, useMemo } from 'react'
import {
  defaultPointSettings,
  dummyPointHistory,
  type PointSettings,
  type PointHistory,
} from '@/constants/dummy'

const PointManagement = () => {
  const [settings, setSettings] = useState<PointSettings>(defaultPointSettings)
  const [pointHistory] = useState<PointHistory[]>(dummyPointHistory)

  // 통계 계산
  const statistics = useMemo(() => {
    const totalIssued = 15420000
    const totalUsed = 8750000
    const remaining = totalIssued - totalUsed
    const thisMonthIssued = 2340000
    const thisMonthUsed = 1890000
    const membersWithPoints = 12450

    return {
      totalIssued,
      totalUsed,
      remaining,
      thisMonthIssued,
      thisMonthUsed,
      membersWithPoints,
    }
  }, [])

  const handleSettingsToggle = () => {
    setSettings((prev: PointSettings) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }))
  }

  const handleEditSettings = () => {
    // TODO: 설정 수정 모달
    console.log('Edit point settings')
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const formatPoints = (points: number) => {
    return `${formatPrice(points)}P`
  }

  const getTypeBadge = (type: PointHistory['type']) => {
    const typeMap: Record<
      PointHistory['type'],
      { label: string; className: string }
    > = {
      earned: { label: '적립', className: 'bg-blue-100 text-blue-800' },
      used: { label: '사용', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: '취소', className: 'bg-red-100 text-red-800' },
    }
    const typeInfo = typeMap[type]
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.className}`}
      >
        {typeInfo.label}
      </span>
    )
  }

  const getPointsColor = (type: PointHistory['type']) => {
    if (type === 'earned') {
      return 'text-blue-600'
    }
    if (type === 'used' || type === 'cancelled') {
      return 'text-orange-600'
    }
    return 'text-black'
  }

  const getPointsPrefix = (type: PointHistory['type']) => {
    if (type === 'earned') {
      return '+'
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <h1 className="text-2xl font-bold text-black">포인트 관리</h1>

      {/* 포인트 적립 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            포인트 적립 설정
          </h2>
          <p className="text-sm text-gray-500">
            구매액에 대한 포인트 적립률과 적용일을 설정할 수 있습니다.
          </p>
        </div>

        {/* 포인트 시스템 활성화 */}
        <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">
              포인트 시스템 활성화
            </p>
            <p className="text-xs text-gray-500 mt-1">
              포인트 적립 및 사용 기능을 활성화합니다.
            </p>
          </div>
          <button
            onClick={handleSettingsToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              settings.isEnabled ? 'bg-black' : 'bg-gray-300'
            }`}
            aria-label={`포인트 시스템 ${settings.isEnabled ? '활성' : '비활성'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 적립률 및 날짜 정보 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 현재 적립률 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">현재 적립률</div>
            <div className="text-2xl font-bold text-blue-600">
              {settings.rate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              구매액의 {settings.rate}% 적립
            </div>
          </div>

          {/* 적용일 */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">적용일</div>
            <div className="text-2xl font-bold text-green-600">
              {settings.effectiveDate}
            </div>
            <div className="text-xs text-gray-500 mt-1">해당 날짜부터 적용</div>
          </div>

          {/* 최종 수정일 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">최종 수정일</div>
            <div className="text-2xl font-bold text-gray-700">
              {settings.lastModified}
            </div>
            <div className="text-xs text-gray-500 mt-1">마지막 설정 변경일</div>
          </div>
        </div>

        {/* 설정 수정 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleEditSettings}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>설정 수정</span>
          </button>
        </div>
      </div>

      {/* 포인트 현황 요약 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 누적 발급액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">누적 발급액</div>
          <div className="text-3xl font-bold text-black">
            {formatPoints(statistics.totalIssued)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            전체 포인트 발급 총액
          </div>
        </div>

        {/* 누적 사용액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">누적 사용액</div>
          <div className="text-3xl font-bold text-orange-600">
            {formatPoints(statistics.totalUsed)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            전체 포인트 사용 총액
          </div>
        </div>

        {/* 잔여 포인트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">잔여 포인트</div>
          <div className="text-3xl font-bold text-green-600">
            {formatPoints(statistics.remaining)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            현재 보유 포인트 총액
          </div>
        </div>

        {/* 이번 달 발급 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 발급</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatPoints(statistics.thisMonthIssued)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            이번 달 포인트 발급액
          </div>
        </div>

        {/* 이번 달 사용 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 사용</div>
          <div className="text-3xl font-bold text-orange-600">
            {formatPoints(statistics.thisMonthUsed)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            이번 달 포인트 사용액
          </div>
        </div>

        {/* 포인트 보유 회원 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">포인트 보유 회원</div>
          <div className="text-3xl font-bold text-purple-600">
            {formatPrice(statistics.membersWithPoints)}명
          </div>
          <div className="text-xs text-gray-500 mt-1">
            포인트를 보유한 회원 수
          </div>
        </div>
      </div>

      {/* 최근 포인트 내역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            최근 포인트 내역
          </h2>
          <p className="text-sm text-gray-500">
            최근 포인트 적립, 사용, 취소 내역을 확인할 수 있습니다.
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
                  고객명
                </th>
                <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문금액
                </th>
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  포인트
                </th>
                <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pointHistory.map(history => (
                <tr
                  key={history.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 날짜/시간 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {history.dateTime}
                    </span>
                  </td>

                  {/* 고객명 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {history.customerName}
                    </span>
                  </td>

                  {/* 유형 */}
                  <td className="px-6 py-4">{getTypeBadge(history.type)}</td>

                  {/* 주문금액 */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-black">
                      {formatPrice(history.orderAmount)}원
                    </span>
                  </td>

                  {/* 포인트 */}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-semibold ${getPointsColor(history.type)}`}
                    >
                      {getPointsPrefix(history.type)}
                      {formatPrice(history.points)}P
                    </span>
                  </td>

                  {/* 설명 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {history.description}
                    </span>
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                      완료
                    </span>
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

export { PointManagement as Component }
