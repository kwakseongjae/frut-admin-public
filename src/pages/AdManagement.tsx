import { useState, useMemo } from 'react'
import { dummyAds, dummyAdHistory, type Ad } from '@/constants/dummy'

const AdManagement = () => {
  const [ads, setAds] = useState<Ad[]>(dummyAds)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  // 통계 계산
  const statistics = useMemo(() => {
    const activeAds = ads.filter(ad => ad.isActive)
    const totalViews = activeAds.reduce((sum, ad) => sum + ad.views, 0)
    const totalClicks = activeAds.reduce((sum, ad) => sum + ad.clicks, 0)
    const averageCTR =
      activeAds.length > 0
        ? activeAds.reduce((sum, ad) => sum + ad.ctr, 0) / activeAds.length
        : 0

    return {
      totalViews,
      totalClicks,
      averageCTR,
    }
  }, [ads])

  const handleStatusToggle = (id: number) => {
    setAds(prev =>
      prev.map(ad => {
        if (ad.id === id) {
          const newIsActive = !ad.isActive
          return {
            ...ad,
            isActive: newIsActive,
            status: newIsActive ? 'in_progress' : 'stopped',
          }
        }
        return ad
      })
    )
  }

  const handleEdit = (id: number) => {
    // TODO: 광고 수정 기능
    console.log('Edit ad:', id)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR')
  }

  const formatCTR = (ctr: number) => {
    return `${ctr.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <h1 className="text-2xl font-bold text-black">광고 관리</h1>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            현재 광고
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            광고 히스토리
          </button>
        </nav>
      </div>

      {/* 현재 광고 탭 컨텐츠 */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4">
            {/* 총 조회수 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatNumber(statistics.totalViews)}
                  </div>
                  <div className="text-sm text-gray-500">
                    현재 진행중인 광고
                  </div>
                </div>
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div className="text-lg font-semibold text-gray-700">
                총 조회수
              </div>
            </div>

            {/* 총 클릭수 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {formatNumber(statistics.totalClicks)}
                  </div>
                  <div className="text-sm text-gray-500">
                    현재 진행중인 광고
                  </div>
                </div>
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
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div className="text-lg font-semibold text-gray-700">
                총 클릭수
              </div>
            </div>

            {/* 평균 CTR */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {formatCTR(statistics.averageCTR)}
                  </div>
                  <div className="text-sm text-gray-500">전체 클릭률</div>
                </div>
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
              <div className="text-lg font-semibold text-gray-700">
                평균 CTR
              </div>
            </div>
          </div>

          {/* 광고 카드 */}
          <div className="grid grid-cols-3 gap-4">
            {ads.map(ad => (
              <div
                key={ad.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* 광고 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-black">
                        {ad.title}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ad.status === 'in_progress'
                            ? 'bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {ad.status === 'in_progress' ? '진행중' : '중지'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{ad.advertiser}</p>
                  </div>
                  <button
                    onClick={() => handleStatusToggle(ad.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      ad.isActive ? 'bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`광고 ${ad.isActive ? '활성' : '비활성'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        ad.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 광고 이미지 영역 */}
                <div className="mb-4">
                  {ad.isActive ? (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">
                        광고 중지됨
                      </span>
                    </div>
                  )}
                </div>

                {/* 광고 상세 정보 */}
                <div className="space-y-3 mb-4">
                  {/* 기간 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      기간:
                    </span>
                    <span className="text-sm text-black">
                      {ad.periodStart} ~ {ad.periodEnd}
                    </span>
                  </div>

                  {/* 연결 URL */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      연결 URL:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-black truncate max-w-[200px]">
                        {ad.connectedUrl}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 성과 지표 */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">조회수</div>
                      <div className="text-sm font-bold text-blue-600">
                        {formatNumber(ad.views)}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">클릭수</div>
                      <div className="text-sm font-bold text-green-600">
                        {formatNumber(ad.clicks)}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">CTR</div>
                      <div className="text-sm font-bold text-purple-600">
                        {formatCTR(ad.ctr)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 수정 버튼 */}
                <button
                  onClick={() => handleEdit(ad.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                  <span>수정</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 광고 히스토리 탭 컨텐츠 */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              광고 히스토리
            </h2>
            <p className="text-sm text-gray-500">
              이전에 진행된 광고들의 성과를 확인할 수 있습니다.
            </p>
          </div>

          {/* 광고 히스토리 리스트 */}
          <div className="space-y-4">
            {dummyAdHistory.map(history => (
              <div
                key={history.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  {/* 왼쪽: 타입, 이름, 상태 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {history.type === 'main'
                          ? '메인광고'
                          : history.type === 'middle'
                            ? '중간광고'
                            : '마이페이지광고'}
                      </span>
                      <h3 className="text-lg font-semibold text-black">
                        {history.name}
                      </h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        완료
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        {history.advertiser}
                      </p>
                      <p className="text-sm text-gray-500">
                        {history.periodStart} ~ {history.periodEnd}
                      </p>
                    </div>
                  </div>

                  {/* 오른쪽: 성과 지표 */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-gray-600 mb-1">조회수</div>
                      <div className="text-sm font-bold text-blue-600">
                        {formatNumber(history.views)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600 mb-1">클릭수</div>
                      <div className="text-sm font-bold text-green-600">
                        {formatNumber(history.clicks)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600 mb-1">CTR</div>
                      <div className="text-sm font-bold text-purple-600">
                        {formatCTR(history.ctr)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { AdManagement as Component }
