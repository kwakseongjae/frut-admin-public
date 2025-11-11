import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyUsers } from '@/constants/dummy'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memo, setMemo] = useState('')

  // 더미 데이터에서 유저 찾기
  const user = dummyUsers.find(u => u.id === Number(id))

  if (!user) {
    return <div>유저를 찾을 수 없습니다.</div>
  }

  const handleBackToList = () => {
    navigate('/user-management')
  }

  const handleDelete = () => {
    if (confirm('정말로 이 유저를 삭제하시겠습니까?')) {
      console.log('유저 삭제:', user.id)
    }
  }

  const handleSave = () => {
    console.log('유저 정보 저장:', user.id, memo)
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
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽 컬럼 */}
        <div className="space-y-6">
          {/* 회원 정보 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">회원 정보</h2>

            {/* 프로필 이미지 - 상단 가운데 정렬 */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">
                  프로필
                </span>
              </div>
            </div>

            {/* 입력 필드들 - 1열 플렉스 */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  placeholder="이름"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처
                </label>
                <input
                  type="text"
                  placeholder="연락처"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계정
                </label>
                <input
                  type="text"
                  defaultValue={user.userId}
                  placeholder="계정"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="비밀번호"
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
                    초기화
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소셜 로그인
                </label>
                <input
                  type="text"
                  placeholder="소셜 로그인"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  placeholder="이메일"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  동의
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  마케팅수신 동의 (선택)
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  동의
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
                  2025-00-00 00:00:00
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">구매 횟수</span>
                <span className="text-sm font-medium text-gray-900">00회</span>
              </div>
            </div>
          </div>

          {/* 포인트 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">포인트</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">가입일</span>
                <span className="text-sm font-medium text-gray-900">
                  2025-00-00 00:00:00
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">구매 횟수</span>
                <span className="text-sm font-medium text-gray-900">00회</span>
              </div>
            </div>
          </div>

          {/* 판매자 정보 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              판매자 정보
            </h2>

            <div className="space-y-4">
              {user.isSeller ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">농장명</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.nickname}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">판매자 등록일</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.joinDate}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  판매자가 정보가 들어갑니다..
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
