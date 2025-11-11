interface Badge {
  id: number
  name: string
  status: 'active' | 'inactive'
  usageCount: number
  createdAt: string
}

const BadgeManagement = () => {
  // 더미 데이터
  const badges: Badge[] = [
    {
      id: 1,
      name: '신선',
      status: 'active',
      usageCount: 15,
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: '프리미엄',
      status: 'active',
      usageCount: 8,
      createdAt: '2024-01-20',
    },
    {
      id: 3,
      name: '할인',
      status: 'inactive',
      usageCount: 3,
      createdAt: '2024-01-10',
    },
    {
      id: 4,
      name: '신제품',
      status: 'active',
      usageCount: 12,
      createdAt: '2024-01-25',
    },
    {
      id: 5,
      name: '인기',
      status: 'active',
      usageCount: 22,
      createdAt: '2024-01-18',
    },
    {
      id: 6,
      name: '특가',
      status: 'inactive',
      usageCount: 5,
      createdAt: '2024-01-12',
    },
    {
      id: 7,
      name: '추천',
      status: 'active',
      usageCount: 18,
      createdAt: '2024-01-22',
    },
  ]

  return (
    <div className="space-y-6 bg-white p-5 rounded-[14px]">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">뱃지 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            상품의 뱃지를 관리할 수 있습니다.
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#3C82F6' }}
        >
          + 뱃지 추가
        </button>
      </div>

      {/* 뱃지 리스트 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-[80px_120px_100px_100px_120px_1fr] gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="text-center">뱃지</div>
            <div className="text-center">이름</div>
            <div className="text-center">상태</div>
            <div className="text-center">사용횟수</div>
            <div className="text-center">생성일</div>
            <div className="text-left">관리</div>
          </div>
        </div>

        {/* 테이블 바디 */}
        <div className="divide-y divide-gray-200">
          {badges.map(badge => (
            <div
              key={badge.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-[80px_120px_100px_100px_120px_1fr] gap-4 items-center">
                {/* 뱃지 컬럼 */}
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xs text-gray-500">뱃지</span>
                  </div>
                </div>

                {/* 이름 컬럼 */}
                <div className="text-center text-sm text-gray-900">
                  {badge.name}
                </div>

                {/* 상태 컬럼 */}
                <div className="text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      badge.status === 'active'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {badge.status === 'active' ? '활성' : '비활성'}
                  </span>
                </div>

                {/* 사용횟수 컬럼 */}
                <div className="text-center text-sm text-gray-900">
                  {badge.usageCount}회
                </div>

                {/* 생성일 컬럼 */}
                <div className="text-center text-sm text-gray-900">
                  {badge.createdAt}
                </div>

                {/* 관리 컬럼 */}
                <div className="text-left">
                  <div className="flex space-x-1 whitespace-nowrap">
                    <button className="px-2 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
                      비활성화
                    </button>
                    <button className="px-2 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
                      수정
                    </button>
                    <button className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BadgeManagement
