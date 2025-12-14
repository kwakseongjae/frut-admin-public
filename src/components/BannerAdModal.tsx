import { useState, useEffect, useRef } from 'react'
import {
  operationApi,
  type CreateBannerAdRequest,
  type UpdateBannerAdRequest,
} from '@/lib/api/operation'
import { uploadImageFile } from '@/lib/api/upload'

interface BannerAdModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  adId?: number | null
}

const BannerAdModal = ({
  isOpen,
  onClose,
  onSuccess,
  adId,
}: BannerAdModalProps) => {
  const [formData, setFormData] = useState<CreateBannerAdRequest>({
    ad_title: '',
    ad_company: '',
    ad_image: '',
    ad_url: '',
    start_date: '',
    end_date: '',
    ad_type: 'MAIN',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasImageChanged, setHasImageChanged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 수정 모드일 때 데이터 로드
  useEffect(() => {
    if (isOpen && adId) {
      const loadAdData = async () => {
        try {
          const response = await operationApi.getBannerAdDetail(adId)
          const adData =
            'data' in response && response.data ? response.data : response

          if (adData && 'ad_title' in adData) {
            setFormData({
              ad_title: adData.ad_title || '',
              ad_company: adData.ad_company || '',
              ad_image: adData.ad_image || '',
              ad_url: adData.ad_url || '',
              start_date: adData.start_date || '',
              end_date: adData.end_date || '',
              ad_type: adData.ad_type || 'MAIN',
            })
            setImagePreview(adData.ad_image || '')
          }
        } catch (err) {
          setError('광고 정보를 불러오는데 실패했습니다.')
          console.error('Failed to load ad data:', err)
        }
      }
      loadAdData()
      setHasImageChanged(false)
    } else if (isOpen && !adId) {
      // 생성 모드일 때 폼 초기화
      setFormData({
        ad_title: '',
        ad_company: '',
        ad_image: '',
        ad_url: '',
        start_date: '',
        end_date: '',
        ad_type: 'MAIN',
      })
      setImageFile(null)
      setImagePreview('')
      setError(null)
      setHasImageChanged(false)
    }
  }, [isOpen, adId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setHasImageChanged(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 필수 필드 검증
    if (!formData.start_date || !formData.end_date || !formData.ad_type) {
      setError('필수 필드를 모두 입력해주세요.')
      return
    }

    // 날짜 검증
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('시작일은 종료일보다 이전이어야 합니다.')
      return
    }

    // 이미지 검증 (생성 모드일 때는 필수)
    if (!adId && !imageFile) {
      setError('광고 이미지를 업로드해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      let imageUrl: string | undefined = undefined

      // 이미지 업로드 (새 파일이 있는 경우)
      if (imageFile) {
        // 새 이미지 업로드
        const gcsPath = await uploadImageFile(imageFile, {
          prefix: 'banner-ad',
        })
        // 백엔드가 gcs_path를 받아서 전체 URL로 처리하므로 gcs_path를 그대로 사용
        imageUrl = gcsPath
      } else if (!adId) {
        // 생성 모드인데 이미지가 없으면 에러
        setError('광고 이미지를 업로드해주세요.')
        setIsSubmitting(false)
        return
      } else if (adId && hasImageChanged) {
        // 수정 모드에서 이미지가 변경되었는데 파일이 없으면 에러 (이론적으로 발생하지 않아야 함)
        setError('이미지 업로드에 실패했습니다.')
        setIsSubmitting(false)
        return
      }

      // 수정 모드에서 이미지가 변경되지 않았으면 ad_image 필드를 제외
      const submitData: CreateBannerAdRequest | UpdateBannerAdRequest = {
        ...(adId
          ? {
              ad_title: formData.ad_title,
              ad_company: formData.ad_company,
              ad_url: formData.ad_url,
              start_date: formData.start_date,
              end_date: formData.end_date,
              ad_type: formData.ad_type,
              ...(imageUrl !== undefined && { ad_image: imageUrl }),
            }
          : {
              ...formData,
              ad_image: imageUrl!,
            }),
      }

      if (adId) {
        // 수정
        await operationApi.updateBannerAd(adId, submitData)
      } else {
        // 생성
        await operationApi.createBannerAd(submitData as CreateBannerAdRequest)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(adId ? '광고 수정에 실패했습니다.' : '광고 등록에 실패했습니다.')
      console.error('Failed to submit ad:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {adId ? '광고 수정' : '광고 등록'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 광고 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                광고 이미지 <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  이미지 선택
                </button>
              </div>
            </div>

            {/* 광고 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                광고 제목
              </label>
              <input
                type="text"
                value={formData.ad_title}
                onChange={e =>
                  setFormData({ ...formData, ad_title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="광고 제목을 입력하세요"
              />
            </div>

            {/* 광고 회사 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                광고 회사
              </label>
              <input
                type="text"
                value={formData.ad_company}
                onChange={e =>
                  setFormData({ ...formData, ad_company: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="광고 회사를 입력하세요"
              />
            </div>

            {/* 광고 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                광고 타입 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ad_type}
                onChange={e =>
                  setFormData({
                    ...formData,
                    ad_type: e.target.value as 'MAIN' | 'MIDDLE' | 'MYPAGE',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MAIN">메인 광고</option>
                <option value="MIDDLE">중간 광고</option>
                <option value="MYPAGE">마이페이지 광고</option>
              </select>
            </div>

            {/* 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={e =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 종료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={e =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 연결 URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연결 URL
              </label>
              <input
                type="url"
                value={formData.ad_url}
                onChange={e =>
                  setFormData({ ...formData, ad_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '처리 중...' : adId ? '수정' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BannerAdModal
