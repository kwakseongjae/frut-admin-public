import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        lazy: () => import('@/pages/AdminProfile'), // 관리자 프로필 페이지 (기본 페이지)
      },
      {
        path: 'admin-profile',
        lazy: () => import('@/pages/AdminProfile'), // 관리자 프로필 페이지
      },
      {
        path: 'user-management',
        lazy: () => import('@/pages/user-management/UserManagement'), // 유저관리 페이지
      },
      {
        path: 'seller-application',
        lazy: () =>
          import('@/pages/user-management/SellerApplication').then(module => ({
            Component: module.default,
          })), // 판매자 신청 관리 페이지
      },
      {
        path: 'user-detail/:id',
        lazy: () => import('@/pages/user-management/UserDetail'), // 유저 상세 페이지
      },
      {
        path: 'product-management',
        lazy: () =>
          import('@/pages/product-management/ProductManagement').then(
            module => ({
              Component: module.default,
            })
          ), // 상품관리 페이지
      },
      {
        path: 'category-management',
        lazy: () =>
          import('@/pages/product-management/CategoryManagement').then(
            module => ({
              Component: module.default,
            })
          ), // 카테고리 관리 페이지
      },
      {
        path: 'badge-management',
        lazy: () =>
          import('@/pages/product-management/BadgeManagement').then(module => ({
            Component: module.default,
          })), // 뱃지 관리 페이지
      },
      {
        path: 'special-offers',
        lazy: () => import('@/pages/SpecialOffers'), // 특가 페이지
      },
      {
        path: 'purchase-management',
        lazy: () => import('@/pages/PurchaseManagement'), // 구매 관리 페이지
      },
      {
        path: 'settlement',
        lazy: () => import('@/pages/Settlement'), // 정산 페이지
      },
      {
        path: 'sales',
        lazy: () => import('@/pages/Settlement'), // 매출 페이지
      },
      {
        path: 'seller-settlement',
        lazy: () => import('@/pages/SellerSettlement'), // 판매자별 정산 페이지
      },
      {
        path: 'benefit-management',
        lazy: () => import('@/pages/BenefitManagement'), // 혜택관리 페이지
      },
      {
        path: 'coupon-management',
        lazy: () => import('@/pages/BenefitManagement'), // 쿠폰 관리 페이지
      },
      {
        path: 'point-management',
        lazy: () => import('@/pages/PointManagement'), // 포인트 관리 페이지
      },
      {
        path: 'ad-management',
        lazy: () => import('@/pages/AdManagement'), // 광고관리 페이지
      },
      {
        path: 'ad-inquiry',
        lazy: () => import('@/pages/AdInquiry'), // 광고 문의 페이지
      },
      {
        path: 'customer-service',
        lazy: () => import('@/pages/CustomerService'), // 고객센터 페이지
      },
      {
        path: 'customer-ad-management',
        lazy: () => import('@/pages/CustomerService'), // 공지사항 페이지
      },
      {
        path: 'customer-ad-inquiry',
        lazy: () => import('@/pages/CustomerService'), // FAQ 페이지
      },
      {
        path: 'popup-management',
        lazy: () => import('@/pages/PopupManagement'), // 팝업관리 페이지
      },
    ],
  },
])
