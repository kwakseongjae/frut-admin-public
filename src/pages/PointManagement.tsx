import { useState, useEffect, useCallback } from 'react'
import { defaultPointSettings, type PointSettings } from '@/constants/dummy'
import {
  benefitApi,
  type PointHistoryItem,
  type PointSystemStatus,
  type CurrentPointRate,
} from '@/lib/api/benefit'

const PointManagement = () => {
  const [settings, setSettings] = useState<PointSettings>(defaultPointSettings)
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([])
  const [statistics, setStatistics] = useState({
    total_earned: 0,
    total_used: 0,
    total_balance: 0,
    this_month_earned: 0,
    this_month_used: 0,
    members_with_points: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentRate, setCurrentRate] = useState<CurrentPointRate | null>(null)
  const [formData, setFormData] = useState({
    purchase_earn_rate: '',
    effective_date: '',
  })
  const [formErrors, setFormErrors] = useState<{
    purchase_earn_rate?: string
    effective_date?: string
  }>({})
  const [formLoading, setFormLoading] = useState(false)
  // 년월 선택 상태
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1
  )

  // API에서 포인트 내역 조회
  const fetchPointHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await benefitApi.getPointHistory({
        year: selectedYear,
        month: selectedMonth,
      })

      // API 응답 구조 확인
      const data =
        'data' in response && response.data ? response.data : response

      if (!data || !('statistics' in data) || !('results' in data)) {
        throw new Error('Invalid API response structure')
      }

      setPointHistory(data.results)
      setStatistics(data.statistics)
    } catch (err) {
      setError('포인트 내역을 불러오는데 실패했습니다.')
      console.error('Failed to fetch point history:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedMonth])

  // API에서 포인트 시스템 상태 조회
  const fetchPointSystemStatus = useCallback(async () => {
    try {
      const response = await benefitApi.getPointSystemStatus()
      const data =
        'data' in response && response.data ? response.data : response

      if (
        !data ||
        typeof data !== 'object' ||
        !('is_enabled' in data) ||
        typeof data.is_enabled !== 'boolean'
      ) {
        throw new Error('Invalid API response structure')
      }

      const status = data as PointSystemStatus
      setSettings((prev: PointSettings) => ({
        ...prev,
        isEnabled: status.is_enabled,
      }))
    } catch (err) {
      console.error('Failed to fetch point system status:', err)
      // 에러가 발생해도 기본값 사용
    }
  }, [])

  // 현재 적립률 조회
  const fetchCurrentRate = useCallback(async () => {
    try {
      const response = await benefitApi.getCurrentPointRate()
      const data =
        'data' in response && response.data ? response.data : response

      if (
        !data ||
        typeof data !== 'object' ||
        !('current_rate' in data) ||
        !('effective_date' in data) ||
        !('updated_at' in data)
      ) {
        throw new Error('Invalid API response structure')
      }

      const rateData = data as CurrentPointRate
      // current_rate를 퍼센트로 변환 (0.01 -> 1)
      const ratePercent = Math.round(rateData.current_rate * 100)

      setCurrentRate(rateData)
      setSettings((prev: PointSettings) => ({
        ...prev,
        rate: ratePercent,
      }))
    } catch (err) {
      console.error('Failed to fetch current rate:', err)
    }
  }, [])

  useEffect(() => {
    fetchPointHistory()
  }, [fetchPointHistory])

  useEffect(() => {
    fetchPointSystemStatus()
    fetchCurrentRate()
  }, [fetchPointSystemStatus, fetchCurrentRate])

  const handleSettingsToggle = async () => {
    const newStatus = !settings.isEnabled

    try {
      setToggleLoading(true)
      await benefitApi.togglePointSystem({ is_enabled: newStatus })

      // 상태 업데이트
      setSettings((prev: PointSettings) => ({
        ...prev,
        isEnabled: newStatus,
      }))

      // 포인트 시스템 상태도 다시 조회하여 최신 정보 반영
      await fetchPointSystemStatus()
    } catch (err) {
      console.error('Failed to toggle point system:', err)
      setError('포인트 시스템 상태 변경에 실패했습니다.')
    } finally {
      setToggleLoading(false)
    }
  }

  const handleEditSettings = async () => {
    setShowEditForm(!showEditForm)
    if (!showEditForm) {
      // 폼을 열 때 현재 적립률로 초기값 설정
      const currentRateValue = currentRate
        ? Math.round(currentRate.current_rate * 100)
        : settings.rate
      setFormData({
        purchase_earn_rate: currentRateValue.toString(),
        effective_date: '',
      })
    } else {
      // 폼을 닫을 때 초기화
      setFormData({ purchase_earn_rate: '', effective_date: '' })
      setFormErrors({})
    }
  }

  const handleFormChange = (
    field: 'purchase_earn_rate' | 'effective_date',
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 초기화
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {}

    // purchase_earn_rate 검증 (0% ~ 10%)
    const rate = parseFloat(formData.purchase_earn_rate)
    if (isNaN(rate) || rate < 0 || rate > 10) {
      errors.purchase_earn_rate = '0% ~ 10% 사이로 설정 가능합니다.'
    }

    // effective_date 검증 (내일 이후)
    if (!formData.effective_date) {
      errors.effective_date = '적용일을 선택해주세요.'
    } else {
      const selectedDate = new Date(formData.effective_date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)

      if (selectedDate < tomorrow) {
        errors.effective_date = '오늘 이후 날짜만 선택 가능합니다.'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setFormLoading(true)
      const rateDecimal = (
        parseFloat(formData.purchase_earn_rate) / 100
      ).toFixed(2)

      await benefitApi.createPointRate({
        purchase_earn_rate: rateDecimal,
        effective_date: formData.effective_date,
      })

      // 성공 시 현재 적립률 새로고침
      await fetchCurrentRate()

      // 폼 닫기
      setShowEditForm(false)
      setFormData({ purchase_earn_rate: '', effective_date: '' })
      setFormErrors({})
    } catch (err) {
      console.error('Failed to create point rate:', err)
      setError('적립률 설정 저장에 실패했습니다.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCancel = () => {
    setShowEditForm(false)
    setFormData({ purchase_earn_rate: '', effective_date: '' })
    setFormErrors({})
  }

  // 내일 날짜를 YYYY-MM-DD 형식으로 반환
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const formatPoints = (points: number) => {
    return `${formatPrice(points)}P`
  }

  const getTypeBadge = (pointType: PointHistoryItem['point_type']) => {
    const typeMap: Record<
      PointHistoryItem['point_type'],
      { label: string; className: string }
    > = {
      EARN: { label: '적립', className: 'bg-blue-100 text-blue-800' },
      USE: { label: '사용', className: 'bg-gray-100 text-gray-800' },
      CANCEL_EARN: { label: '적립 취소', className: 'bg-red-100 text-red-800' },
      CANCEL_USE: {
        label: '사용 취소',
        className: 'bg-green-100 text-green-800',
      },
      EXPIRE: { label: '만료', className: 'bg-orange-100 text-orange-800' },
      ADMIN: { label: '관리자', className: 'bg-purple-100 text-purple-800' },
    }
    const typeInfo = typeMap[pointType]
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.className}`}
      >
        {typeInfo.label}
      </span>
    )
  }

  const getPointsColor = (pointType: PointHistoryItem['point_type']) => {
    if (
      pointType === 'EARN' ||
      pointType === 'CANCEL_USE' ||
      pointType === 'ADMIN'
    ) {
      // ADMIN은 양수면 적립, 음수면 사용으로 처리
      return 'text-blue-600'
    }
    if (
      pointType === 'USE' ||
      pointType === 'CANCEL_EARN' ||
      pointType === 'EXPIRE'
    ) {
      return 'text-orange-600'
    }
    return 'text-black'
  }

  const getPointsPrefix = (pointAmount: number) => {
    if (pointAmount > 0) {
      return '+'
    }
    return ''
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

  // 날짜만 포맷팅 (YYYY-MM-DD) - UTC 기준으로 추출
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="space-y-6">
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
            disabled={toggleLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              settings.isEnabled ? 'bg-black' : 'bg-gray-300'
            } ${toggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              {currentRate
                ? Math.round(currentRate.current_rate * 100)
                : settings.rate}
              %
            </div>
            <div className="text-xs text-gray-500 mt-1">
              구매액의{' '}
              {currentRate
                ? Math.round(currentRate.current_rate * 100)
                : settings.rate}
              % 적립
            </div>
          </div>

          {/* 적용일 */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">적용일</div>
            <div className="text-2xl font-bold text-green-600">
              {currentRate?.effective_date
                ? formatDate(currentRate.effective_date)
                : settings.effectiveDate}
            </div>
            <div className="text-xs text-gray-500 mt-1">해당 날짜부터 적용</div>
          </div>

          {/* 최종 수정일 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">최종 수정일</div>
            <div className="text-2xl font-bold text-gray-700">
              {currentRate?.updated_at
                ? formatDate(currentRate.updated_at)
                : settings.lastModified}
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

        {/* 설정 변경 폼 */}
        {showEditForm && (
          <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              설정 변경
            </h3>

            {/* 경고 메시지 */}
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg flex items-start gap-3">
              <svg
                className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-gray-700">
                포인트 적립률 변경은 설정한 적용일로부터 적용되며, 소급 적용되지
                않습니다.
              </p>
            </div>

            {/* 입력 필드 */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* 포인트 적립률 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  포인트 적립률
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.purchase_earn_rate}
                  onChange={e =>
                    handleFormChange('purchase_earn_rate', e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    formErrors.purchase_earn_rate
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="1"
                />
                {formErrors.purchase_earn_rate ? (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.purchase_earn_rate}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    0% ~ 10% 사이로 설정 가능
                  </p>
                )}
              </div>

              {/* 적용일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  적용일
                </label>
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={formData.effective_date}
                  onChange={e =>
                    handleFormChange('effective_date', e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    formErrors.effective_date
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {formErrors.effective_date ? (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.effective_date}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    오늘 이후 날짜만 선택 가능
                  </p>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={formLoading}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>저장</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={formLoading}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 포인트 현황 요약 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 누적 발급액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">누적 발급액</div>
          <div className="text-3xl font-bold text-black">
            {formatPoints(statistics.total_earned)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            전체 포인트 발급 총액
          </div>
        </div>

        {/* 누적 사용액 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">누적 사용액</div>
          <div className="text-3xl font-bold text-orange-600">
            {formatPoints(statistics.total_used)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            전체 포인트 사용 총액
          </div>
        </div>

        {/* 잔여 포인트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">잔여 포인트</div>
          <div className="text-3xl font-bold text-green-600">
            {formatPoints(statistics.total_balance)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            현재 보유 포인트 총액
          </div>
        </div>

        {/* 이번 달 발급 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 발급</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatPoints(statistics.this_month_earned)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            이번 달 포인트 발급액
          </div>
        </div>

        {/* 이번 달 사용 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 사용</div>
          <div className="text-3xl font-bold text-orange-600">
            {formatPoints(statistics.this_month_used)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            이번 달 포인트 사용액
          </div>
        </div>

        {/* 포인트 보유 회원 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">포인트 보유 회원</div>
          <div className="text-3xl font-bold text-purple-600">
            {formatPrice(statistics.members_with_points)}명
          </div>
          <div className="text-xs text-gray-500 mt-1">
            포인트를 보유한 회원 수
          </div>
        </div>
      </div>

      {/* 포인트 내역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            포인트 내역
          </h2>
          <p className="text-sm text-gray-500">
            포인트 적립, 사용, 취소 내역을 확인할 수 있습니다.
          </p>
        </div>

        {/* 기간 설정 */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">기간설정</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = currentDate.getFullYear() - 2 + i
              return (
                <option key={year} value={year}>
                  {year}년
                </option>
              )
            })}
          </select>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1
              return (
                <option key={month} value={month}>
                  {month}월
                </option>
              )
            })}
          </select>
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
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    로딩 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : pointHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    포인트 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                pointHistory.map(history => (
                  <tr
                    key={history.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* 날짜/시간 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {formatDateTime(history.created_at)}
                      </span>
                    </td>

                    {/* 고객명 */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-black">
                        {history.user_name}
                      </span>
                    </td>

                    {/* 유형 */}
                    <td className="px-6 py-4">
                      {getTypeBadge(history.point_type)}
                    </td>

                    {/* 주문금액 */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-black">
                        {history.order_amount
                          ? `${formatPrice(history.order_amount)}원`
                          : '-'}
                      </span>
                    </td>

                    {/* 포인트 */}
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${getPointsColor(history.point_type)}`}
                      >
                        {getPointsPrefix(history.point_amount)}
                        {formatPrice(Math.abs(history.point_amount))}P
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export { PointManagement as Component }
