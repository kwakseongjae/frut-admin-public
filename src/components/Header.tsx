import { useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  // 현재 페이지 제목 매핑
  const getPageTitle = (pathname: string) => {
    // 동적 경로 처리
    if (pathname.startsWith('/seller-application/')) {
      return '판매자 신청 상세'
    }
    if (pathname.startsWith('/user-detail/')) {
      return '유저 상세'
    }
    
    const titleMap: Record<string, string> = {
      '/': '유저관리',
      '/user-management': '유저관리',
      '/seller-application': '판매자 신청관리',
      '/product-management': '상품관리',
      '/category-management': '카테고리 관리',
      '/badge-management': '뱃지 관리',
      '/recommended-search-term-management': '추천 검색어 관리',
      '/special-offers': '특가 상품',
      '/purchase-management': '구매 관리',
      '/settlement': '매출 관리',
      '/sales': '매출 관리',
      '/seller-settlement': '판매자별 정산',
      '/benefit-management': '혜택관리',
      '/coupon-management': '쿠폰 관리',
      '/point-management': '포인트 관리',
      '/ad-management': '광고관리',
      '/ad-inquiry': '광고 문의',
      '/customer-service': '고객센터',
      '/customer-ad-management': '공지사항',
      '/customer-ad-inquiry': 'FAQ',
      '/popup-management': '팝업관리',
    }
    return titleMap[pathname] || '관리자 프로필'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle(location.pathname)}
        </h1>
      </div>
    </header>
  )
}

export default Header
