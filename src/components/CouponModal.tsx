import { useState, useEffect } from 'react'

export interface CouponFormData {
  name: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number
  validFrom: string
  validTo: string
  description: string
}

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CouponFormData) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  initialData?: CouponFormData | null
}

const CouponModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode = 'create',
  initialData = null,
}: CouponModalProps) => {
  const [formData, setFormData] = useState<CouponFormData>({
    name: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validTo: '',
    description: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CouponFormData, string>>>({})

  // 모달이 열릴 때 initialData로 폼 채우기 또는 초기화
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 수정 모드: 기존 데이터로 폼 채우기
        setFormData(initialData)
      } else {
        // 생성 모드: 빈 폼으로 초기화
        setFormData({
          name: '',
          discountType: 'percentage',
          discountValue: 0,
          minOrderAmount: 0,
          maxDiscountAmount: 0,
          validFrom: '',
          validTo: '',
          description: '',
        })
      }
      setErrors({})
    } else {
      // 모달이 닫힐 때 폼 초기화
      setFormData({
        name: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        validFrom: '',
        validTo: '',
        description: '',
      })
      setErrors({})
    }
  }, [isOpen, initialData])

  const handleInputChange = (
    field: keyof CouponFormData,
    value: string | number
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // 시작일이 변경되고 종료일이 시작일보다 이전이면 종료일을 시작일로 설정
      if (field === 'validFrom' && typeof value === 'string' && value && prev.validTo) {
        const startDate = new Date(value)
        const endDate = new Date(prev.validTo)
        if (endDate < startDate) {
          updated.validTo = value
        }
      }
      return updated
    })
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CouponFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = '쿠폰명을 입력해주세요.'
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = '할인값을 입력해주세요.'
    }

    if (formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = '최소 주문 금액은 0 이상이어야 합니다.'
    }

    if (formData.maxDiscountAmount < 0) {
      newErrors.maxDiscountAmount = '최대 할인 금액은 0 이상이어야 합니다.'
    }

    if (!formData.validFrom) {
      newErrors.validFrom = '시작일을 선택해주세요.'
    }

    if (!formData.validTo) {
      newErrors.validTo = '종료일을 선택해주세요.'
    }

    if (formData.validFrom && formData.validTo) {
      const startDate = new Date(formData.validFrom)
      const endDate = new Date(formData.validTo)
      if (endDate < startDate) {
        newErrors.validTo = '종료일은 시작일 이후여야 합니다.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && !isLoading) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        validFrom: '',
        validTo: '',
        description: '',
      })
      setErrors({})
      onClose()
    }
  }

  // 필수 필드 검증 (저장 버튼 활성화 여부)
  const isFormValid = (): boolean => {
    // 필수 필드 검증
    if (
      !formData.name.trim() ||
      formData.discountValue <= 0 ||
      !formData.validFrom ||
      !formData.validTo
    ) {
      return false
    }

    // 선택 필드 검증 (0 이상이어야 함)
    if (formData.minOrderAmount < 0 || formData.maxDiscountAmount < 0) {
      return false
    }

    // 날짜 유효성 검사
    const startDate = new Date(formData.validFrom)
    const endDate = new Date(formData.validTo)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false
    }
    if (endDate < startDate) {
      return false
    }

    return true
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'edit' ? '쿠폰 수정' : '새 쿠폰 생성'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'edit' ? '쿠폰 정보를 수정하세요.' : '쿠폰 정보를 입력하세요.'}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* 쿠폰명 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쿠폰명
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="쿠폰명을 입력하세요"
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 할인 유형과 할인값 */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 할인 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  할인 유형
                </label>
                <div className="relative">
                  <select
                    value={formData.discountType}
                    onChange={e =>
                      handleInputChange('discountType', e.target.value as 'percentage' | 'fixed')
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="percentage">퍼센트 할인</option>
                    <option value="fixed">정액 할인</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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

              {/* 할인값 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.discountType === 'percentage' ? '할인율' : '할인 금액'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.discountValue || ''}
                    onChange={e => {
                      const value = Number(e.target.value)
                      // 할인율인 경우 100 이하로 제한
                      if (formData.discountType === 'percentage' && value > 100) {
                        return
                      }
                      handleInputChange('discountValue', value)
                    }}
                    placeholder="0"
                    min="0"
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.discountValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formData.discountType === 'percentage' ? '%' : '원'}
                  </span>
                </div>
                {errors.discountValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>
                )}
              </div>
            </div>
          </div>

          {/* 최소 주문 금액 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 주문 금액 <span className="text-gray-500 font-normal">(선택)</span>
            </label>
            <input
              type="number"
              value={formData.minOrderAmount || ''}
              onChange={e =>
                handleInputChange('minOrderAmount', Number(e.target.value))
              }
              placeholder="0"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.minOrderAmount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.minOrderAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount}</p>
            )}
          </div>

          {/* 최대 할인 금액 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 할인 금액 <span className="text-gray-500 font-normal">(선택)</span>
            </label>
            <input
              type="number"
              value={formData.maxDiscountAmount || ''}
              onChange={e =>
                handleInputChange('maxDiscountAmount', Number(e.target.value))
              }
              placeholder="0"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                errors.maxDiscountAmount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maxDiscountAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.maxDiscountAmount}</p>
            )}
          </div>

          {/* 시작일과 종료일 */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 시작일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={e => handleInputChange('validFrom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validFrom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.validFrom && (
                  <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>
                )}
              </div>

              {/* 종료일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validTo}
                  onChange={e => handleInputChange('validTo', e.target.value)}
                  min={formData.validFrom || undefined}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validTo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.validTo && (
                  <p className="mt-1 text-sm text-red-600">{errors.validTo}</p>
                )}
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="쿠폰에 대한 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CouponModal

