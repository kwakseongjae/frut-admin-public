import { useState } from 'react'
import { type Coupon } from '@/constants/dummy'
import ticketIcon from '@/assets/svg/ic_ticket_grey_24.svg'
import CouponModal, { type CouponFormData } from '@/components/CouponModal'
import {
  useCoupons,
  useCreateCoupon,
  useToggleCouponActive,
  useUpdateCoupon,
  useDeleteCoupon,
} from '@/hooks/useCoupon'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/lib/api/types'
import type { Coupon as ApiCoupon } from '@/lib/api/coupon'

const BenefitManagement = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const { data: couponsResponse, isLoading, error } = useCoupons(currentPage)
  const createCouponMutation = useCreateCoupon()
  const toggleCouponMutation = useToggleCouponActive()
  const updateCouponMutation = useUpdateCoupon()
  const deleteCouponMutation = useDeleteCoupon()

  // API 데이터에서 쿠폰 목록과 통계 추출
  const coupons = couponsResponse?.data?.results || []
  const statistics = couponsResponse?.data?.statistics
    ? {
        totalCoupons: couponsResponse.data.statistics.total_coupons,
        activeCoupons: couponsResponse.data.statistics.active_coupons,
        totalUsage: couponsResponse.data.statistics.total_usage,
        inactiveCoupons: couponsResponse.data.statistics.inactive_coupons,
      }
    : {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUsage: 0,
        inactiveCoupons: 0,
      }

  // 총 페이지 수 계산 (페이지당 100개, 최소 1페이지)
  const totalPages = Math.max(1, Math.ceil(statistics.totalCoupons / 100))

  const handleStatusToggle = (id: number) => {
    toggleCouponMutation.mutate(id, {
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>
        const message =
          axiosError.response?.data?.message ||
          error.message ||
          '쿠폰 상태 변경에 실패했습니다.'
        alert(message)
      },
    })
  }

  const handleEdit = (id: number) => {
    const coupon = convertedCoupons.find(c => c.id === id)
    if (coupon) {
      setEditingCoupon(coupon)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteCouponMutation.mutate(id, {
        onError: (error: Error) => {
          const axiosError = error as AxiosError<ApiErrorResponse>
          const message =
            axiosError.response?.data?.message ||
            error.message ||
            '쿠폰 삭제에 실패했습니다.'
          alert(message)
        },
      })
    }
  }

  const handleCreateClick = () => {
    setIsModalOpen(true)
  }

  const handleCouponSubmit = (data: CouponFormData) => {
    // API 요청 형식으로 변환
    const requestData: {
      coupon_name: string
      coupon_type: 'PERCENTAGE' | 'FIXED_AMOUNT'
      discount_value: number
      start_date: string
      end_date: string
      description?: string
      is_active: boolean
      min_order_amount?: number
      max_discount_amount?: number
    } = {
      coupon_name: data.name,
      coupon_type:
        data.discountType === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discount_value: data.discountValue,
      start_date: data.validFrom,
      end_date: data.validTo,
      is_active: true,
    }

    // 선택 필드 추가
    if (data.description) {
      requestData.description = data.description
    }
    if (data.minOrderAmount > 0) {
      requestData.min_order_amount = data.minOrderAmount
    }
    if (data.maxDiscountAmount > 0) {
      requestData.max_discount_amount = data.maxDiscountAmount
    }

    createCouponMutation.mutate(requestData, {
      onSuccess: () => {
        setIsModalOpen(false)
        // 쿼리 무효화로 자동 새로고침됨
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>
        const message =
          axiosError.response?.data?.message ||
          error.message ||
          '쿠폰 생성에 실패했습니다.'
        alert(message)
      },
    })
  }

  const handleCouponUpdate = (data: CouponFormData) => {
    if (!editingCoupon) return

    // API 요청 형식으로 변환
    const requestData: {
      coupon_name?: string
      coupon_type?: 'PERCENTAGE' | 'FIXED_AMOUNT'
      discount_value?: number
      start_date?: string
      end_date?: string
      description?: string
      min_order_amount?: number
      max_discount_amount?: number
    } = {
      coupon_name: data.name,
      coupon_type:
        data.discountType === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discount_value: data.discountValue,
      start_date: data.validFrom,
      end_date: data.validTo,
    }

    // 선택 필드 추가
    if (data.description !== undefined) {
      requestData.description = data.description || undefined
    }
    if (data.minOrderAmount !== undefined) {
      requestData.min_order_amount =
        data.minOrderAmount > 0 ? data.minOrderAmount : undefined
    }
    if (data.maxDiscountAmount !== undefined) {
      requestData.max_discount_amount =
        data.maxDiscountAmount > 0 ? data.maxDiscountAmount : undefined
    }

    updateCouponMutation.mutate(
      { id: editingCoupon.id, data: requestData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
          setEditingCoupon(null)
          // 쿼리 무효화로 자동 새로고침됨
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<ApiErrorResponse>
          const message =
            axiosError.response?.data?.message ||
            error.message ||
            '쿠폰 수정에 실패했습니다.'
          alert(message)
        },
      }
    )
  }

  // API 응답을 기존 Coupon 형식으로 변환
  const convertApiCouponToCoupon = (apiCoupon: ApiCoupon): Coupon => {
    return {
      id: apiCoupon.id,
      name: apiCoupon.coupon_name,
      description: apiCoupon.description,
      discountType:
        apiCoupon.coupon_type === 'PERCENTAGE' ? 'percentage' : 'fixed',
      discountValue: apiCoupon.discount_value,
      minOrderAmount: apiCoupon.min_order_amount,
      maxDiscountAmount: apiCoupon.max_discount_amount,
      validFrom: apiCoupon.start_date,
      validTo: apiCoupon.end_date,
      usageCount: apiCoupon.usage_count,
      status: apiCoupon.is_active,
    }
  }

  // 변환된 쿠폰 목록
  const convertedCoupons = coupons.map(convertApiCouponToCoupon)

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    }
    return `${formatPrice(coupon.discountValue)}원`
  }

  // 페이지 번호 생성 (최대 10개까지 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPages = 10

    if (totalPages <= maxPages) {
      // 전체 페이지가 10개 이하인 경우 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 현재 페이지 기준으로 앞뒤 페이지 표시
      if (currentPage <= 5) {
        // 앞부분
        for (let i = 1; i <= 7; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 4) {
        // 뒷부분
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 중간
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex justify-end items-center">
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
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-semibold text-gray-700">전체 쿠폰</div>
            <img src={ticketIcon} alt="쿠폰 아이콘" className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-black mb-2">
            {statistics.totalCoupons}
          </div>
          <div className="text-sm text-gray-500">생성된 쿠폰 수</div>
        </div>

        {/* 활성 쿠폰 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-semibold text-gray-700">활성 쿠폰</div>
            <img src={ticketIcon} alt="쿠폰 아이콘" className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {statistics.activeCoupons}
          </div>
          <div className="text-sm text-gray-500">현재 사용 가능</div>
        </div>

        {/* 비활성 쿠폰 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-semibold text-gray-700">
              비활성 쿠폰
            </div>
            <img src={ticketIcon} alt="쿠폰 아이콘" className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {statistics.inactiveCoupons}
          </div>
          <div className="text-sm text-gray-500">사용 중지된 쿠폰</div>
        </div>

        {/* 총 사용량 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-semibold text-gray-700">총 사용량</div>
            <svg
              className="w-6 h-6 text-gray-400"
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
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {statistics.totalUsage}
          </div>
          <div className="text-sm text-gray-500">누적 사용 횟수</div>
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

        <div className="coupon-table-scroll overflow-x-scroll">
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
                <th className="w-40 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-600"
                  >
                    쿠폰 목록을 불러오는 중...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    쿠폰 목록을 불러오는 중 오류가 발생했습니다.
                  </td>
                </tr>
              )}
              {!isLoading && !error && convertedCoupons.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    등록된 쿠폰이 없습니다.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                convertedCoupons.map(coupon => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* 쿠폰명 */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black truncate">
                          {coupon.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-1 truncate">
                          {coupon.description}
                        </span>
                      </div>
                    </td>

                    {/* 할인 */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 text-sm text-black border border-gray-300 rounded-lg whitespace-nowrap">
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
                      <div className="flex flex-col">
                        <span className="text-sm text-black">
                          {coupon.validFrom}
                        </span>
                        <span className="text-sm text-black">
                          ~ {coupon.validTo}
                        </span>
                      </div>
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
                          disabled={toggleCouponMutation.isPending}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            coupon.status ? 'bg-blue-600' : 'bg-gray-300'
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
                      <div className="flex justify-center gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(coupon.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors whitespace-nowrap"
                          aria-label="수정"
                        >
                          <svg
                            className="w-4 h-4 text-gray-700 flex-shrink-0"
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
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            수정
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 rounded transition-colors whitespace-nowrap"
                          aria-label="삭제"
                        >
                          <svg
                            className="w-4 h-4 text-red-700 flex-shrink-0"
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
                          <span className="text-sm text-red-700 whitespace-nowrap">
                            삭제
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {!isLoading && statistics.totalCoupons > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6 pb-4">
            {/* 이전 페이지 */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {/* 페이지 번호 */}
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm text-gray-500"
                  >
                    ...
                  </span>
                )
              }

              const pageNumber = page as number
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}

            {/* 다음 페이지 */}
            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 쿠폰 생성 모달 */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCouponSubmit}
        isLoading={createCouponMutation.isPending}
        mode="create"
      />

      {/* 쿠폰 수정 모달 */}
      <CouponModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCoupon(null)
        }}
        onSubmit={handleCouponUpdate}
        isLoading={updateCouponMutation.isPending}
        mode="edit"
        initialData={
          editingCoupon
            ? {
                name: editingCoupon.name,
                discountType: editingCoupon.discountType,
                discountValue: editingCoupon.discountValue,
                minOrderAmount: editingCoupon.minOrderAmount,
                maxDiscountAmount: editingCoupon.maxDiscountAmount,
                validFrom: editingCoupon.validFrom,
                validTo: editingCoupon.validTo,
                description: editingCoupon.description || '',
              }
            : null
        }
      />
    </div>
  )
}

export { BenefitManagement as Component }
