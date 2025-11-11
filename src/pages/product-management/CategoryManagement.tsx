import { useState } from 'react'
import CategoryModal from '@/components/CategoryModal'

interface Category {
  id: number
  name: string
  icon: string
  subMenuCount: number
  status: 'active' | 'inactive'
  subMenus: SubMenu[]
}

interface SubMenu {
  id: number
  name: string
  status: 'active' | 'inactive'
}

const CategoryManagement = () => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'main' | 'sub'>('main')

  // 더미 데이터
  const categories: Category[] = [
    {
      id: 1,
      name: '신선과일',
      icon: '🍎',
      subMenuCount: 3,
      status: 'active',
      subMenus: [
        { id: 1, name: '사과', status: 'active' },
        { id: 2, name: '배', status: 'active' },
        { id: 3, name: '감귤', status: 'active' },
      ],
    },
    {
      id: 2,
      name: '열대과일',
      icon: '🥭',
      subMenuCount: 2,
      status: 'active',
      subMenus: [
        { id: 4, name: '망고', status: 'active' },
        { id: 5, name: '파인애플', status: 'active' },
      ],
    },
    {
      id: 3,
      name: '베리류',
      icon: '🍓',
      subMenuCount: 4,
      status: 'active',
      subMenus: [
        { id: 6, name: '딸기', status: 'active' },
        { id: 7, name: '블루베리', status: 'active' },
        { id: 8, name: '라즈베리', status: 'active' },
        { id: 9, name: '크랜베리', status: 'active' },
      ],
    },
  ]

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const isExpanded = (categoryId: number) =>
    expandedCategories.includes(categoryId)

  const handleOpenModal = (type: 'main' | 'sub') => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleAddCategory = (
    categoryName: string,
    parentCategoryId?: number
  ) => {
    if (modalType === 'main') {
      console.log(`Adding main category: "${categoryName}"`)
    } else {
      console.log(
        `Adding sub category: "${categoryName}" to parent ID: ${parentCategoryId}`
      )
    }
    // 여기서 실제 카테고리 추가 로직을 구현할 수 있습니다
  }

  return (
    <div className="space-y-6 bg-white rounded-[14px] p-5">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">카테고리 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            대메뉴와 소메뉴를 관리할 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenModal('sub')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            + 소메뉴 추가
          </button>
          <button
            onClick={() => handleOpenModal('main')}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + 대메뉴 추가
          </button>
        </div>
      </div>

      {/* 카테고리 리스트 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {categories.map(category => (
          <div
            key={category.id}
            className="border-b border-gray-200 last:border-b-0"
          >
            {/* 메인 카테고리 */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* 화살표 아이콘 */}
                  <div className="w-4 h-4 flex items-center justify-center">
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform ${
                        isExpanded(category.id) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* 아이콘 플레이스홀더 */}
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm">
                    {category.icon}
                  </div>

                  {/* 카테고리 정보 */}
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        소메뉴 {category.subMenuCount}개
                      </div>
                    </div>

                    {/* 상태 태그 */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.status === 'active'
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {category.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* 액션 버튼들 */}
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
                      비활성화
                    </button>
                    <button className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
                      수정
                    </button>
                    <button className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 소메뉴 (펼쳐질 때만 표시) */}
            {isExpanded(category.id) && (
              <div className="bg-gray-100 border-t border-gray-200">
                {category.subMenus.map(subMenu => (
                  <div
                    key={subMenu.id}
                    className="px-12 py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* 불릿 포인트 */}
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>

                        {/* 소메뉴 이름과 상태 태그 */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-900">
                            {subMenu.name}
                          </span>

                          {/* 상태 태그 */}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              subMenu.status === 'active'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {subMenu.status === 'active' ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* 액션 버튼들 */}
                        <div className="flex space-x-2">
                          <button className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
                            비활성화
                          </button>
                          <button className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
                            수정
                          </button>
                          <button className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddCategory={handleAddCategory}
        title={modalType === 'main' ? '대메뉴 추가' : '소메뉴 추가'}
        isSubMenu={modalType === 'sub'}
        parentCategories={categories.map(cat => ({
          id: cat.id,
          name: cat.name,
        }))}
      />
    </div>
  )
}

export default CategoryManagement
