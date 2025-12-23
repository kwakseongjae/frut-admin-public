import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  useReorderCategories,
} from '@/hooks/useCategory'
import type { Category, SubCategory } from '@/lib/api/category'

// 드래그 가능한 대메뉴 아이템 컴포넌트
const SortableMainCategoryItem = ({
  category,
  isExpanded,
  onToggle,
  onToggleCategory,
  onOpenEditModal,
  onOpenDeleteModal,
  toggleCategoryMutation,
}: {
  category: Category
  isExpanded: boolean
  onToggle: () => void
  onToggleCategory: (categoryId: number, e: React.MouseEvent) => void
  onOpenEditModal: (
    categoryId: number,
    categoryName: string,
    isActive: boolean,
    e: React.MouseEvent
  ) => void
  onOpenDeleteModal: (
    categoryId: number,
    categoryName: string,
    isMainCategory: boolean,
    e: React.MouseEvent
  ) => void
  toggleCategoryMutation: { isPending: boolean }
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `main-${category.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-200 last:border-b-0"
    >
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* 드래그 핸들 */}
            <div
              {...attributes}
              {...listeners}
              className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing"
              onClick={e => e.stopPropagation()}
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="6" cy="6" r="1.5" />
                <circle cx="18" cy="6" r="1.5" />
                <circle cx="6" cy="18" r="1.5" />
                <circle cx="18" cy="18" r="1.5" />
              </svg>
            </div>

            {/* 화살표 아이콘 */}
            <div className="w-4 h-4 flex items-center justify-center">
              <svg
                className={`w-3 h-3 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
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
                onClick={e => onToggleCategory(category.id, e)}
                disabled={toggleCategoryMutation.isPending}
                className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {category.is_active ? '비활성화' : '활성화'}
              </button>
              <button
                onClick={e =>
                  onOpenEditModal(
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
                  onOpenDeleteModal(
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
    </div>
  )
}

// 드래그 가능한 소메뉴 아이템 컴포넌트
const SortableSubCategoryItem = ({
  subCategory,
  parentCategoryId,
  onToggleCategory,
  onOpenEditModal,
  onOpenDeleteModal,
  toggleCategoryMutation,
}: {
  subCategory: SubCategory
  parentCategoryId: number
  onToggleCategory: (categoryId: number, e: React.MouseEvent) => void
  onOpenEditModal: (
    categoryId: number,
    categoryName: string,
    isActive: boolean,
    e: React.MouseEvent
  ) => void
  onOpenDeleteModal: (
    categoryId: number,
    categoryName: string,
    isMainCategory: boolean,
    e: React.MouseEvent
  ) => void
  toggleCategoryMutation: { isPending: boolean }
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `sub-${parentCategoryId}-${subCategory.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="px-12 py-3 border-b border-gray-200 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="6" cy="6" r="1.5" />
              <circle cx="18" cy="6" r="1.5" />
              <circle cx="6" cy="18" r="1.5" />
              <circle cx="18" cy="18" r="1.5" />
            </svg>
          </div>

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
                onToggleCategory(subCategory.id, e)
              }}
              disabled={toggleCategoryMutation.isPending}
              className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subCategory.is_active ? '비활성화' : '활성화'}
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                onOpenEditModal(
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
                onOpenDeleteModal(
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
  )
}

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
  const [localCategories, setLocalCategories] = useState<Category[]>([])

  const { data, isLoading, error } = useCategories()
  const createCategoryMutation = useCreateCategory()
  const createSubCategoryMutation = useCreateSubCategory()
  const toggleCategoryMutation = useToggleCategoryActive()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  const reorderCategoriesMutation = useReorderCategories()

  // API 데이터가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    if (data?.data) {
      setLocalCategories(data.data)
    }
  }, [data?.data])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const categories = localCategories

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

  // 드래그 종료 핸들러
  const handleDragEnd = (event: {
    active: { id: string | number }
    over: { id: string | number } | null
  }) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // 같은 아이템이면 무시
    if (activeId === overId) return

    // 대메뉴 재정렬
    if (activeId.startsWith('main-') && overId.startsWith('main-')) {
      const activeIndex = categories.findIndex(
        cat => `main-${cat.id}` === activeId
      )
      const overIndex = categories.findIndex(
        cat => `main-${cat.id}` === overId
      )

      if (activeIndex !== -1 && overIndex !== -1) {
        const newCategories = arrayMove(categories, activeIndex, overIndex)
        setLocalCategories(newCategories)

        // API 호출
        const categoryIds = newCategories.map(cat => cat.id)
        reorderCategoriesMutation.mutate(
          {
            category_ids: categoryIds,
            parent_category_id: null,
          },
          {
            onError: (error: any) => {
              // 실패 시 원래 상태로 복구
              setLocalCategories(categories)
              const message =
                error.response?.data?.message ||
                error.message ||
                '카테고리 순서 변경에 실패했습니다.'
              alert(message)
            },
          }
        )
      }
    }
    // 소메뉴 재정렬
    else if (
      activeId.startsWith('sub-') &&
      overId.startsWith('sub-') &&
      activeId.split('-')[1] === overId.split('-')[1]
    ) {
      const parentCategoryId = parseInt(activeId.split('-')[1])
      const parentCategory = categories.find(cat => cat.id === parentCategoryId)

      if (!parentCategory) return

      const subCategories = parentCategory.subcategories
      const activeSubIndex = subCategories.findIndex(
        sub => `sub-${parentCategoryId}-${sub.id}` === activeId
      )
      const overSubIndex = subCategories.findIndex(
        sub => `sub-${parentCategoryId}-${sub.id}` === overId
      )

      if (activeSubIndex !== -1 && overSubIndex !== -1) {
        const newSubCategories = arrayMove(
          subCategories,
          activeSubIndex,
          overSubIndex
        )

        // 로컬 상태 업데이트
        const updatedCategories = categories.map(cat =>
          cat.id === parentCategoryId
            ? { ...cat, subcategories: newSubCategories }
            : cat
        )
        setLocalCategories(updatedCategories)

        // API 호출
        const categoryIds = newSubCategories.map(sub => sub.id)
        reorderCategoriesMutation.mutate(
          {
            category_ids: categoryIds,
            parent_category_id: parentCategoryId,
          },
          {
            onError: (error: any) => {
              // 실패 시 원래 상태로 복구
              setLocalCategories(categories)
              const message =
                error.response?.data?.message ||
                error.message ||
                '카테고리 순서 변경에 실패했습니다.'
              alert(message)
            },
          }
        )
      }
    }
  }

  return (
    <div className="space-y-6 bg-white rounded-[14px] p-5">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">카테고리 목록</h1>
          <p className="text-sm text-gray-600 mt-1">
            대메뉴와 소메뉴를 관리할 수 있습니다. 드래그하여 순서를 변경할 수
            있습니다.
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                카테고리가 없습니다.
              </div>
            ) : (
              <SortableContext
                items={categories.map(cat => `main-${cat.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map(category => (
                  <div key={category.id}>
                    <SortableMainCategoryItem
                      category={category}
                      isExpanded={isExpanded(category.id)}
                      onToggle={() => toggleCategory(category.id)}
                      onToggleCategory={handleToggleCategory}
                      onOpenEditModal={handleOpenEditModal}
                      onOpenDeleteModal={handleOpenDeleteModal}
                      toggleCategoryMutation={toggleCategoryMutation}
                    />

                    {/* 소메뉴 (펼쳐질 때만 표시) */}
                    {isExpanded(category.id) &&
                      category.subcategories.length > 0 && (
                        <div className="bg-gray-100 border-t border-gray-200">
                          <SortableContext
                            items={category.subcategories.map(
                              sub => `sub-${category.id}-${sub.id}`
                            )}
                            strategy={verticalListSortingStrategy}
                          >
                            {category.subcategories.map(subCategory => (
                              <SortableSubCategoryItem
                                key={subCategory.id}
                                subCategory={subCategory}
                                parentCategoryId={category.id}
                                onToggleCategory={handleToggleCategory}
                                onOpenEditModal={handleOpenEditModal}
                                onOpenDeleteModal={handleOpenDeleteModal}
                                toggleCategoryMutation={toggleCategoryMutation}
                              />
                            ))}
                          </SortableContext>
                        </div>
                      )}
                  </div>
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
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
          createCategoryMutation.isPending ||
          createSubCategoryMutation.isPending
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
