import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userApi, type UserDetail as UserDetailType } from '@/lib/api/user'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memo, setMemo] = useState('')
  const [user, setUser] = useState<UserDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 편집 가능한 필드 상태
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    email: '',
  })

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const response = await userApi.getUserDetail(Number(id))
        setUser(response.data)
        setMemo(response.data.user_note || '')
        setFormData({
          name: response.data.name,
          phone: response.data.phone || '',
          username: response.data.username,
          email: response.data.email,
        })
      } catch (err) {
        setError('유저 정보를 불러오는데 실패했습니다.')
        console.error('Failed to fetch user detail:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetail()
  }, [id])

  const handleBackToList = () => {
    navigate('/user-management')
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !id) return

    try {
      setDeleting(true)
      setError(null)
      await userApi.deleteUser(Number(id))
      // 삭제 성공 시 리스트 페이지로 이동
      navigate('/user-management')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        '유저 삭제에 실패했습니다.'
      setError(errorMessage)
      setShowDeleteConfirm(false)
      console.error('Failed to delete user:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user || !id) return

    try {
      setResettingPassword(true)
      setError(null)
      setSuccessMessage(null)
      const response = await userApi.resetPassword(Number(id))
      setTempPassword(response.data.temp_password)
      setSuccessMessage('비밀번호가 초기화되었습니다.')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        '비밀번호 초기화에 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to reset password:', err)
    } finally {
      setResettingPassword(false)
    }
  }

  const handleCopyPassword = async () => {
    if (!tempPassword) return

    try {
      await navigator.clipboard.writeText(tempPassword)
      setPasswordCopied(true)
      setSuccessMessage('비밀번호가 클립보드에 복사되었습니다.')
      setTimeout(() => {
        setSuccessMessage(null)
        setPasswordCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy password:', err)
      setError('클립보드 복사에 실패했습니다.')
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    setSuccessMessage(null)
    setError(null)
    // 해당 필드의 에러 메시지 제거
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    if (!user || !id) return

    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      // 변경된 필드만 전송
      const updateData: {
        name?: string
        phone?: string
        username?: string
        email?: string
        user_note?: string
      } = {}

      if (formData.name !== user.name) {
        updateData.name = formData.name
      }
      if (formData.phone !== (user.phone || '')) {
        updateData.phone = formData.phone || undefined
      }
      if (formData.username !== user.username) {
        updateData.username = formData.username
      }
      if (formData.email !== user.email) {
        updateData.email = formData.email
      }
      if (memo !== (user.user_note || '')) {
        updateData.user_note = memo || undefined
      }

      // 변경사항이 없으면 리턴
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage('변경사항이 없습니다.')
        return
      }

      const response = await userApi.updateUser(Number(id), updateData)
      // activity_history가 없으면 기존 값 유지
      const updatedUser = {
        ...response.data,
        activity_history:
          response.data.activity_history || user?.activity_history || [],
        seller_info: response.data.seller_info || user?.seller_info || null,
      }
      setUser(updatedUser)
      setMemo(response.data.user_note || '')
      setFormData({
        name: response.data.name,
        phone: response.data.phone || '',
        username: response.data.username,
        email: response.data.email,
      })
      setSuccessMessage('유저 정보가 성공적으로 저장되었습니다.')
      setFieldErrors({})
    } catch (err: any) {
      const errorData = err.response?.data
      const errorMessage =
        errorData?.message || err.message || '유저 정보 저장에 실패했습니다.'

      setError(errorMessage)

      // 필드별 에러 메시지 처리
      if (errorData?.data && typeof errorData.data === 'object') {
        const fieldErrorsObj: Record<string, string[]> = {}
        Object.keys(errorData.data).forEach(key => {
          if (Array.isArray(errorData.data[key])) {
            fieldErrorsObj[key] = errorData.data[key]
          }
        })
        setFieldErrors(fieldErrorsObj)
      } else {
        setFieldErrors({})
      }

      console.error('Failed to update user:', err)
    } finally {
      setSaving(false)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 활동 정보 타입별 아이콘 및 텍스트
  const getActivityInfo = (activity: UserDetailType['activity_history'][0]) => {
    switch (activity.type) {
      case 'purchase':
        return {
          icon: '🛒',
          label: '구매',
          content: activity.product_name || '상품명 없음',
        }
      case 'point_use':
        return {
          icon: '💰',
          label: '포인트 사용',
          content: `-${activity.point_amount?.toLocaleString() || 0}P`,
        }
      case 'coupon_acquire':
        return {
          icon: '🎫',
          label: '쿠폰 획득',
          content: activity.coupon_name || '쿠폰명 없음',
        }
      case 'coupon_use':
        return {
          icon: '🎁',
          label: '쿠폰 사용',
          content:
            activity.discount_percentage !== undefined
              ? `${activity.discount_percentage}% 할인`
              : `₩${activity.discount_amount?.toLocaleString() || 0} 할인`,
        }
      default:
        return { icon: '📝', label: '활동', content: '' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  // 초기 로딩 실패 시에만 에러 화면 표시 (저장 시 에러는 UI 유지)
  if (!user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          {error || '유저를 찾을 수 없습니다.'}
        </div>
      </div>
    )
  }

  // user가 없으면 렌더링하지 않음
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* 상단 네비게이션과 액션 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBackToList}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          <span className="font-medium">리스트로 돌아가기</span>
        </button>

        <div className="flex space-x-3">
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving || deleting}
          >
            삭제
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving || deleting}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 삭제 확인 알림 */}
      {showDeleteConfirm && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    사용자 삭제 확인
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수
                    없습니다.
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {user?.name} ({user?.username})
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={deleting}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 성공/에러 메시지 */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="font-medium mb-1">{error}</div>
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              {Object.entries(fieldErrors).map(([field, messages]) =>
                messages.map((message, index) => (
                  <li key={`${field}-${index}`}>{message}</li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {/* 메인 컨텐츠 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽 컬럼 */}
        <div className="space-y-6">
          {/* 회원 정보 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">회원 정보</h2>

            {/* 프로필 이미지 - 상단 가운데 정렬 */}
            <div className="flex flex-col items-center mb-6">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-sm font-medium">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* 비밀번호 초기화 버튼 */}
              <button
                onClick={handleResetPassword}
                disabled={resettingPassword || saving || deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resettingPassword ? '초기화 중...' : '비밀번호 초기화'}
              </button>

              {/* 임시 비밀번호 표시 */}
              {tempPassword && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full max-w-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 mb-1">
                        임시 비밀번호
                      </p>
                      <p
                        className="text-sm font-mono font-semibold text-blue-900 break-all cursor-pointer"
                        onClick={handleCopyPassword}
                        title="클릭하여 복사"
                      >
                        {tempPassword}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyPassword}
                      className={`shrink-0 p-2 rounded transition-colors ${
                        passwordCopied
                          ? 'text-green-600 bg-green-100'
                          : 'text-blue-600 hover:bg-blue-100'
                      }`}
                      title={passwordCopied ? '복사됨' : '클립보드에 복사'}
                    >
                      {passwordCopied ? (
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 입력 필드들 - 1열 플렉스 */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.name
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="010-1234-5678"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.phone
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.phone[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계정 (아이디)
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.username
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.username[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  유저 타입
                </label>
                <div className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.user_type === 'SELLER'
                      ? '판매자'
                      : user.user_type === 'BUYER'
                        ? '소비자'
                        : '관리자'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 동의 정보 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">동의 정보</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  이용약관 동의 (필수)
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  동의
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  개인정보처리방침 동의 (필수)
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.seller_info?.privacy_policy_agreed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.seller_info?.privacy_policy_agreed ? '동의' : '미동의'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  마케팅수신 동의 (선택)
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_marketing_consented
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.is_marketing_consented ? '동의' : '미동의'}
                </span>
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">메모</h2>

            <div className="relative">
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="메모를 입력하세요"
                className="w-full h-40 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-auto"
                maxLength={1500}
              />
              <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                {memo.length}/1500
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="space-y-6">
          {/* 활동 정보 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">활동 정보</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">가입일</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(user.date_joined)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">구매 횟수</span>
                <span className="text-sm font-medium text-gray-900">
                  {(user.activity_history || []).filter(
                    a => a.type === 'purchase'
                  ).length || 0}
                  회
                </span>
              </div>
            </div>

            {/* 활동 내역 */}
            {(user.activity_history || []).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  활동 내역
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(user.activity_history || []).map((activity, index) => {
                    const activityInfo = getActivityInfo(activity)
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-xl">{activityInfo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {activityInfo.label}
                            </span>
                            {activity.date && (
                              <span className="text-xs text-gray-500">
                                {formatDate(activity.date)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {activityInfo.content}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {(!user.activity_history || user.activity_history.length === 0) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center py-4">
                  활동 내역이 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 포인트 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">포인트</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">포인트 잔액</span>
                <span className="text-lg font-bold text-blue-600">
                  {user.point_balance.toLocaleString()}P
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">포인트 사용 횟수</span>
                <span className="text-sm font-medium text-gray-900">
                  {(user.activity_history || []).filter(
                    a => a.type === 'point_use'
                  ).length || 0}
                  회
                </span>
              </div>
            </div>
          </div>

          {/* 판매자 정보 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              판매자 정보
            </h2>

            <div className="space-y-4">
              {user.seller_info ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">농장명</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.seller_info.farm_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">판매자 등록일</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(user.seller_info.seller_registration_date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      개인정보 처리방침 동의
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.seller_info.privacy_policy_agreed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.seller_info.privacy_policy_agreed
                        ? '동의'
                        : '미동의'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">사업자 인증</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.seller_info.business_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.seller_info.business_verified
                        ? '인증 완료'
                        : '미인증'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">안전식품 인증</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.seller_info.safety_certified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.seller_info.safety_certified
                        ? '인증 완료'
                        : '미인증'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  판매자 정보가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { UserDetail as Component }
