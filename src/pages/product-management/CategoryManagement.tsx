import { useState } from 'react'
import CategoryModal from '@/components/CategoryModal'
import CategoryEditModal from '@/components/CategoryEditModal'
import CategoryDeleteModal from '@/components/CategoryDeleteModal'
import {
  useCategories,
  useCreateCategory,
  useCreateSubCategory,
  useToggleCategoryActive,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategory'

const CategoryManagement = () => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'main' | 'sub'>('main')
  const [editingCategory, setEditingCategory] = useState<{
    id: number
    name: string
    isActive: boolean
  } | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<{
    id: number
    name: string
    isMainCategory: boolean
  } | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const { data, isLoading, error } = useCategories()
  const createCategoryMutation = useCreateCategory()
  const createSubCategoryMutation = useCreateSubCategory()
  const toggleCategoryMutation = useToggleCategoryActive()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  // 에러 메시지 추출 헬퍼 함수
  const extractCategoryError = (error: any): string | null => {
    if (error?.response?.data?.data?.category_name) {
      const errorArray = error.response.data.data.category_name
      if (Array.isArray(errorArray) && errorArray.length > 0) {
        return errorArray[0]
      }
    }
    return null
  }

  // API 데이터를 컴포넌트에서 사용할 형식으로 변환
  const categories = data?.data || []

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
    setCategoryError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCategoryError(null)
  }

  const handleToggleCategory = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation() // 카테고리 펼치기/접기 방지
    toggleCategoryMutation.mutate(categoryId, {
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          '카테고리 상태 변경에 실패했습니다.'
        alert(message)
      },
    })
  }

  const handleOpenEditModal = (
    categoryId: number,
    categoryName: string,
    isActive: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation() // 카테고리 펼치기/접기 방지
    setEditingCategory({ id: categoryId, name: categoryName, isActive })
    setEditError(null)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingCategory(null)
    setEditError(null)
  }

  const handleUpdateCategory = (categoryName: string) => {
    if (!editingCategory) return

    setEditError(null)

    updateCategoryMutation.mutate(
      {
        id: editingCategory.id,
        data: {
          category_name: categoryName,
          is_active: editingCategory.isActive,
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
          setEditingCategory(null)
          setEditError(null)
        },
        onError: (error: any) => {
          const categoryErrorMsg = extractCategoryError(error)
          if (categoryErrorMsg) {
            setEditError(categoryErrorMsg)
          } else {
            const message =
              error.response?.data?.message ||
              error.message ||
              '카테고리 수정에 실패했습니다.'
            alert(message)
          }
        },
      }
    )
  }

  const handleOpenDeleteModal = (
    categoryId: number,
    categoryName: string,
    isMainCategory: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation() // 카테고리 펼치기/접기 방지
    setDeletingCategory({ id: categoryId, name: categoryName, isMainCategory })
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingCategory(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingCategory) return

    deleteCategoryMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        setDeletingCategory(null)
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          '카테고리 삭제에 실패했습니다.'
        alert(message)
      },
    })
  }

  const handleAddCategory = (
    categoryName: string,
    parentCategoryId?: number
  ) => {
    setCategoryError(null)

    if (modalType === 'main') {
      // 대메뉴 추가
      createCategoryMutation.mutate(
        {
          category_name: categoryName,
          is_active: true,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false)
            setCategoryError(null)
          },
          onError: (error: any) => {
            const categoryErrorMsg = extractCategoryError(error)
            if (categoryErrorMsg) {
              setCategoryError(categoryErrorMsg)
            } else {
              const message =
                error.response?.data?.message ||
                error.message ||
                '대메뉴 추가에 실패했습니다.'
              alert(message)
            }
          },
        }
      )
    } else {
      // 소메뉴 추가
      if (!parentCategoryId) {
        alert('대메뉴를 선택해주세요.')
        return
      }

      // 선택한 대메뉴 정보 찾기
      const parentCategory = categories.find(cat => cat.id === parentCategoryId)
      if (!parentCategory) {
        alert('대메뉴를 찾을 수 없습니다.')
        return
      }

      createSubCategoryMutation.mutate(
        {
          category_name: categoryName,
          parent_category_id: parentCategoryId,
          parent_category_name: parentCategory.category_name,
          is_active: true,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false)
            setCategoryError(null)
          },
          onError: (error: any) => {
            const categoryErrorMsg = extractCategoryError(error)
            if (categoryErrorMsg) {
              setCategoryError(categoryErrorMsg)
            } else {
              const message =
                error.response?.data?.message ||
                error.message ||
                '소메뉴 추가에 실패했습니다.'
              alert(message)
            }
          },
        }
      )
    }
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

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">카테고리를 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-600">
            카테고리를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      )}

      {/* 카테고리 리스트 */}
      {!isLoading && !error && (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              카테고리가 없습니다.
            </div>
          ) : (
            categories.map(category => (
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

                  {/* 카테고리 정보 */}
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {category.category_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        소메뉴 {category.subcategory_count}개
                      </div>
                    </div>

                    {/* 상태 태그 */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.is_active
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {category.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* 액션 버튼들 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={e => handleToggleCategory(category.id, e)}
                      disabled={toggleCategoryMutation.isPending}
                      className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {category.is_active ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={e =>
                        handleOpenEditModal(
                          category.id,
                          category.category_name,
                          category.is_active,
                          e
                        )
                      }
                      className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white"
                    >
                      수정
                    </button>
                    <button
                      onClick={e =>
                        handleOpenDeleteModal(
                          category.id,
                          category.category_name,
                          true,
                          e
                        )
                      }
                      className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 소메뉴 (펼쳐질 때만 표시) */}
            {isExpanded(category.id) && (
              <div className="bg-gray-100 border-t border-gray-200">
                {category.subcategories.map(subCategory => (
                  <div
                    key={subCategory.id}
                    className="px-12 py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* 불릿 포인트 */}
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>

                        {/* 소메뉴 이름과 상태 태그 */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-900">
                            {subCategory.category_name}
                          </span>

                          {/* 상태 태그 */}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              subCategory.is_active
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {subCategory.is_active ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* 액션 버튼들 */}
                        <div className="flex space-x-2">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleToggleCategory(subCategory.id, e)
                            }}
                            disabled={toggleCategoryMutation.isPending}
                            className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {subCategory.is_active ? '비활성화' : '활성화'}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleOpenEditModal(
                                subCategory.id,
                                subCategory.category_name,
                                subCategory.is_active,
                                e
                              )
                            }}
                            className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white"
                          >
                            수정
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleOpenDeleteModal(
                                subCategory.id,
                                subCategory.category_name,
                                false,
                                e
                              )
                            }}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                          >
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
            ))
          )}
      </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddCategory={handleAddCategory}
        title={modalType === 'main' ? '대메뉴 추가' : '소메뉴 추가'}
        isSubMenu={modalType === 'sub'}
        parentCategories={categories.map(cat => ({
          id: cat.id,
          name: cat.category_name,
        }))}
        isLoading={
          createCategoryMutation.isPending || createSubCategoryMutation.isPending
        }
        error={categoryError}
      />

      {/* Category Edit Modal */}
      {editingCategory && (
        <CategoryEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateCategory={handleUpdateCategory}
          title="카테고리 수정"
          currentName={editingCategory.name}
          isLoading={updateCategoryMutation.isPending}
          error={editError}
        />
      )}

      {/* Category Delete Modal */}
      {deletingCategory && (
        <CategoryDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isMainCategory={deletingCategory.isMainCategory}
          isLoading={deleteCategoryMutation.isPending}
        />
      )}
    </div>
  )
}

export default CategoryManagement
