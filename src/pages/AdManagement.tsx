import { useState, useMemo, useEffect, useCallback } from 'react'
import { type Ad, type AdHistory } from '@/constants/dummy'
import { operationApi, type BannerAd } from '@/lib/api/operation'
import BannerAdModal from '@/components/BannerAdModal'

const AdManagement = () => {
  const [ads, setAds] = useState<Ad[]>([])
  const [adHistory, setAdHistory] = useState<AdHistory[]>([])
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAdId, setEditingAdId] = useState<number | null>(null)
  const [aggregates, setAggregates] = useState<{
    total_views: number
    total_clicks: number
    average_ctr: number
    active_ads_count: number
  }>({
    total_views: 0,
    total_clicks: 0,
    average_ctr: 0,
    active_ads_count: 0,
  })

  // API에서 배너 광고 목록 조회
  const fetchBannerAds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await operationApi.getBannerAds()

      // API 응답 구조 확인
      const adsData =
        'data' in response && response.data ? response.data : response

      if (
        !adsData ||
        !('results' in adsData) ||
        !adsData.results ||
        !('aggregates' in adsData)
      ) {
        throw new Error('Invalid API response structure')
      }

      // 모든 광고를 Ad 형식으로 변환 (COMPLETED와 CANCELED 제외)
      const mappedAds: Ad[] = adsData.results
        .filter(
          (item: BannerAd) =>
            item.status !== 'COMPLETED' && item.status !== 'CANCELED'
        )
        .map((item: BannerAd) => {
          let status:
            | 'in_progress'
            | 'pending'
            | 'review'
            | 'completed'
            | 'canceled' = 'in_progress'
          if (item.status === 'IN_PROGRESS') {
            status = 'in_progress'
          } else if (item.status === 'PENDING') {
            status = 'pending'
          } else if (item.status === 'REVIEW') {
            status = 'review'
          }

          return {
            id: item.id,
            title: item.ad_title,
            advertiser: item.ad_company,
            isActive: item.is_active,
            status,
            imageUrl: item.ad_image,
            periodStart: item.start_date,
            periodEnd: item.end_date,
            connectedUrl: item.ad_url,
            views: item.view_count,
            clicks: item.click_count,
            ctr: item.ctr,
          }
        })

      setAds(mappedAds)

      // COMPLETED와 CANCELED만 필터링하여 히스토리로 변환
      const historyAds: AdHistory[] = adsData.results
        .filter(
          (item: BannerAd) =>
            item.status === 'COMPLETED' || item.status === 'CANCELED'
        )
        .map((item: BannerAd) => ({
          id: item.id,
          type: (item.ad_type === 'MAIN'
            ? 'main'
            : item.ad_type === 'MIDDLE'
              ? 'middle'
              : 'mypage') as 'main' | 'middle' | 'mypage',
          name: item.ad_title,
          advertiser: item.ad_company,
          periodStart: item.start_date,
          periodEnd: item.end_date,
          views: item.view_count,
          clicks: item.click_count,
          ctr: item.ctr,
          status: (item.status === 'COMPLETED' ? 'completed' : 'cancelled') as
            | 'completed'
            | 'cancelled',
        }))

      setAdHistory(historyAds)

      // Aggregates 설정
      if (adsData.aggregates) {
        setAggregates({
          total_views: adsData.aggregates.total_views,
          total_clicks: adsData.aggregates.total_clicks,
          average_ctr: adsData.aggregates.average_ctr,
          active_ads_count: adsData.aggregates.active_ads_count,
        })
      }
    } catch (err) {
      setError('배너 광고 목록을 불러오는데 실패했습니다.')
      console.error('Failed to fetch banner ads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBannerAds()
  }, [fetchBannerAds])

  // 통계 계산 - API aggregates 사용
  const statistics = useMemo(() => {
    return {
      totalViews: aggregates.total_views,
      totalClicks: aggregates.total_clicks,
      averageCTR: aggregates.average_ctr,
    }
  }, [aggregates])

  const handleStatusToggle = async (id: number) => {
    try {
      setTogglingId(id)
      const response = await operationApi.toggleBannerAdActive(id)

      // API 응답 구조 확인
      const adData =
        'data' in response && response.data ? response.data : response

      if (!adData || !('status' in adData) || !('is_active' in adData)) {
        throw new Error('Invalid API response structure')
      }

      // 상태 업데이트
      setAds(prev =>
        prev.map(ad => {
          if (ad.id === id) {
            let status:
              | 'in_progress'
              | 'pending'
              | 'review'
              | 'completed'
              | 'canceled' = 'in_progress'
            if (adData.status === 'IN_PROGRESS') {
              status = 'in_progress'
            } else if (adData.status === 'PENDING') {
              status = 'pending'
            } else if (adData.status === 'REVIEW') {
              status = 'review'
            }

            return {
              ...ad,
              isActive: adData.is_active,
              status,
            }
          }
          return ad
        })
      )

      // Aggregates 업데이트 (active_ads_count 변경 가능성)
      if (adData.is_active) {
        setAggregates(prev => ({
          ...prev,
          active_ads_count: prev.active_ads_count + 1,
        }))
      } else {
        setAggregates(prev => ({
          ...prev,
          active_ads_count: Math.max(0, prev.active_ads_count - 1),
        }))
      }
    } catch (err) {
      setError('광고 활성화 상태 변경에 실패했습니다.')
      console.error('Failed to toggle banner ad active:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleEdit = (id: number) => {
    setEditingAdId(id)
    setIsModalOpen(true)
  }

  const handleCreateAd = () => {
    setEditingAdId(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAdId(null)
  }

  const handleModalSuccess = () => {
    fetchBannerAds()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말로 이 광고를 삭제하시겠습니까?')) {
      return
    }

    try {
      setDeletingId(id)
      await operationApi.deleteBannerAd(id)

      // 삭제 후 목록 새로고침
      await fetchBannerAds()
    } catch (err) {
      setError('광고 삭제에 실패했습니다.')
      console.error('Failed to delete banner ad:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR')
  }

  const formatCTR = (ctr: number) => {
    return `${ctr.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'current'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'bg-gray-100 text-gray-900 shadow-md'
          }`}
        >
          <span>현재 광고</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'bg-gray-100 text-gray-900 shadow-md'
          }`}
        >
          <span>광고 히스토리</span>
        </button>
      </div>

      {/* 현재 광고 탭 컨텐츠 */}
      {!loading && !error && activeTab === 'current' && (
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
            {ads.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                등록된 광고가 없습니다.
              </div>
            ) : (
              ads.map(ad => (
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
                            ad.status === 'in_progress' && ad.isActive
                              ? 'bg-green-700 text-white'
                              : ad.status === 'pending'
                                ? 'bg-yellow-500 text-white'
                                : ad.status === 'review'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {ad.status === 'in_progress'
                            ? '진행중'
                            : ad.status === 'pending'
                              ? '대기중'
                              : ad.status === 'review'
                                ? '리뷰중'
                                : '중지'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{ad.advertiser}</p>
                    </div>
                    <button
                      onClick={() => handleStatusToggle(ad.id)}
                      disabled={togglingId === ad.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        ad.isActive ? 'bg-black' : 'bg-gray-300'
                      } ${togglingId === ad.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <div className="mb-4 relative">
                    {ad.imageUrl ? (
                      <>
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {!ad.isActive && (
                          <div className="absolute inset-0 bg-gray-800/50 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-lg drop-shadow-lg">
                              비활성화
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
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
                      <a
                        href={ad.connectedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        <span className="truncate max-w-[200px]">
                          {ad.connectedUrl}
                        </span>
                        <svg
                          className="w-4 h-4 shrink-0"
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
                      </a>
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

                  {/* 수정/삭제 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                    <button
                      onClick={() => handleDelete(ad.id)}
                      disabled={deletingId === ad.id}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors ${
                        deletingId === ad.id
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>삭제</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 현재 광고 탭 로딩/에러 상태 */}
      {loading && activeTab === 'current' && (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      )}
      {error && activeTab === 'current' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 광고 히스토리 탭 컨텐츠 */}
      {!loading && !error && activeTab === 'history' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              광고 히스토리
            </h2>
            <p className="text-sm text-gray-500">
              완료되거나 취소된 광고들의 성과를 확인할 수 있습니다.
            </p>
          </div>

          {/* 광고 히스토리 리스트 */}
          <div className="space-y-4">
            {adHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                완료되거나 취소된 광고가 없습니다.
              </div>
            ) : (
              adHistory.map(history => (
                <div
                  key={history.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between">
                    {/* 왼쪽: 타입, 이름, 상태, 회사명, 기간 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-gray-300 bg-white text-gray-700">
                          {history.type === 'main'
                            ? '메인광고'
                            : history.type === 'middle'
                              ? '중간광고'
                              : '마이페이지광고'}
                        </span>
                        <h3 className="text-lg font-semibold text-black">
                          {history.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            history.status === 'completed'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {history.status === 'completed' ? '완료' : '취소'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700">
                          {history.advertiser}
                        </p>
                        <span className="text-sm text-gray-500">·</span>
                        <p className="text-sm text-gray-500">
                          {history.periodStart} ~ {history.periodEnd}
                        </p>
                      </div>
                    </div>

                    {/* 오른쪽: 성과 지표 및 삭제 버튼 */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600 mb-1">
                          {formatNumber(history.views)}
                        </div>
                        <div className="text-xs text-gray-600">조회수</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600 mb-1">
                          {formatNumber(history.clicks)}
                        </div>
                        <div className="text-xs text-gray-600">클릭수</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-600 mb-1">
                          {formatCTR(history.ctr)}
                        </div>
                        <div className="text-xs text-gray-600">CTR</div>
                      </div>
                      <button
                        onClick={() => handleDelete(history.id)}
                        disabled={deletingId === history.id}
                        className={`flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors ${
                          deletingId === history.id
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        aria-label="삭제"
                      >
                        {deletingId === history.id ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                        <span className="text-sm font-medium">삭제</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 광고 히스토리 탭 로딩/에러 상태 */}
      {loading && activeTab === 'history' && (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      )}
      {error && activeTab === 'history' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={handleCreateAd}
        className="fixed bottom-8 right-8 px-4 py-3 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 z-40"
        aria-label="광고 등록"
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
        <span className="text-sm font-medium">광고생성</span>
      </button>

      {/* 광고 등록/수정 모달 */}
      <BannerAdModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        adId={editingAdId}
      />
    </div>
  )
}

export { AdManagement as Component }
