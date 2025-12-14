import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const Sidebar = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const scrollTop = navRef.current.scrollTop
        setIsScrolled(scrollTop > 0)
      }
    }

    const navElement = navRef.current
    if (navElement) {
      navElement.addEventListener('scroll', handleScroll)
      return () => navElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const menuItems = [
    {
      path: '/user-management',
      label: '유저관리',
      icon: 'profile',
      subpages: [
        { label: '유저 관리', path: '/user-management' },
        { label: '판매자 신청관리', path: '/seller-application' },
      ],
    },
    {
      path: '/product-management',
      label: '상품관리',
      icon: 'cart',
      subpages: [
        { label: '상품 관리', path: '/product-management' },
        { label: '카테고리 관리', path: '/category-management' },
        { label: '뱃지 관리', path: '/badge-management' },
      ],
    },
    {
      path: '/special-offers',
      label: '특가',
      icon: 'discount_coupon',
      subpages: [
        { label: '특가 상품', path: '/special-offers' },
        { label: '구매 관리', path: '/purchase-management' },
      ],
    },
    {
      path: '/settlement',
      label: '정산',
      icon: 'calculator',
      subpages: [
        { label: '매출', path: '/sales' },
        { label: '판매자별 정산', path: '/seller-settlement' },
      ],
    },
    {
      path: '/benefit-management',
      label: '혜택관리',
      icon: 'label_tag',
      subpages: [
        { label: '쿠폰 관리', path: '/coupon-management' },
        { label: '포인트 관리', path: '/point-management' },
      ],
    },
    {
      path: '/ad-management',
      label: '광고관리',
      icon: 'speaker',
      subpages: [
        { label: '광고 관리', path: '/ad-management' },
        // { label: '광고 문의', path: '/ad-inquiry' },
      ],
    },
    // {
    //   path: '/customer-service',
    //   label: '고객센터',
    //   icon: 'headphone',
    //   subpages: [
    //     { label: '공지사항', path: '/customer-ad-management' },
    //     { label: 'FAQ', path: '/customer-ad-inquiry' },
    //   ],
    // },
    {
      path: '/popup-management',
      label: '팝업관리',
      icon: 'card',
      subpages: [],
    },
  ]

  const renderIcon = (iconName: string) => {
    return (
      <img
        src={`/src/assets/svg/ic_${iconName}.svg`}
        alt={iconName}
        className="w-5 h-5"
      />
    )
  }

  return (
    <div className="w-64 bg-white text-gray-800 h-screen border-r border-gray-200 flex flex-col">
      <div
        className={`flex justify-center h-15 shrink-0 relative transition-shadow duration-200 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <img
          src="/src/assets/svg/logo.svg"
          alt="Logo"
          className="w-15 h-auto"
        />
      </div>
      <nav ref={navRef} className="flex-1 overflow-y-auto scrollbar-hide pb-8">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.path}>
              {/* 메인 메뉴 아이템 */}
              <Link
                to={
                  item.subpages.length > 0 ? item.subpages[0].path : item.path
                }
                className={`flex items-center px-6 py-3 text-base font-bold transition-all duration-200 ${
                  item.subpages.length === 0 && location.pathname === item.path
                    ? 'text-black border-r-4 bg-gray-200'
                    : 'text-black hover:text-gray-800 hover:bg-gray-100'
                }`}
                style={{
                  borderRightColor:
                    item.subpages.length === 0 &&
                    location.pathname === item.path
                      ? '#133A1B'
                      : 'transparent',
                }}
              >
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  {renderIcon(item.icon)}
                </div>
                {item.label}
              </Link>

              {/* 서브페이지 */}
              {item.subpages.length > 0 && (
                <div className="ml-12 flex flex-col">
                  {item.subpages.map(subpage => (
                    <Link
                      key={subpage.path}
                      to={subpage.path}
                      className={`w-full px-6 py-1.5 text-sm font-normal transition-all duration-200 cursor-pointer ${
                        location.pathname === subpage.path
                          ? 'text-gray-800 bg-gray-200 border-r-4'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      style={{
                        borderRightColor:
                          location.pathname === subpage.path
                            ? '#133A1B'
                            : 'transparent',
                      }}
                    >
                      {subpage.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
