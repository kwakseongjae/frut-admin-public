import { useState, useMemo } from 'react'
import { dummyCoupons, type Coupon } from '@/constants/dummy'

const BenefitManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(dummyCoupons)

  // 통계 계산
  const statistics = useMemo(() => {
    const totalCoupons = coupons.length
    const activeCoupons = coupons.filter(c => c.status).length
    const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0)
    const inactiveCoupons = coupons.filter(c => !c.status).length

    return {
      totalCoupons,
      activeCoupons,
      totalUsage,
      inactiveCoupons,
    }
  }, [coupons])

  const handleStatusToggle = (id: number) => {
    setCoupons(prev =>
      prev.map(coupon =>
        coupon.id === id ? { ...coupon, status: !coupon.status } : coupon
      )
    )
  }

  const handleEdit = (id: number) => {
    // TODO: 쿠폰 수정 기능
    console.log('Edit coupon:', id)
  }

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setCoupons(prev => prev.filter(coupon => coupon.id !== id))
    }
  }

  const handleCreateClick = () => {
    // TODO: 쿠폰 생성 기능
    console.log('Create new coupon')
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    }
    return `${formatPrice(coupon.discountValue)}원`
  }

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">쿠폰 관리</h1>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>쿠폰 생성</span>
        </button>
      </div>

      {/* 요약 정보 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {/* 전체 쿠폰 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-3xl font-bold text-black">
                {statistics.totalCoupons}
              </div>
              <div className="text-sm text-gray-500 mt-1">생성된 쿠폰 수</div>
            </div>
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 11.586a2 2 0 00-3.414-1.414L13 15.172l-3.586-3.586a2 2 0 00-2.828 0l-4 4a2 2 0 002.828 2.828L8 15.172l3.586 3.586a2 2 0 002.828 0l6.586-6.586z"
              />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700">전체 쿠폰</div>
        </div>

        {/* 활성 쿠폰 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {statistics.activeCoupons}
              </div>
              <div className="text-sm text-gray-500 mt-1">현재 사용 가능</div>
            </div>
            <svg
              className="w-8 h-8 text-gray-400"
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
          <div className="text-lg font-semibold text-gray-700">활성 쿠폰</div>
        </div>

        {/* 총 사용량 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {statistics.totalUsage}
              </div>
              <div className="text-sm text-gray-500 mt-1">누적 사용 횟수</div>
            </div>
            <svg
              className="w-8 h-8 text-gray-400"
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
          </div>
          <div className="text-lg font-semibold text-gray-700">총 사용량</div>
        </div>

        {/* 비활성 쿠폰 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-3xl font-bold text-black">
                {statistics.inactiveCoupons}
              </div>
              <div className="text-sm text-gray-500 mt-1">사용 중지된 쿠폰</div>
            </div>
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 11.586a2 2 0 00-3.414-1.414L13 15.172l-3.586-3.586a2 2 0 00-2.828 0l-4 4a2 2 0 002.828 2.828L8 15.172l3.586 3.586a2 2 0 002.828 0l6.586-6.586z"
              />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700">비활성 쿠폰</div>
        </div>
      </div>

      {/* 쿠폰 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black mb-1">쿠폰 목록</h2>
          <p className="text-sm text-gray-500">
            생성된 쿠폰들을 관리할 수 있습니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  쿠폰명
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  할인
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최소 주문금액
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최대 할인금액
                </th>
                <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유효기간
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용량
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
              {coupons.map(coupon => (
                <tr
                  key={coupon.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 쿠폰명 */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">
                        {coupon.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {coupon.description}
                      </span>
                    </div>
                  </td>

                  {/* 할인 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {formatDiscount(coupon)}
                    </span>
                  </td>

                  {/* 최소 주문금액 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {formatPrice(coupon.minOrderAmount)}원
                    </span>
                  </td>

                  {/* 최대 할인금액 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {formatPrice(coupon.maxDiscountAmount)}원
                    </span>
                  </td>

                  {/* 유효기간 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {coupon.validFrom} ~ {coupon.validTo}
                    </span>
                  </td>

                  {/* 사용량 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-black">
                      {coupon.usageCount}회 사용
                    </span>
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleStatusToggle(coupon.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          coupon.status ? 'bg-black' : 'bg-gray-300'
                        }`}
                        aria-label={`상태 ${coupon.status ? '활성' : '비활성'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            coupon.status ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  {/* 관리 */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(coupon.id)}
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
                        onClick={() => handleDelete(coupon.id)}
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
      </div>
    </div>
  )
}

export { BenefitManagement as Component }
