import { useState } from 'react'

interface SpecialOfferModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (formData: SpecialOfferFormData) => void
}

export interface SpecialOfferFormData {
  productName: string
  mainCategory: string
  subCategory: string
  mainImageUrl: string
  additionalImages: string[]
  hasOptions: boolean
  originalPrice: number
  discountedPrice: number
  description: string
  startDate: string
  endDate: string
}

const SpecialOfferModal = ({
  isOpen,
  onClose,
  onRegister,
}: SpecialOfferModalProps) => {
  const [formData, setFormData] = useState<SpecialOfferFormData>({
    productName: '',
    mainCategory: '',
    subCategory: '',
    mainImageUrl: '',
    additionalImages: [],
    hasOptions: false,
    originalPrice: 0,
    discountedPrice: 0,
    description: '',
    startDate: '',
    endDate: '',
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof SpecialOfferFormData, string>>
  >({})

  const mainCategories = ['과일', '채소', '견과류', '곡물', '기타']

  const subCategories: Record<string, string[]> = {
    과일: ['사과', '딸기', '오렌지', '바나나', '포도'],
    채소: ['토마토', '양파', '당근', '배추', '무'],
    견과류: ['땅콩', '호두', '아몬드', '캐슈넛', '밤'],
    곡물: ['쌀', '보리', '밀', '옥수수', '콩'],
    기타: ['기타1', '기타2', '기타3'],
  }

  const handleInputChange = (
    field: keyof SpecialOfferFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Reset subCategory when mainCategory changes
    if (field === 'mainCategory') {
      setFormData(prev => ({ ...prev, subCategory: '' }))
    }
  }

  const handleAddAdditionalImage = () => {
    if (formData.additionalImages.length < 9) {
      setFormData(prev => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ''],
      }))
    }
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }))
  }

  const handleAdditionalImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.map((img, i) =>
        i === index ? value : img
      ),
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SpecialOfferFormData, string>> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = '상품명을 입력해주세요.'
    } else if (formData.productName.length > 20) {
      newErrors.productName = '상품명은 최대 20자까지 입력 가능합니다.'
    }

    if (!formData.mainCategory) {
      newErrors.mainCategory = '대메뉴를 선택해주세요.'
    }

    if (!formData.subCategory) {
      newErrors.subCategory = '소메뉴를 선택해주세요.'
    }

    if (!formData.mainImageUrl.trim()) {
      newErrors.mainImageUrl = '메인 이미지 URL을 입력해주세요.'
    }

    if (!formData.originalPrice || formData.originalPrice <= 0) {
      newErrors.originalPrice = '정가를 입력해주세요.'
    }

    if (!formData.discountedPrice || formData.discountedPrice <= 0) {
      newErrors.discountedPrice = '할인가를 입력해주세요.'
    } else if (formData.discountedPrice >= formData.originalPrice) {
      newErrors.discountedPrice = '할인가는 정가보다 작아야 합니다.'
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작일을 선택해주세요.'
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료일을 선택해주세요.'
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = '종료일은 시작일보다 이후여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onRegister(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      productName: '',
      mainCategory: '',
      subCategory: '',
      mainImageUrl: '',
      additionalImages: [],
      hasOptions: false,
      originalPrice: 0,
      discountedPrice: 0,
      description: '',
      startDate: '',
      endDate: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const availableSubCategories = formData.mainCategory
    ? subCategories[formData.mainCategory] || []
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              특가 상품 등록
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              새로운 특가 상품을 등록합니다.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* 기본 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              기본 정보
            </h3>
            <div className="space-y-4">
              {/* 상품명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={e =>
                    handleInputChange('productName', e.target.value)
                  }
                  placeholder="최대 20자까지 입력"
                  maxLength={20}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.productName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.productName}
                  </p>
                )}
              </div>

              {/* 대메뉴 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대메뉴 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.mainCategory}
                    onChange={e =>
                      handleInputChange('mainCategory', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8 ${
                      errors.mainCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">대메뉴 선택</option>
                    {mainCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.mainCategory && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mainCategory}
                  </p>
                )}
              </div>

              {/* 소메뉴 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소메뉴 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.subCategory}
                    onChange={e =>
                      handleInputChange('subCategory', e.target.value)
                    }
                    disabled={!formData.mainCategory}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8 ${
                      errors.subCategory ? 'border-red-500' : 'border-gray-300'
                    } ${!formData.mainCategory ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">소메뉴 선택</option>
                    {availableSubCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.subCategory}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 상품 이미지 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              상품 이미지
            </h3>
            <div className="space-y-4">
              {/* 메인 사진 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메인 사진 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.mainImageUrl}
                  onChange={e =>
                    handleInputChange('mainImageUrl', e.target.value)
                  }
                  placeholder="메인 이미지 URL (해상도: 000*000)"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mainImageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.mainImageUrl && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mainImageUrl}
                  </p>
                )}
              </div>

              {/* 추가 사진 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    추가 사진 (최대 9장)
                  </label>
                  {formData.additionalImages.length < 9 && (
                    <button
                      type="button"
                      onClick={handleAddAdditionalImage}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + 추가 이미지 추가
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.additionalImages.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={image}
                        onChange={e =>
                          handleAdditionalImageChange(index, e.target.value)
                        }
                        placeholder="추가 이미지 URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
                        aria-label="이미지 제거"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 옵션 설정 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              옵션 설정
            </h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasOptions}
                onChange={e =>
                  handleInputChange('hasOptions', e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">옵션 설정</span>
            </label>
          </div>

          {/* 가격 설정 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              가격 설정
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* 정가 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={e =>
                    handleInputChange('originalPrice', Number(e.target.value))
                  }
                  placeholder="정가 입력"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.originalPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.originalPrice}
                  </p>
                )}
              </div>

              {/* 할인가 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  할인가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discountedPrice || ''}
                  onChange={e =>
                    handleInputChange('discountedPrice', Number(e.target.value))
                  }
                  placeholder="할인가 입력"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.discountedPrice
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.discountedPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.discountedPrice}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 상품 상세페이지 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              상품 상세페이지
            </h3>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="상품 상세 설명을 입력하세요"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 기간 설정 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              기간 설정
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* 시작일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e =>
                      handleInputChange('startDate', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.startDate}
                  </p>
                )}
              </div>

              {/* 종료일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SpecialOfferModal
