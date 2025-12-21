import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  sellerApi,
  type SellerApplicationDetail,
  type UpdateSellerApplicationStatusRequest,
} from '@/lib/api/seller'

const SellerApplicationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const applicationId = id ? parseInt(id, 10) : 0

  const [statusToUpdate, setStatusToUpdate] = useState<
    'APPROVED' | 'REJECTED' | null
  >(null)
  const [fileRejections, setFileRejections] = useState<
    Record<number, string>
  >({})
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  // 상세 정보 조회
  const { data: detailData, isLoading } = useQuery({
    queryKey: ['sellerApplicationDetail', applicationId],
    queryFn: () => sellerApi.getSellerApplicationDetail(applicationId),
    enabled: !!applicationId,
  })

  // 상태 업데이트 mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: UpdateSellerApplicationStatusRequest) =>
      sellerApi.updateSellerApplicationStatus(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sellerApplicationDetail', applicationId],
      })
      queryClient.invalidateQueries({ queryKey: ['sellerApplications'] })
      setShowRejectionModal(false)
      setStatusToUpdate(null)
      setFileRejections({})
      alert('신청 상태가 변경되었습니다.')
    },
    onError: (error: any) => {
      console.error('상태 변경 실패:', error)
      alert(
        error?.response?.data?.message ||
          '신청 상태 변경에 실패했습니다. 다시 시도해주세요.'
      )
    },
  })

  const application = detailData?.data

  const handleStatusChange = (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED') {
      setStatusToUpdate('REJECTED')
      setShowRejectionModal(true)
    } else {
      if (confirm('이 신청을 승인하시겠습니까?')) {
        updateStatusMutation.mutate({ status: 'APPROVED' })
      }
    }
  }

  const handleRejectionSubmit = () => {
    const fileRejectionsArray = Object.entries(fileRejections)
      .filter(([_, reason]) => reason.trim())
      .map(([fileId, reason]) => ({
        file_id: parseInt(fileId, 10),
        rejected_reason: reason,
      }))

    updateStatusMutation.mutate({
      status: 'REJECTED',
      file_rejections: fileRejectionsArray.length > 0 ? fileRejectionsArray : undefined,
    })
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">신청 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/seller-application')}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/seller-application')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>뒤로가기</span>
        </button>
        {application.status === 'PENDING' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('APPROVED')}
              disabled={updateStatusMutation.isPending}
              className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              승인
            </button>
            <button
              onClick={() => handleStatusChange('REJECTED')}
              disabled={updateStatusMutation.isPending}
              className="px-4 py-2 bg-red-700 text-white text-sm font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              거절
            </button>
          </div>
        )}
      </div>

      {/* 신청일 & 신청 상태 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          신청일 & 신청 상태
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              신청일
            </label>
            <p className="text-base text-gray-900">
              {formatDate(application.applied_at)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              신청 상태
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeStyle(
                application.status
              )}`}
            >
              {application.status_display}
            </span>
          </div>
          {application.processed_at && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                처리일
              </label>
              <p className="text-base text-gray-900">
                {formatDate(application.processed_at)}
              </p>
            </div>
          )}
          {application.processed_by_name && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                처리자
              </label>
              <p className="text-base text-gray-900">
                {application.processed_by_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 신청자 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          신청자 정보
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              이름
            </label>
            <p className="text-base text-gray-900">{application.applicant_name}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              아이디
            </label>
            <p className="text-base text-gray-900">
              {application.applicant_username}
            </p>
          </div>
        </div>
      </div>

      {/* 사업체 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          사업체 정보
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              상호명
            </label>
            <p className="text-base text-gray-900">{application.business_name}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              사업자등록번호
            </label>
            <p className="text-base text-gray-900">
              {application.business_number || '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              대표자명
            </label>
            <p className="text-base text-gray-900">
              {application.representative_name || '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              주소
            </label>
            <p className="text-base text-gray-900">
              {application.business_address || '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              전화번호
            </label>
            <p className="text-base text-gray-900">
              {application.business_phone || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          연락처 정보
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              휴대폰
            </label>
            <p className="text-base text-gray-900">{application.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              이메일
            </label>
            <p className="text-base text-gray-900">{application.email}</p>
          </div>
        </div>
      </div>

      {/* 농장 소개 */}
      {application.farm_description && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            농장 소개
          </h2>
          <p className="text-base text-gray-900 whitespace-pre-wrap">
            {application.farm_description}
          </p>
        </div>
      )}

      {/* 계좌 정보 */}
      {(application.bank_name ||
        application.account_number ||
        application.account_holder) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            계좌 정보
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                은행명
              </label>
              <p className="text-base text-gray-900">
                {application.bank_name || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                계좌번호
              </label>
              <p className="text-base text-gray-900">
                {application.account_number || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                예금주
              </label>
              <p className="text-base text-gray-900">
                {application.account_holder || '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 첨부 서류 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          첨부 서류
        </h2>
        <div className="space-y-4">
          {application.files && application.files.length > 0 ? (
            application.files.map(file => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {file.kinds}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.original_filename}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(
                      file.status
                    )}`}
                  >
                    {file.status === 'APPROVED'
                      ? '승인'
                      : file.status === 'REJECTED'
                        ? '거절'
                        : '검토 중'}
                  </span>
                </div>
                {file.rejected_reason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">
                      거절 사유: {file.rejected_reason}
                    </p>
                  </div>
                )}
                <div className="mt-3">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    파일 보기
                  </a>
                </div>
                {showRejectionModal && statusToUpdate === 'REJECTED' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      거절 사유 (선택사항)
                    </label>
                    <textarea
                      value={fileRejections[file.id] || ''}
                      onChange={e =>
                        setFileRejections(prev => ({
                          ...prev,
                          [file.id]: e.target.value,
                        }))
                      }
                      placeholder="거절 사유를 입력하세요"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">첨부된 서류가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 거절 모달 */}
      {showRejectionModal && statusToUpdate === 'REJECTED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto mx-4">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                신청 거절
              </h2>
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setStatusToUpdate(null)
                  setFileRejections({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  안내사항
                </p>
                <p className="text-sm text-blue-700">
                  거절할 서류에 대해서만 거절 사유를 작성해주세요. 거절 사유가 입력된 서류만 거절 처리됩니다.
                </p>
              </div>
              <div className="space-y-4">
                {application.files &&
                  application.files.map(file => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {file.kinds}
                      </label>
                      <textarea
                        value={fileRejections[file.id] || ''}
                        onChange={e =>
                          setFileRejections(prev => ({
                            ...prev,
                            [file.id]: e.target.value,
                          }))
                        }
                        placeholder="거절 사유를 입력하세요 (거절할 서류에만 입력)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setStatusToUpdate(null)
                  setFileRejections({})
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleRejectionSubmit}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-red-700 text-white text-sm font-medium rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateStatusMutation.isPending ? '처리 중...' : '거절하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerApplicationDetail

