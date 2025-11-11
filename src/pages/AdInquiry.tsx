import { useState } from 'react'
import { dummyAdInquiries } from '@/constants/dummy'
import type { AdInquiry as AdInquiryType } from '@/constants/dummy'

const AdInquiry = () => {
  const [inquiries, setInquiries] = useState<AdInquiryType[]>(dummyAdInquiries)

  const handleStatusChange = (
    id: number,
    newStatus: AdInquiryType['status']
  ) => {
    setInquiries(prev =>
      prev.map(inquiry =>
        inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
      )
    )
  }

  const handleViewDetails = (id: number) => {
    // TODO: 상세보기 기능
    console.log('View details for inquiry:', id)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const getAdTypeLabel = (type: AdInquiryType['adType']) => {
    const typeMap = {
      main: '메인광고',
      middle: '중간광고',
      mypage: '마이페이지광고',
    }
    return typeMap[type]
  }

  const getStatusOptions = () => {
    return [
      { value: 'pending', label: '대기' },
      { value: 'reviewing', label: '검토중' },
      { value: 'completed', label: '완료' },
      { value: 'cancelled', label: '취소' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <h1 className="text-2xl font-bold text-black">광고 문의</h1>

      {/* 광고 문의 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black mb-1">광고 문의 목록</h2>
          <p className="text-sm text-gray-600">
            총 {inquiries.length}건의 문의가 있습니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회사정보
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  광고유형
                </th>
                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예산
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  문의일
                </th>
                <th className="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map(inquiry => (
                <tr
                  key={inquiry.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 회사정보 */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">
                        {inquiry.companyName}
                      </span>
                      <span className="text-sm text-gray-700">
                        {inquiry.contactName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {inquiry.phoneNumber}
                      </span>
                    </div>
                  </td>

                  {/* 광고유형 */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-black rounded-full">
                      {getAdTypeLabel(inquiry.adType)}
                    </span>
                  </td>

                  {/* 예산 */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-black">
                        {formatPrice(inquiry.budget)}원
                      </span>
                      <span className="text-xs text-gray-500">
                        {inquiry.periodStart} ~ {inquiry.periodEnd}
                      </span>
                    </div>
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={inquiry.status}
                        onChange={e =>
                          handleStatusChange(
                            inquiry.id,
                            e.target.value as AdInquiryType['status']
                          )
                        }
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                      >
                        {getStatusOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
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

                  {/* 문의일 */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-black">
                        {inquiry.inquiryDate}
                      </span>
                      {inquiry.replyDate && (
                        <span className="text-xs text-gray-500">
                          답변: {inquiry.replyDate}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 관리 */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDetails(inquiry.id)}
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

export { AdInquiry as Component }
