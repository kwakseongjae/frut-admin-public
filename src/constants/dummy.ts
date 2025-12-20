export interface User {
  id: number
  name: string
  userId: string
  isSeller: boolean
  nickname: string
  purchaseCount: number
  joinDate: string
  isWithdrawn: boolean
}

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  isRecommended: boolean
  badge: string
  seller: string
  createdAt: string
  status: 'active' | 'inactive'
}

// 한국 이름 리스트
const koreanNames = [
  '김민수',
  '이지영',
  '박서준',
  '최유진',
  '정현우',
  '강소영',
  '윤태호',
  '임수진',
  '송민창',
  '우지혁',
  '최시온',
  '이유림',
  '김동현',
  '박지은',
  '이준호',
  '최수빈',
  '정민호',
  '강예린',
  '윤성민',
  '임지현',
  '송현우',
  '우서연',
  '최동훈',
  '이소영',
  '김태민',
  '박유진',
  '정지훈',
  '강민지',
  '윤현수',
  '임서준',
  '송지영',
  '우민호',
  '최예진',
  '이동현',
  '김수빈',
  '박준호',
  '정소영',
  '강태민',
  '윤유진',
  '임지훈',
  '송민지',
  '우현수',
  '최서준',
  '이지영',
  '김민호',
  '박예진',
  '정동현',
  '강수빈',
  '윤준호',
  '임소영',
  '송태민',
  '우유진',
  '최지훈',
  '이민지',
  '김현수',
  '박서준',
  '정지영',
  '강민호',
  '윤예진',
  '임동현',
  '송수빈',
  '우준호',
  '최소영',
  '이태민',
  '김유진',
  '박지훈',
  '정민지',
  '강현수',
  '윤서준',
  '임지영',
  '송민호',
  '우예진',
  '최동현',
  '이수빈',
  '김준호',
  '박소영',
  '정태민',
  '강유진',
  '윤지훈',
  '임민지',
]

// 농장 이름 리스트
const farmNames = [
  '자이언 농장',
  '딩기링 농장',
  '그린팜',
  '자연농장',
  '친환경농장',
  '토종농장',
  '신선농장',
  '맛있는농장',
  '건강농장',
  '오가닉팜',
  '바이오팜',
  '에코팜',
  '프리미엄팜',
  '프리미엄농장',
  '프리미엄그린',
  '프리미엄자연',
  '프리미엄친환경',
  '프리미엄토종',
  '프리미엄신선',
  '프리미엄맛있는',
  '프리미엄건강',
  '프리미엄오가닉',
  '프리미엄바이오',
  '프리미엄에코',
  '프리미엄프리미엄',
  '매우긴농장이름을가진친환경농장',
  '슈퍼긴농장이름을가진자연농장',
  '엄청긴농장이름을가진토종농장',
  '정말긴농장이름을가진신선농장',
  '완전긴농장이름을가진맛있는농장',
  '진짜긴농장이름을가진건강농장',
  '정말매우긴농장이름을가진오가닉팜',
  '슈퍼엄청긴농장이름을가진바이오팜',
  '완전진짜긴농장이름을가진에코팜',
  '정말완전긴농장이름을가진프리미엄팜',
]

// 아이디 생성 함수
const generateUserId = (name: string, index: number) => {
  const variations = [
    name.toLowerCase() + index,
    name.toLowerCase() + index * 2,
    name.toLowerCase() + '123',
    name.toLowerCase() + '~',
    name.toLowerCase() + 'user',
    name.toLowerCase() + 'member',
    name.toLowerCase() + 'seller',
    name.toLowerCase() + 'farm',
    name.toLowerCase() + 'verylongusername',
    name.toLowerCase() + 'superlonguserid',
    name.toLowerCase() + 'extremelylongusername',
    name.toLowerCase() + 'verylonguserid123',
    name.toLowerCase() + 'superlongusername456',
    name.toLowerCase() + 'extremelylonguserid789',
  ]
  return variations[index % variations.length]
}

// 날짜 생성 함수
const generateJoinDate = () => {
  const year = 25
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 더미 데이터 생성
export const generateDummyUsers = (count: number = 80): User[] => {
  return Array.from({ length: count }, (_, index) => {
    const name = koreanNames[index % koreanNames.length]
    const isSeller = Math.random() < 0.3 // 30% 확률로 판매자
    const isWithdrawn = Math.random() < 0.1 // 10% 확률로 탈퇴
    const purchaseCount = Math.floor(Math.random() * 1000)

    return {
      id: index + 1,
      name,
      userId: generateUserId(name, index),
      isSeller,
      nickname: isSeller ? farmNames[index % farmNames.length] : '',
      purchaseCount,
      joinDate: generateJoinDate(),
      isWithdrawn,
    }
  })
}

// 기본 더미 데이터
export const dummyUsers = generateDummyUsers(80)

// 판매자 신청 인터페이스
export interface SellerApplication {
  id: number
  farmName: string
  userId: string
  nickname: string
  requestDate: string
  registrationDate?: string
  isBusiness: boolean
}

// 판매자 신청 더미 데이터 생성
export const dummySellerApplications = Array.from(
  { length: 125 },
  (_, index) => {
    const farmName = farmNames[index % farmNames.length]
    const name = koreanNames[index % koreanNames.length]
    const isBusiness = Math.random() < 0.7 // 70% 확률로 사업자
    const hasRegistration = Math.random() < 0.8 // 80% 확률로 등록 완료

    // 요청일 생성 (최근 1년 내)
    const requestDate = new Date()
    requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 365))
    const requestDateStr = `${requestDate.getFullYear()}.${String(requestDate.getMonth() + 1).padStart(2, '0')}.${String(requestDate.getDate()).padStart(2, '0')}`

    // 등록일 생성 (요청일 이후)
    let registrationDateStr: string | undefined
    if (hasRegistration) {
      const registrationDate = new Date(requestDate)
      registrationDate.setDate(
        registrationDate.getDate() + Math.floor(Math.random() * 30) + 1
      )
      registrationDateStr = `${registrationDate.getFullYear()}.${String(registrationDate.getMonth() + 1).padStart(2, '0')}.${String(registrationDate.getDate()).padStart(2, '0')}`
    }

    return {
      id: index + 1,
      farmName,
      userId: generateUserId(name, index),
      nickname: name,
      requestDate: requestDateStr,
      registrationDate: registrationDateStr,
      isBusiness,
    }
  }
)

// 더미 상품 데이터
const productNames = [
  '신선한 토마토',
  '달콤한 딸기',
  '아삭한 사과',
  '향긋한 바나나',
  '맛있는 오렌지',
  '달콤한 포도',
  '신선한 양파',
  '아삭한 배',
  '향긋한 레몬',
  '달콤한 복숭아',
  '신선한 당근',
  '아삭한 배추',
  '향긋한 마늘',
  '달콤한 수박',
  '신선한 오이',
  '아삭한 무',
  '향긋한 고추',
  '달콤한 참외',
  '신선한 상추',
  '아삭한 양배추',
]

const categories = ['과일', '채소', '견과류', '곡물', '기타']
const badges = ['신상품', '인기상품', '할인상품', '추천상품', '베스트']
const sellers = ['김농부', '이농장', '박농가', '최농원', '정농업']

export const dummyProducts: Product[] = Array.from(
  { length: 50 },
  (_, index) => {
    const name = productNames[index % productNames.length]
    const category = categories[index % categories.length]
    const price = Math.floor(Math.random() * 50000) + 5000
    const stock = Math.floor(Math.random() * 100) + 1
    const isRecommended = Math.random() > 0.7
    const badge = badges[index % badges.length]
    const seller = sellers[index % sellers.length]

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365))
    const createdAtStr = `${createdAt.getFullYear()}.${String(createdAt.getMonth() + 1).padStart(2, '0')}.${String(createdAt.getDate()).padStart(2, '0')}`

    return {
      id: index + 1,
      name,
      category,
      price,
      stock,
      isRecommended,
      badge,
      seller,
      createdAt: createdAtStr,
      status: Math.random() > 0.1 ? 'active' : 'inactive',
    }
  }
)

// 특가 상품 인터페이스
export interface SpecialOffer {
  id: number
  name: string
  category: string
  originalPrice: number
  discountedPrice: number
  salesPeriodStart: string
  salesPeriodEnd: string
  views: number
  orders: number
  status: boolean
}

// 특가 상품 더미 데이터 (이미지에 있는 데이터 기반)
export const dummySpecialOffers: SpecialOffer[] = [
  {
    id: 1,
    name: '프리미엄 사과 세트',
    category: '과일 > 사과',
    originalPrice: 25000,
    discountedPrice: 19900,
    salesPeriodStart: '2025-01-01',
    salesPeriodEnd: '2025-01-31',
    views: 1240,
    orders: 89,
    status: true,
  },
  {
    id: 2,
    name: '겨울 딸기 특가',
    category: '과일 > 딸기',
    originalPrice: 15000,
    discountedPrice: 12000,
    salesPeriodStart: '2025-01-15',
    salesPeriodEnd: '2025-02-15',
    views: 890,
    orders: 45,
    status: true,
  },
  {
    id: 3,
    name: '오렌지 박스',
    category: '과일 > 오렌지',
    originalPrice: 30000,
    discountedPrice: 24000,
    salesPeriodStart: '2024-12-01',
    salesPeriodEnd: '2024-12-31',
    views: 567,
    orders: 23,
    status: false,
  },
  {
    id: 4,
    name: '바나나 한 박스',
    category: '과일 > 바나나',
    originalPrice: 18000,
    discountedPrice: 14400,
    salesPeriodStart: '2025-01-20',
    salesPeriodEnd: '2025-02-20',
    views: 432,
    orders: 67,
    status: true,
  },
  {
    id: 5,
    name: '포도 선물세트',
    category: '과일 > 포도',
    originalPrice: 45000,
    discountedPrice: 36000,
    salesPeriodStart: '2025-01-10',
    salesPeriodEnd: '2025-02-10',
    views: 789,
    orders: 34,
    status: true,
  },
]

// 특가 상품 구매 인터페이스
export interface SpecialOfferPurchase {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  productName: string
  quantity: number
  totalPrice: number
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled'
  orderStatus:
    | 'deposit_pending'
    | 'preparing'
    | 'shipping'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
  orderDateTime: string
}

// 특가 상품 구매 더미 데이터 (이미지 기준)
export const dummySpecialOfferPurchases: SpecialOfferPurchase[] = [
  {
    id: 1,
    orderNumber: 'ORD-2025-001',
    customerName: '김고객',
    customerPhone: '010-1234-5678',
    productName: '프리미엄 사과 세트',
    quantity: 2,
    totalPrice: 39800,
    paymentStatus: 'completed',
    orderStatus: 'preparing',
    orderDateTime: '2025-01-28, 14:30',
  },
  {
    id: 2,
    orderNumber: 'ORD-2025-002',
    customerName: '이구매',
    customerPhone: '010-9876-5432',
    productName: '겨울 딸기 특가',
    quantity: 1,
    totalPrice: 12000,
    paymentStatus: 'pending',
    orderStatus: 'deposit_pending',
    orderDateTime: '2025-01-28, 16:20',
  },
  {
    id: 3,
    orderNumber: 'ORD-2025-003',
    customerName: '박주문',
    customerPhone: '010-5555-7777',
    productName: '오렌지 박스',
    quantity: 3,
    totalPrice: 72000,
    paymentStatus: 'completed',
    orderStatus: 'shipping',
    orderDateTime: '2025-01-27, 10:15',
  },
  {
    id: 4,
    orderNumber: 'ORD-2025-004',
    customerName: '최완료',
    customerPhone: '010-1111-2222',
    productName: '바나나 한 박스',
    quantity: 1,
    totalPrice: 14400,
    paymentStatus: 'completed',
    orderStatus: 'delivered',
    orderDateTime: '2025-01-25, 13:45',
  },
]

// 매출 관리 거래 내역 인터페이스
export interface SalesTransaction {
  id: number
  dateTime: string
  buyerName: string
  sellerName: string
  productName: string
  transactionAmount: number
  couponDiscount: number | null
  pointUsage: number | null
  fee: number
  status: 'completed' | 'cancelled'
}

// 매출 관리 거래 내역 더미 데이터
export const dummySalesTransactions: SalesTransaction[] = [
  {
    id: 1,
    dateTime: '2025-01-20 14:30',
    buyerName: '김고객',
    sellerName: '김과일농장',
    productName: '프리미엄 사과',
    transactionAmount: 45000,
    couponDiscount: 5000,
    pointUsage: 2000,
    fee: 3150,
    status: 'completed',
  },
  {
    id: 2,
    dateTime: '2025-01-19 16:20',
    buyerName: '이구매',
    sellerName: '이딸기농원',
    productName: '겨울 딸기',
    transactionAmount: 30000,
    couponDiscount: null,
    pointUsage: 5000,
    fee: 2100,
    status: 'completed',
  },
  {
    id: 3,
    dateTime: '2025-01-18 10:15',
    buyerName: '박주문',
    sellerName: '박오렌지팜',
    productName: '오렌지 박스',
    transactionAmount: 72000,
    couponDiscount: 10000,
    pointUsage: null,
    fee: 5040,
    status: 'completed',
  },
  {
    id: 4,
    dateTime: '2025-01-17 13:45',
    buyerName: '최완료',
    sellerName: '최바나나농장',
    productName: '바나나 한 박스',
    transactionAmount: 25000,
    couponDiscount: null,
    pointUsage: null,
    fee: 1750,
    status: 'cancelled',
  },
  {
    id: 5,
    dateTime: '2025-01-16 09:30',
    buyerName: '정고객',
    sellerName: '정포도농원',
    productName: '포도 선물세트',
    transactionAmount: 50000,
    couponDiscount: 5000,
    pointUsage: 3000,
    fee: 3500,
    status: 'completed',
  },
]

// 판매자별 정산 인터페이스
export interface SellerSettlement {
  id: number
  sellerName: string
  totalSales: number
  cancelAmount: number
  cancelCount: number
  fee: number
  vat: number
  carryOverAmount: number
  actualSettlementAmount: number
  transactionCount: number
  settlementStatus: 'completed' | 'pending'
  settlementDate: string
}

// 판매자별 정산 더미 데이터
export const dummySellerSettlements: SellerSettlement[] = [
  {
    id: 1,
    sellerName: '김과일농장',
    totalSales: 1200000,
    cancelAmount: 50000,
    cancelCount: 2,
    fee: 84000,
    vat: 8400,
    carryOverAmount: 0,
    actualSettlementAmount: 1107600,
    transactionCount: 22,
    settlementStatus: 'completed',
    settlementDate: '2025-01-16',
  },
  {
    id: 2,
    sellerName: '자연농원',
    totalSales: 890000,
    cancelAmount: 20000,
    cancelCount: 1,
    fee: 62300,
    vat: 6230,
    carryOverAmount: 0,
    actualSettlementAmount: 821470,
    transactionCount: 16,
    settlementStatus: 'completed',
    settlementDate: '2025-01-16',
  },
  {
    id: 3,
    sellerName: '제주감귤마을',
    totalSales: 1600000,
    cancelAmount: 80000,
    cancelCount: 3,
    fee: 112000,
    vat: 11200,
    carryOverAmount: 0,
    actualSettlementAmount: 1476800,
    transactionCount: 34,
    settlementStatus: 'completed',
    settlementDate: '2025-01-16',
  },
  {
    id: 4,
    sellerName: '베리팜',
    totalSales: 780000,
    cancelAmount: 0,
    cancelCount: 0,
    fee: 54600,
    vat: 5460,
    carryOverAmount: 0,
    actualSettlementAmount: 719940,
    transactionCount: 14,
    settlementStatus: 'completed',
    settlementDate: '2025-01-16',
  },
  {
    id: 5,
    sellerName: '토종농장',
    totalSales: 1050000,
    cancelAmount: 40000,
    cancelCount: 1,
    fee: 73500,
    vat: 7350,
    carryOverAmount: 0,
    actualSettlementAmount: 969150,
    transactionCount: 18,
    settlementStatus: 'completed',
    settlementDate: '2025-01-16',
  },
]

// 쿠폰 인터페이스
export interface Coupon {
  id: number
  name: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number
  validFrom: string
  validTo: string
  usageCount: number
  status: boolean
}

// 쿠폰 더미 데이터
export const dummyCoupons: Coupon[] = [
  {
    id: 1,
    name: '신규 회원 할인',
    description: '신규 회원 가입 시 제공되는 10% 할인 쿠폰',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 30000,
    maxDiscountAmount: 5000,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    usageCount: 245,
    status: true,
  },
  {
    id: 2,
    name: '여름 특가 이벤트',
    description: '여름 시즌 특가 이벤트 쿠폰',
    discountType: 'fixed',
    discountValue: 5000,
    minOrderAmount: 50000,
    maxDiscountAmount: 5000,
    validFrom: '2025-06-01',
    validTo: '2025-08-31',
    usageCount: 89,
    status: true,
  },
  {
    id: 3,
    name: 'VIP 회원 전용',
    description: 'VIP 회원 전용 15% 할인 쿠폰',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 100000,
    maxDiscountAmount: 20000,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    usageCount: 156,
    status: false,
  },
  {
    id: 4,
    name: '추석 연휴 특별 할인',
    description: '추석 연휴 기간 한정 특별 할인',
    discountType: 'fixed',
    discountValue: 10000,
    minOrderAmount: 80000,
    maxDiscountAmount: 10000,
    validFrom: '2025-09-15',
    validTo: '2025-09-20',
    usageCount: 67,
    status: true,
  },
]

// 포인트 적립 설정 인터페이스
export interface PointSettings {
  isEnabled: boolean
  rate: number
  effectiveDate: string
  lastModified: string
}

// 포인트 내역 인터페이스
export interface PointHistory {
  id: number
  dateTime: string
  customerName: string
  type: 'earned' | 'used' | 'cancelled'
  orderAmount: number
  points: number
  description: string
  status: 'completed' | 'pending'
}

// 포인트 적립 설정 기본값
export const defaultPointSettings: PointSettings = {
  isEnabled: true,
  rate: 1,
  effectiveDate: '2025-02-01',
  lastModified: '2025-01-15',
}

// 포인트 내역 더미 데이터
export const dummyPointHistory: PointHistory[] = [
  {
    id: 1,
    dateTime: '2025-01-30 14:30',
    customerName: '김고객',
    type: 'earned',
    orderAmount: 45000,
    points: 450,
    description: '상품 구매 적립 (1%)',
    status: 'completed',
  },
  {
    id: 2,
    dateTime: '2025-01-30 13:15',
    customerName: '이구매',
    type: 'used',
    orderAmount: 24000,
    points: 2000,
    description: '상품 구매 시 포인트 사용',
    status: 'completed',
  },
  {
    id: 3,
    dateTime: '2025-01-29 16:45',
    customerName: '박소비',
    type: 'earned',
    orderAmount: 36000,
    points: 360,
    description: '상품 구매 적립 (1%)',
    status: 'completed',
  },
  {
    id: 4,
    dateTime: '2025-01-29 11:20',
    customerName: '최유저',
    type: 'cancelled',
    orderAmount: 60000,
    points: 600,
    description: '주문 취소로 인한 포인트 회수',
    status: 'completed',
  },
  {
    id: 5,
    dateTime: '2025-01-28 09:30',
    customerName: '정구입',
    type: 'earned',
    orderAmount: 54000,
    points: 540,
    description: '상품 구매 적립 (1%)',
    status: 'completed',
  },
]

// 광고 인터페이스
export interface Ad {
  id: number
  title: string
  advertiser: string
  adType?: 'MAIN' | 'MIDDLE' | 'MYPAGE'
  isActive: boolean
  status: 'in_progress' | 'pending' | 'review' | 'completed' | 'canceled'
  imageUrl?: string
  periodStart: string
  periodEnd: string
  connectedUrl: string
  views: number
  clicks: number
  ctr: number
}

// 광고 더미 데이터
export const dummyAds: Ad[] = [
  {
    id: 1,
    title: '메인 페이지 광고',
    advertiser: 'ABC 마케팅',
    isActive: true,
    status: 'in_progress',
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    connectedUrl: 'example.com/main-page',
    views: 125430,
    clicks: 3240,
    ctr: 2.58,
  },
  {
    id: 2,
    title: '중간 광고',
    advertiser: 'XYZ 컴퍼니',
    isActive: true,
    status: 'in_progress',
    periodStart: '2025-01-15',
    periodEnd: '2025-02-14',
    connectedUrl: 'example.com/middle',
    views: 89650,
    clicks: 2180,
    ctr: 2.43,
  },
  {
    id: 3,
    title: '마이페이지 광고',
    advertiser: 'DEF 브랜드',
    isActive: false,
    status: 'in_progress',
    periodStart: '2025-02-01',
    periodEnd: '2025-02-28',
    connectedUrl: 'example.com/mypage',
    views: 45230,
    clicks: 890,
    ctr: 1.97,
  },
]

// 광고 히스토리 인터페이스
export interface AdHistory {
  id: number
  type: 'main' | 'middle' | 'mypage'
  name: string
  advertiser: string
  periodStart: string
  periodEnd: string
  views: number
  clicks: number
  ctr: number
  status: 'completed' | 'cancelled'
}

// 광고 히스토리 더미 데이터
export const dummyAdHistory: AdHistory[] = [
  {
    id: 1,
    type: 'main',
    name: '신년 특가 이벤트',
    advertiser: 'GHI 마케팅',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    views: 89430,
    clicks: 2340,
    ctr: 2.62,
    status: 'completed',
  },
  {
    id: 2,
    type: 'middle',
    name: '겨울 과일 특집',
    advertiser: 'JKL 브랜드',
    periodStart: '2024-11-15',
    periodEnd: '2024-12-15',
    views: 67890,
    clicks: 1890,
    ctr: 2.78,
    status: 'completed',
  },
  {
    id: 3,
    type: 'mypage',
    name: '건강 과일 캠페인',
    advertiser: 'MNO 헬스',
    periodStart: '2024-10-01',
    periodEnd: '2024-10-31',
    views: 34560,
    clicks: 780,
    ctr: 2.26,
    status: 'completed',
  },
]

// 광고 문의 인터페이스
export interface AdInquiry {
  id: number
  companyName: string
  contactName: string
  phoneNumber: string
  adType: 'main' | 'middle' | 'mypage'
  budget: number
  periodStart: string
  periodEnd: string
  status: 'pending' | 'reviewing' | 'completed' | 'cancelled'
  inquiryDate: string
  replyDate?: string
}

// 광고 문의 더미 데이터
export const dummyAdInquiries: AdInquiry[] = [
  {
    id: 1,
    companyName: 'ABC 마케팅',
    contactName: '김광고',
    phoneNumber: '02-1234-5678',
    adType: 'main',
    budget: 5000000,
    periodStart: '2025-02-01',
    periodEnd: '2025-02-28',
    status: 'reviewing',
    inquiryDate: '2025-01-25',
  },
  {
    id: 2,
    companyName: 'XYZ 컴퍼니',
    contactName: '이마케팅',
    phoneNumber: '031-9876-5432',
    adType: 'middle',
    budget: 3000000,
    periodStart: '2025-03-01',
    periodEnd: '2025-03-31',
    status: 'pending',
    inquiryDate: '2025-01-26',
  },
  {
    id: 3,
    companyName: 'DEF 브랜드',
    contactName: '박홍보',
    phoneNumber: '051-5555-1234',
    adType: 'mypage',
    budget: 2000000,
    periodStart: '2025-02-15',
    periodEnd: '2025-03-15',
    status: 'completed',
    inquiryDate: '2025-01-20',
    replyDate: '2025-01-22',
  },
  {
    id: 4,
    companyName: 'GHI 솔루션',
    contactName: '최영업',
    phoneNumber: '02-7777-8888',
    adType: 'main',
    budget: 8000000,
    periodStart: '2025-04-01',
    periodEnd: '2025-04-30',
    status: 'cancelled',
    inquiryDate: '2025-01-24',
  },
]

// 팝업 인터페이스
export interface Popup {
  id: number
  title: string
  description: string
  isActive: boolean
  imageUrl?: string
  startDate: string
  endDate: string
}

// 팝업 더미 데이터
export const dummyPopups: Popup[] = [
  {
    id: 1,
    title: '신년 특가 이벤트',
    description: '2025년 신년을 맞아 모든 과일 20% 할인!',
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
  {
    id: 2,
    title: '회원가입 혜택 안내',
    description: '지금 가입하면 5,000원 적립금 증정!',
    isActive: true,
    startDate: '2025-01-15',
    endDate: '2025-02-28',
  },
  {
    id: 3,
    title: '배송비 무료 이벤트',
    description: '3만원 이상 구매시 배송비 무료!',
    isActive: false,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
  },
]
