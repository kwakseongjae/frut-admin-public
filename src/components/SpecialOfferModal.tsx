import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import TiptapEditor from './TiptapEditor'
import { categoryApi } from '@/lib/api/category'
import { productApi } from '@/lib/api/product'
import {
  generateSignedUrl,
  uploadToGCS,
  generateContentUploadSignedUrl,
  generateContentReadSignedUrl,
} from '@/lib/api/upload'

interface SpecialOfferModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (formData: SpecialOfferFormData) => void
  editId?: number // 수정 모드일 때 특가 상품 ID
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

interface ProductOption {
  id: string
  name: string
  regularPrice: number
  discountPrice: number
  isDiscountEnabled: boolean
}

const SpecialOfferModal = ({
  isOpen,
  onClose,
  onRegister,
  editId,
}: SpecialOfferModalProps) => {
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const additionalImageInputRef = useRef<HTMLInputElement>(null)

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
  const [deliveryFee, setDeliveryFee] = useState<number>(0)

  const [mainImage, setMainImage] = useState<string | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImageGcsPath, setMainImageGcsPath] = useState<string | null>(null) // 기존 메인 이미지 gcs_path
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [additionalImageGcsPaths, setAdditionalImageGcsPaths] = useState<
    string[]
  >([]) // 기존 추가 이미지 gcs_path 배열
  const [isMainCategoryOpen, setIsMainCategoryOpen] = useState(false)
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false)
  const [options, setOptions] = useState<ProductOption[]>([
    {
      id: '1',
      name: '',
      regularPrice: 0,
      discountPrice: 0,
      isDiscountEnabled: false,
    },
  ])
  const [productInfo, setProductInfo] = useState({
    productName: '',
    manufacturer: '',
    manufactureDate: '',
    expirationDate: '',
    legalInfo: '',
    composition: '',
    storageMethod: '',
    customerServicePhone: '',
  })
  const [manufactureYear, setManufactureYear] = useState<string>('')
  const [manufactureMonth, setManufactureMonth] = useState<string>('')
  const [manufactureDay, setManufactureDay] = useState<string>('')

  const [errors, setErrors] = useState<
    Partial<Record<keyof SpecialOfferFormData, string>>
  >({})

  // 카테고리 데이터 조회
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories', true],
    queryFn: () => categoryApi.getCategories(true),
  })

  // 특가 상품 상세 조회 (수정 모드일 때)
  const { data: specialOfferDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['specialOfferDetail', editId],
    queryFn: () => productApi.getSpecialOfferDetail(editId!),
    enabled: !!editId && isOpen,
  })

  // 선택된 대메뉴의 소메뉴 목록
  const availableSubCategories =
    categoriesData?.data?.find(cat => cat.id === Number(formData.mainCategory))
      ?.subcategories || []

  // 허용된 이미지 확장자 검증
  const isValidImageExtension = (fileName: string): boolean => {
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.pdf',
      '.doc',
      '.docx',
    ]
    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf('.'))
    return allowedExtensions.includes(fileExtension)
  }

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 확장자 검증
      if (!isValidImageExtension(file.name)) {
        alert(
          '허용된 파일 형식만 업로드 가능합니다: .jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx'
        )
        if (mainImageInputRef.current) {
          mainImageInputRef.current.value = ''
        }
        return
      }

      setMainImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          setMainImage(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)

      // 확장자 검증
      const invalidFiles = fileArray.filter(
        file => !isValidImageExtension(file.name)
      )
      if (invalidFiles.length > 0) {
        alert(
          '허용된 파일 형식만 업로드 가능합니다: .jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx'
        )
        if (additionalImageInputRef.current) {
          additionalImageInputRef.current.value = ''
        }
        return
      }

      setAdditionalImageFiles(prev => {
        const updated = [...prev, ...fileArray]
        return updated.slice(0, 9)
      })
      const newImages: string[] = []
      fileArray.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string)
            if (newImages.length === fileArray.length) {
              setAdditionalImages(prev => {
                const updated = [...prev, ...newImages]
                return updated.slice(0, 9)
              })
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveMainImage = () => {
    setMainImage(null)
    setMainImageFile(null)
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ''
    }
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleOptionChange = (
    id: string,
    field: keyof ProductOption,
    value: string | number | boolean
  ) => {
    setOptions(prev =>
      prev.map(option => {
        if (option.id === id) {
          const updated = { ...option, [field]: value }

          // 설정 안함일 경우 할인가 = 정가
          if (field === 'isDiscountEnabled' && !value) {
            updated.discountPrice = updated.regularPrice
          }

          // 정가 변경 시 설정 안함이면 할인가도 함께 변경
          if (field === 'regularPrice' && !updated.isDiscountEnabled) {
            updated.discountPrice = value as number
          }

          // 할인가가 정상가보다 크면 정상가로 제한
          if (field === 'discountPrice' && updated.regularPrice > 0) {
            const discountValue = value as number
            if (discountValue > updated.regularPrice) {
              updated.discountPrice = updated.regularPrice
            }
          }

          return updated
        }
        return option
      })
    )
  }

  const handleAddOption = () => {
    setOptions(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        regularPrice: 0,
        discountPrice: 0,
        isDiscountEnabled: false,
      },
    ])
  }

  const handleRemoveOption = (id: string) => {
    if (options.length > 1) {
      setOptions(prev => prev.filter(option => option.id !== id))
    }
  }

  const calculateDiscountPercent = (
    regularPrice: number,
    discountPrice: number
  ): number => {
    if (regularPrice === 0) return 0
    return Math.round(((regularPrice - discountPrice) / regularPrice) * 100)
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
      setErrors(prev => ({ ...prev, subCategory: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SpecialOfferFormData, string>> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = '상품명을 입력해주세요.'
    }

    if (!formData.mainCategory) {
      newErrors.mainCategory = '대메뉴를 선택해주세요.'
    }

    if (!formData.subCategory) {
      newErrors.subCategory = '소메뉴를 선택해주세요.'
    }

    if (!mainImageFile) {
      newErrors.mainImageUrl = '메인 이미지를 선택해주세요.'
    }

    // 이미지 개수 확인 (메인 1개 + 추가 최대 9개 = 총 최대 10개)
    const totalImages = 1 + additionalImageFiles.length
    if (totalImages > 10) {
      newErrors.mainImageUrl = '이미지는 최대 10개까지 등록할 수 있습니다.'
    }

    // 옵션 유효성 검증
    const hasValidOption = options.some(
      opt => opt.name.trim() && opt.regularPrice > 0
    )
    if (!hasValidOption) {
      // 옵션 에러는 별도로 처리하지 않음 (UI에서 표시)
    }

    // 상품 설명 확인 (HTML 태그 제거 후 텍스트만 확인, 또는 이미지가 있으면 유효)
    const textContent = formData.description.replace(/<[^>]*>/g, '').trim()
    const hasImage = /<img[^>]*>/i.test(formData.description)
    if (!textContent && !hasImage) {
      // 상품 설명은 필수이지만 에러는 별도로 처리하지 않음
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

  // base64 또는 blob URL을 File 객체로 변환
  const imageUrlToFile = async (
    imageUrl: string,
    fileName: string
  ): Promise<File> => {
    let blob: Blob

    if (imageUrl.startsWith('data:')) {
      // base64 데이터 URL 처리
      const response = await fetch(imageUrl)
      blob = await response.blob()
    } else if (imageUrl.startsWith('blob:')) {
      // blob URL 처리
      const response = await fetch(imageUrl)
      blob = await response.blob()
    } else {
      throw new Error('지원하지 않는 이미지 형식입니다.')
    }

    return new File([blob], fileName, { type: blob.type })
  }

  // detail_content에서 base64 이미지를 찾아서 content/ 경로에 업로드하고 읽기용 Signed URL로 교체
  const processDetailContentImages = async (
    content: string
  ): Promise<string> => {
    if (!content) return content

    // HTML에서 img 태그의 src 속성 추출 (base64 또는 blob URL)
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    const matches = Array.from(content.matchAll(imgRegex))
    const base64Images = matches.filter(
      match =>
        match[1].startsWith('data:image/') || match[1].startsWith('blob:')
    )

    if (base64Images.length === 0) return content

    let processedContent = content
    const timestamp = Date.now()
    const replacements: Array<{ original: string; replacement: string }> = []

    // 각 base64 이미지를 content/ 경로에 업로드
    for (let i = 0; i < base64Images.length; i++) {
      const match = base64Images[i]
      const originalSrc = match[1]
      const fullMatch = match[0]

      try {
        // base64 또는 blob URL을 File로 변환
        let fileExtension = 'png'
        let contentType = 'image/png'

        if (originalSrc.startsWith('data:image/')) {
          const mimeMatch = originalSrc.match(/data:image\/([^;]+)/)
          fileExtension = mimeMatch ? mimeMatch[1] : 'png'
          contentType = `image/${fileExtension}`
        } else if (originalSrc.startsWith('blob:')) {
          // blob URL의 경우 기본값 사용
          fileExtension = 'png'
          contentType = 'image/png'
        }

        const fileName = `detail_image_${timestamp}_${i}.${fileExtension}`

        const file = await imageUrlToFile(originalSrc, fileName)

        // 1. content/ 경로용 업로드 Signed URL 생성
        const uploadSignedUrlData = await generateContentUploadSignedUrl({
          file_name: fileName,
          content_type: contentType,
        })

        // 2. Signed URL로 파일 업로드
        await uploadToGCS(
          uploadSignedUrlData.data.signed_url,
          file,
          contentType
        )

        // 3. 읽기용 Signed URL 생성
        const readSignedUrlData = await generateContentReadSignedUrl({
          gcs_path: uploadSignedUrlData.data.gcs_path,
        })

        // 4. img 태그의 src를 읽기용 Signed URL로 교체
        const newImgTag = fullMatch.replace(
          /src=["'][^"']+["']/,
          `src="${readSignedUrlData.data.signed_url}"`
        )

        replacements.push({ original: fullMatch, replacement: newImgTag })
      } catch (error) {
        console.error(`이미지 업로드 실패 (${i}번째):`, error)
        // 업로드 실패 시 원본 유지
      }
    }

    // 역순으로 교체하여 인덱스 문제 방지
    for (let i = replacements.length - 1; i >= 0; i--) {
      const { original, replacement } = replacements[i]
      processedContent = processedContent.replace(original, replacement)
    }

    return processedContent
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()

  const createSpecialOfferMutation = useMutation({
    mutationFn: (formData: FormData) => productApi.createSpecialOffer(formData),
    onSuccess: () => {
      // 특가 상품 목록 쿼리 무효화하여 리스트 갱신
      queryClient.invalidateQueries({ queryKey: ['specialOffers'] })
    },
  })

  const updateSpecialOfferMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      productApi.updateSpecialOffer(id, formData),
    onSuccess: () => {
      // 특가 상품 목록 쿼리 무효화하여 리스트 갱신
      queryClient.invalidateQueries({ queryKey: ['specialOffers'] })
      // 상세 정보도 무효화
      queryClient.invalidateQueries({
        queryKey: ['specialOfferDetail', editId],
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // 추가 검증
    if (!mainImageFile) {
      alert('메인 이미지를 선택해주세요.')
      return
    }

    // 옵션 유효성 검증
    const hasValidOption = options.some(
      opt => opt.name.trim() && opt.regularPrice > 0
    )
    if (!hasValidOption) {
      alert('최소 1개 이상의 유효한 옵션을 입력해주세요.')
      return
    }

    // 상품 설명 확인
    const textContent = formData.description.replace(/<[^>]*>/g, '').trim()
    const hasImage = /<img[^>]*>/i.test(formData.description)
    if (!textContent && !hasImage) {
      alert('상품 설명을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. 메인 이미지 처리
      let mainImagePath: string
      if (editId && mainImageGcsPath && !mainImageFile) {
        // 수정 모드: 기존 이미지를 그대로 사용하는 경우 gcs_path 사용
        mainImagePath = mainImageGcsPath
      } else if (mainImageFile) {
        // 새로 업로드하는 경우
        try {
          const signedUrlData = await generateSignedUrl({
            file_name: mainImageFile.name,
            content_type: mainImageFile.type,
          })
          await uploadToGCS(
            signedUrlData.data.signed_url,
            mainImageFile,
            mainImageFile.type
          )
          mainImagePath = signedUrlData.data.gcs_path
        } catch (error) {
          console.error('메인 이미지 업로드 실패:', error)
          alert('상품 이미지 업로드 실패')
          setIsSubmitting(false)
          return
        }
      } else {
        alert('메인 이미지를 선택해주세요.')
        setIsSubmitting(false)
        return
      }

      // 2. 추가 이미지들 처리
      let additionalImagePaths: string[] = []
      try {
        // 수정 모드일 때: 기존 이미지와 새 이미지를 구분
        if (editId && additionalImageGcsPaths.length > 0) {
          // additionalImages와 additionalImageFiles의 인덱스를 비교
          // additionalImageFiles에 File이 있으면 새 이미지, 없으면 기존 이미지
          const processedPaths: string[] = []

          for (let i = 0; i < additionalImages.length; i++) {
            const file = additionalImageFiles[i]
            const existingGcsPath = additionalImageGcsPaths[i]

            if (file) {
              // 새로 추가된 이미지 (업로드 필요)
              const signedUrlData = await generateSignedUrl({
                file_name: file.name,
                content_type: file.type,
              })
              await uploadToGCS(signedUrlData.data.signed_url, file, file.type)
              processedPaths.push(signedUrlData.data.gcs_path)
            } else if (existingGcsPath) {
              // 기존 이미지 (gcs_path 사용)
              processedPaths.push(existingGcsPath)
            }
          }

          additionalImagePaths = processedPaths
        } else {
          // 등록 모드: 모든 이미지 새로 업로드
          if (additionalImageFiles.length > 0) {
            additionalImagePaths = await Promise.all(
              additionalImageFiles.map(async file => {
                const signedUrlData = await generateSignedUrl({
                  file_name: file.name,
                  content_type: file.type,
                })
                await uploadToGCS(
                  signedUrlData.data.signed_url,
                  file,
                  file.type
                )
                return signedUrlData.data.gcs_path
              })
            )
          }
        }
      } catch (error) {
        console.error('추가 이미지 업로드 실패:', error)
        alert('상품 이미지 업로드 실패')
        setIsSubmitting(false)
        return
      }

      // 3. 이미지 경로 배열 생성 (메인 이미지가 첫 번째)
      const imagePaths = [mainImagePath, ...additionalImagePaths]

      // 4. 옵션 데이터 변환
      const productOptions = options
        .filter(
          opt =>
            opt.name.trim() && (opt.regularPrice > 0 || opt.discountPrice > 0)
        )
        .map(opt => {
          const price = opt.regularPrice // 정가
          const costPrice = opt.isDiscountEnabled
            ? opt.discountPrice
            : opt.regularPrice // 할인가 (할인 미설정 시 정가와 동일)
          const discountRate = opt.isDiscountEnabled
            ? calculateDiscountPercent(opt.regularPrice, opt.discountPrice)
            : 0

          return {
            name: opt.name,
            price,
            cost_price: costPrice,
            discount_rate: discountRate,
          }
        })

      // 5. detail_content의 이미지를 GCS에 업로드하고 경로로 교체
      let processedDetailContent: string = ''
      try {
        processedDetailContent = formData.description
          ? await processDetailContentImages(formData.description)
          : ''
      } catch (error) {
        console.error('상품 설명 이미지 업로드 실패:', error)
        alert('상품 설명 이미지 업로드 실패')
        setIsSubmitting(false)
        return
      }

      // 6. 생산연도 추출 (정수)
      const productionYear = manufactureYear
        ? (() => {
            const year = parseInt(manufactureYear, 10)
            return Number.isNaN(year) || year < 1 ? undefined : year
          })()
        : undefined

      // 7. FormData 생성
      const submitFormData = new FormData()
      submitFormData.append('category_id', formData.subCategory) // 서브카테고리 ID 사용
      submitFormData.append('product_name', formData.productName)
      submitFormData.append('start_date', formData.startDate)
      submitFormData.append('end_date', formData.endDate)
      submitFormData.append('delivery_fee', String(deliveryFee || 0))
      submitFormData.append('images', JSON.stringify(imagePaths))
      submitFormData.append('detail_content', processedDetailContent)
      submitFormData.append('options', JSON.stringify(productOptions))

      // 선택 필드 추가
      if (productInfo.productName) {
        submitFormData.append('product_description', productInfo.productName)
      }
      if (productInfo.manufacturer) {
        submitFormData.append('producer_name', productInfo.manufacturer)
      }
      if (productInfo.manufactureDate) {
        submitFormData.append('production_date', productInfo.manufactureDate)
      }
      if (productionYear) {
        submitFormData.append('production_year', String(productionYear))
      }
      if (productInfo.expirationDate) {
        submitFormData.append('expiry_type', productInfo.expirationDate)
      }
      if (productInfo.legalInfo) {
        submitFormData.append('legal_notice', productInfo.legalInfo)
      }
      if (productInfo.composition) {
        submitFormData.append('product_composition', productInfo.composition)
      }
      if (productInfo.storageMethod) {
        submitFormData.append('handling_method', productInfo.storageMethod)
      }
      if (productInfo.customerServicePhone) {
        submitFormData.append(
          'customer_service_phone',
          productInfo.customerServicePhone
        )
      }

      // 8. API 호출
      if (editId) {
        // 수정 모드
        await updateSpecialOfferMutation.mutateAsync({
          id: editId,
          formData: submitFormData,
        })
        alert('특가 상품이 수정되었습니다.')
      } else {
        // 등록 모드
        await createSpecialOfferMutation.mutateAsync(submitFormData)
        alert('특가 상품이 등록되었습니다.')
      }
      handleClose()
      onRegister(formData)
    } catch (error) {
      console.error('특가 상품 등록 실패:', error)
      alert('특가 상품 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
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
    setMainImage(null)
    setMainImageFile(null)
    setAdditionalImages([])
    setAdditionalImageFiles([])
    setOptions([
      {
        id: '1',
        name: '',
        regularPrice: 0,
        discountPrice: 0,
        isDiscountEnabled: false,
      },
    ])
    setProductInfo({
      productName: '',
      manufacturer: '',
      manufactureDate: '',
      expirationDate: '',
      legalInfo: '',
      composition: '',
      storageMethod: '',
      customerServicePhone: '',
    })
    setManufactureYear('')
    setManufactureMonth('')
    setManufactureDay('')
    setDeliveryFee(0)
    setErrors({})
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ''
    }
    if (additionalImageInputRef.current) {
      additionalImageInputRef.current.value = ''
    }
    onClose()
  }

  // 수정 모드일 때 데이터 로드 및 폼 초기화
  useEffect(() => {
    if (
      editId &&
      specialOfferDetail?.data &&
      categoriesData?.data &&
      !isDetailLoading &&
      !isCategoriesLoading
    ) {
      const detail = specialOfferDetail.data
      const product = detail.product

      // 카테고리 찾기 (category_id로 대메뉴와 소메뉴 찾기)
      let mainCategoryId = ''
      let subCategoryId = String(product.category_id)

      // 모든 카테고리를 순회하면서 해당 category_id를 가진 서브카테고리 찾기
      for (const mainCat of categoriesData.data) {
        const subCat = mainCat.subcategories.find(
          sub => sub.id === product.category_id
        )
        if (subCat) {
          mainCategoryId = String(mainCat.id)
          break
        }
      }

      // 메인 이미지 설정 (is_main이 true인 이미지)
      const mainImageData = product.images.find(img => img.is_main)
      const additionalImagesData = product.images.filter(img => !img.is_main)

      // 이미지 URL을 File로 변환하는 함수
      const urlToFile = async (
        url: string,
        filename: string
      ): Promise<File> => {
        const response = await fetch(url)
        const blob = await response.blob()
        return new File([blob], filename, { type: blob.type })
      }

      // 메인 이미지 설정
      if (mainImageData) {
        setMainImage(mainImageData.image_url)
        setMainImageGcsPath(mainImageData.gcs_path) // gcs_path 저장
        urlToFile(mainImageData.image_url, 'main.jpg')
          .then(file => setMainImageFile(file))
          .catch(err => console.error('메인 이미지 로드 실패:', err))
      }

      // 추가 이미지 설정
      if (additionalImagesData.length > 0) {
        const imageUrls = additionalImagesData.map(img => img.image_url)
        const gcsPaths = additionalImagesData.map(img => img.gcs_path)
        setAdditionalImages(imageUrls)
        setAdditionalImageGcsPaths(gcsPaths) // gcs_path 배열 저장
        Promise.all(
          additionalImagesData.map((img, index) =>
            urlToFile(img.image_url, `additional_${index}.jpg`)
          )
        )
          .then(files => setAdditionalImageFiles(files))
          .catch(err => console.error('추가 이미지 로드 실패:', err))
      }

      // 옵션 설정
      if (product.options && product.options.length > 0) {
        const mappedOptions: ProductOption[] = product.options.map(
          (opt, index) => ({
            id: String(opt.id || index + 1),
            name: opt.name,
            regularPrice: opt.price,
            discountPrice: opt.cost_price,
            isDiscountEnabled: opt.discount_rate > 0,
          })
        )
        setOptions(mappedOptions)
      }

      // 생산연월일 파싱
      if (product.production_date) {
        const [year, month, day] = product.production_date.split('-')
        setManufactureYear(year || '')
        setManufactureMonth(month || '')
        setManufactureDay(day || '')
      }

      // 폼 데이터 설정
      setFormData({
        productName: product.product_name,
        mainCategory: mainCategoryId,
        subCategory: subCategoryId,
        mainImageUrl: mainImageData?.image_url || '',
        additionalImages: additionalImagesData.map(img => img.image_url),
        hasOptions: product.options && product.options.length > 0,
        originalPrice: product.display_price,
        discountedPrice: product.display_cost_price,
        description: product.detail_content || '',
        startDate: detail.start_date,
        endDate: detail.end_date,
      })

      // 상품 정보 설정
      setProductInfo({
        productName: product.product_description || '',
        manufacturer: product.producer_name || '',
        manufactureDate: product.production_date || '',
        expirationDate: product.expiry_type || '',
        legalInfo: product.legal_notice || '',
        composition: product.product_composition || '',
        storageMethod: product.handling_method || '',
        customerServicePhone: product.customer_service_phone || '',
      })

      // 배송비 설정
      setDeliveryFee(detail.delivery_fee || 0)
    }
  }, [
    editId,
    specialOfferDetail,
    categoriesData,
    isDetailLoading,
    isCategoriesLoading,
  ])

  if (!isOpen) return null

  // 로딩 중일 때
  if (editId && (isDetailLoading || isCategoriesLoading)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative bg-white rounded-lg shadow-xl w-[800px] p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-[60]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editId ? '특가 상품 수정' : '특가 상품 등록'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editId
                ? '특가 상품 정보를 수정합니다.'
                : '새로운 특가 상품을 등록합니다.'}
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
        <form onSubmit={handleSubmit} className="px-5 py-4">
          {/* 카테고리 설정 */}
          <div className="flex flex-col gap-[10px] mb-6">
            <div className="text-base font-medium text-[#262626]">
              카테고리 설정 <span className="text-[#F73535]">*</span>
            </div>
            <div className="flex flex-col gap-2">
              {/* 대메뉴 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMainCategoryOpen(!isMainCategoryOpen)
                    setIsSubCategoryOpen(false)
                  }}
                  disabled={isCategoriesLoading}
                  className={`w-full border border-[#D9D9D9] p-3 flex items-center justify-between text-sm text-left ${
                    errors.mainCategory ? 'border-[#F73535]' : ''
                  } ${isCategoriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="대메뉴 선택"
                >
                  <span
                    className={
                      formData.mainCategory
                        ? 'text-[#262626]'
                        : 'text-[#949494]'
                    }
                  >
                    {isCategoriesLoading
                      ? '로딩 중...'
                      : categoriesData?.data?.find(
                          cat => cat.id === Number(formData.mainCategory)
                        )?.category_name || '대메뉴'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#949494] transform transition-transform ${
                      isMainCategoryOpen ? 'rotate-[270deg]' : 'rotate-90'
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
                </button>
                {isMainCategoryOpen && !isCategoriesLoading && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMainCategoryOpen(false)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsMainCategoryOpen(false)
                        }
                      }}
                      aria-label="카테고리 메뉴 닫기"
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D9D9D9] z-40 max-h-48 overflow-y-auto">
                      {categoriesData?.data &&
                      categoriesData.data.length > 0 ? (
                        categoriesData.data.map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              handleInputChange(
                                'mainCategory',
                                String(category.id)
                              )
                              setIsMainCategoryOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5]"
                          >
                            {category.category_name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-[#8C8C8C]">
                          카테고리가 없습니다.
                        </div>
                      )}
                    </div>
                  </>
                )}
                {errors.mainCategory && (
                  <p className="mt-1 text-sm text-[#F73535]">
                    {errors.mainCategory}
                  </p>
                )}
              </div>

              {/* 소메뉴 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.mainCategory) {
                      setIsSubCategoryOpen(!isSubCategoryOpen)
                      setIsMainCategoryOpen(false)
                    }
                  }}
                  disabled={!formData.mainCategory || isCategoriesLoading}
                  className={`w-full border border-[#D9D9D9] p-3 flex items-center justify-between text-sm text-left ${
                    !formData.mainCategory
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  } ${errors.subCategory ? 'border-[#F73535]' : ''}`}
                  aria-label="소메뉴 선택"
                >
                  <span
                    className={
                      formData.subCategory ? 'text-[#262626]' : 'text-[#949494]'
                    }
                  >
                    {availableSubCategories.find(
                      sub => sub.id === Number(formData.subCategory)
                    )?.category_name || '소메뉴'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#949494] transform transition-transform ${
                      isSubCategoryOpen ? 'rotate-[270deg]' : 'rotate-90'
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
                </button>
                {isSubCategoryOpen && formData.mainCategory && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSubCategoryOpen(false)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsSubCategoryOpen(false)
                        }
                      }}
                      aria-label="카테고리 메뉴 닫기"
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D9D9D9] z-40 max-h-48 overflow-y-auto">
                      {availableSubCategories.length > 0 ? (
                        availableSubCategories.map(subcategory => (
                          <button
                            key={subcategory.id}
                            type="button"
                            onClick={() => {
                              handleInputChange(
                                'subCategory',
                                String(subcategory.id)
                              )
                              setIsSubCategoryOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5]"
                          >
                            {subcategory.category_name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-[#8C8C8C]">
                          소메뉴가 없습니다.
                        </div>
                      )}
                    </div>
                  </>
                )}
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-[#F73535]">
                    {errors.subCategory}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 상품명 */}
          <div className="flex flex-col gap-[10px] mb-6">
            <label className="text-base font-medium text-[#262626]">
              상품명 <span className="text-[#F73535]">*</span>
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <input
                type="text"
                value={formData.productName}
                onChange={e => handleInputChange('productName', e.target.value)}
                placeholder="상품명을 입력하세요"
                maxLength={20}
                className={`w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] ${
                  errors.productName ? 'text-[#F73535]' : ''
                }`}
              />
            </div>
            {errors.productName && (
              <p className="text-sm text-[#F73535]">{errors.productName}</p>
            )}
          </div>

          {/* 메인 이미지 */}
          <div className="flex flex-col gap-[10px] mb-6">
            <div className="text-base font-medium text-[#262626]">
              메인 이미지 <span className="text-[#F73535]">*</span>
            </div>
            <div className="w-full border border-[#D9D9D9] p-4 min-h-[200px] flex flex-col items-center justify-center gap-2 relative">
              {mainImage ? (
                <>
                  <div className="relative w-full aspect-square rounded overflow-hidden">
                    <img
                      src={mainImage}
                      alt="메인 상품 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                    aria-label="이미지 삭제"
                  >
                    <svg
                      className="w-4 h-4 text-white"
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
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 text-[#262626]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm text-[#262626]">
                    메인 상품 이미지
                  </span>
                  <span className="text-xs text-[#8C8C8C]">
                    권장 해상도: 000x000
                  </span>
                </>
              )}
              <input
                ref={mainImageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                onChange={handleMainImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => mainImageInputRef.current?.click()}
                className="flex items-center gap-1 text-sm text-[#262626] border border-[#D9D9D9] px-3 py-1.5"
                aria-label="이미지 선택"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>이미지 선택</span>
              </button>
            </div>
            {errors.mainImageUrl && (
              <p className="text-sm text-[#F73535]">{errors.mainImageUrl}</p>
            )}
          </div>

          {/* 추가 이미지 */}
          <div className="flex flex-col gap-[10px] mb-6">
            <div className="flex items-center justify-between">
              <div className="text-base font-medium text-[#262626]">
                추가 이미지
              </div>
              <span className="text-xs text-[#8C8C8C]">
                최대 9장까지 추가 가능
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {additionalImages.map((image, index) => (
                <div
                  key={`additional-image-${index}`}
                  className="relative w-[140px] h-[140px] rounded overflow-hidden bg-[#D9D9D9]"
                >
                  <img
                    src={image}
                    alt={`추가 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                    aria-label="이미지 삭제"
                  >
                    <svg
                      className="w-3 h-3 text-white"
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
              ))}
              {additionalImages.length < 9 && (
                <button
                  type="button"
                  onClick={() => additionalImageInputRef.current?.click()}
                  className="w-[140px] h-[140px] border border-[#D9D9D9] flex flex-col items-center justify-center gap-1"
                  aria-label="이미지 추가"
                >
                  <svg
                    className="w-5 h-5 text-[#818181]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-[12px] font-medium text-[#818181]">
                    {additionalImages.length}/9
                  </span>
                </button>
              )}
              <input
                ref={additionalImageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                multiple
                onChange={handleAdditionalImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* 옵션 설정 */}
          <div className="flex flex-col gap-4 mb-6">
            {/* 섹션 헤더 */}
            <div className="flex flex-col gap-2">
              <div className="text-base font-medium text-[#262626]">
                옵션 설정 <span className="text-[#F73535]">*</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-[#8C8C8C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs text-[#8C8C8C]">
                  옵션 1의 가격이 상품 기본 가격으로 설정됩니다.
                </span>
              </div>
            </div>

            {/* 옵션 리스트 */}
            {options.map((option, index) => (
              <div key={option.id} className="flex flex-col gap-3">
                {/* 옵션 간 구분선 (첫 번째 옵션 제외) */}
                {index > 0 && (
                  <div className="border-t border-[#E5E5E5] pt-4" />
                )}

                {/* 옵션 헤더 (옵션 번호 + 삭제 버튼) */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#262626]">
                    옵션 {index + 1}
                  </span>
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                      aria-label="옵션 삭제"
                    >
                      삭제
                    </button>
                  )}
                </div>

                {/* 옵션 입력 필드들 */}
                <div className="flex flex-col gap-[10px]">
                  {/* 옵션명 입력 */}
                  <div className="flex flex-col gap-[10px]">
                    <div className="text-sm text-[#262626]">옵션명</div>
                    <input
                      type="text"
                      value={option.name}
                      onChange={e =>
                        handleOptionChange(option.id, 'name', e.target.value)
                      }
                      placeholder="옵션명을 입력하세요"
                      className="w-full border border-[#D9D9D9] p-3 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                    />
                  </div>

                  {/* 정가 입력 */}
                  <div className="flex flex-col gap-[10px]">
                    <div className="text-sm text-[#262626]">정가</div>
                    <div className="border border-[#D9D9D9] p-3 flex items-center justify-end gap-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={option.regularPrice || ''}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          handleOptionChange(
                            option.id,
                            'regularPrice',
                            value === '' ? 0 : Number(value)
                          )
                        }}
                        placeholder="0"
                        className="text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full"
                      />
                      <span className="text-sm text-[#8C8C8C]">원</span>
                    </div>
                  </div>

                  {/* 할인가 입력 */}
                  <div className="flex flex-col gap-[10px]">
                    <div className="text-sm text-[#262626]">할인가</div>
                    <div className="relative">
                      <div
                        className={`border border-[#D9D9D9] p-3 flex items-center justify-end gap-1 ${
                          !option.isDiscountEnabled ? 'bg-[#F5F5F5]' : ''
                        }`}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={option.discountPrice || ''}
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9]/g, '')
                            const numValue = value === '' ? 0 : Number(value)
                            // 정상가보다 큰 값이면 정상가로 제한
                            const finalValue =
                              option.regularPrice > 0 &&
                              numValue > option.regularPrice
                                ? option.regularPrice
                                : numValue
                            handleOptionChange(
                              option.id,
                              'discountPrice',
                              finalValue
                            )
                          }}
                          disabled={!option.isDiscountEnabled}
                          placeholder="0"
                          className={`text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full ${
                            !option.isDiscountEnabled
                              ? 'cursor-not-allowed'
                              : ''
                          }`}
                        />
                        <span className="text-sm text-[#8C8C8C]">원</span>
                      </div>
                      {/* 할인율 표시 (할인 설정 시, 정가 > 할인가일 때만) */}
                      {option.isDiscountEnabled &&
                        option.regularPrice > 0 &&
                        option.discountPrice < option.regularPrice && (
                          <div className="absolute right-0 bottom-[-20px] text-sm text-red-500 font-medium">
                            {calculateDiscountPercent(
                              option.regularPrice,
                              option.discountPrice
                            )}
                            %
                          </div>
                        )}
                    </div>
                  </div>

                  {/* 설정/설정 안함 체크박스 */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          handleOptionChange(
                            option.id,
                            'isDiscountEnabled',
                            true
                          )
                        }
                        className="flex items-center justify-center"
                        aria-label="설정"
                      >
                        {option.isDiscountEnabled ? (
                          <svg
                            className="w-[18px] h-[18px]"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <rect
                              width="18"
                              height="18"
                              rx="2"
                              fill="#8BC53F"
                            />
                            <path
                              d="M5 9L8 12L13 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-[18px] h-[18px]"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <rect
                              width="18"
                              height="18"
                              rx="2"
                              fill="#D9D9D9"
                            />
                          </svg>
                        )}
                      </button>
                      <span className="text-sm text-[#262626]">설정</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          handleOptionChange(
                            option.id,
                            'isDiscountEnabled',
                            false
                          )
                        }
                        className="flex items-center justify-center"
                        aria-label="설정 안함"
                      >
                        {!option.isDiscountEnabled ? (
                          <svg
                            className="w-[18px] h-[18px]"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <rect
                              width="18"
                              height="18"
                              rx="2"
                              fill="#8BC53F"
                            />
                            <path
                              d="M5 9L8 12L13 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-[18px] h-[18px]"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <rect
                              width="18"
                              height="18"
                              rx="2"
                              fill="#D9D9D9"
                            />
                          </svg>
                        )}
                      </button>
                      <span className="text-sm text-[#262626]">설정 안함</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {/* 옵션 추가 버튼 */}
            <button
              type="button"
              onClick={handleAddOption}
              className="w-full border border-[#D9D9D9] p-3 flex items-center justify-center gap-1 text-sm text-[#262626]"
              aria-label="옵션 추가"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>옵션 추가</span>
            </button>
          </div>

          {/* 특가 기간 및 배송비 */}
          <div className="flex flex-col gap-[10px] mb-6">
            <div className="text-base font-medium text-[#262626]">
              특가 기간 및 배송비 <span className="text-[#F73535]">*</span>
            </div>
            <div className="flex flex-col gap-4">
              {/* 특가 시작일 */}
              <div className="flex flex-col gap-[10px]">
                <label className="text-sm text-[#262626]">특가 시작일</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e =>
                      handleInputChange('startDate', e.target.value)
                    }
                    className="w-full border border-[#D9D9D9] p-3 text-sm focus:outline-none caret-[#133A1B]"
                  />
                </div>
              </div>

              {/* 특가 종료일 */}
              <div className="flex flex-col gap-[10px]">
                <label className="text-sm text-[#262626]">특가 종료일</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className="w-full border border-[#D9D9D9] p-3 text-sm focus:outline-none caret-[#133A1B]"
                  />
                </div>
                {formData.startDate &&
                  formData.endDate &&
                  formData.endDate <= formData.startDate && (
                    <p className="text-sm text-[#F73535]">
                      종료일은 시작일보다 이후여야 합니다.
                    </p>
                  )}
              </div>

              {/* 배송비 */}
              <div className="flex flex-col gap-[10px]">
                <label className="text-sm text-[#262626]">배송비</label>
                <div className="border border-[#D9D9D9] p-3 flex items-center justify-end gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={deliveryFee || ''}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setDeliveryFee(value === '' ? 0 : Number(value))
                    }}
                    placeholder="0"
                    className="text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full"
                  />
                  <span className="text-sm text-[#8C8C8C]">원</span>
                </div>
                {deliveryFee === 0 && (
                  <p className="text-xs text-[#8C8C8C]">
                    0원 입력 시 무료배송으로 표시됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-[10px] mb-6">
            <div className="text-base font-medium text-[#262626]">
              상품 정보
            </div>
            <div className="border border-[#D9D9D9] flex flex-col">
              {[
                { key: 'productName', label: '제품명' },
                { key: 'manufacturer', label: '생산자 및 소재지' },
                {
                  key: 'manufactureDate',
                  label: '제조연월일(포장일 또는 생산연도)',
                },
                { key: 'expirationDate', label: '유통기한 또는 품질유지기한' },
                { key: 'legalInfo', label: '관련법상 표시사항' },
                { key: 'composition', label: '상품구성' },
                { key: 'storageMethod', label: '보관방법 또는 취급방법' },
                {
                  key: 'customerServicePhone',
                  label: '소비자상담 관련 전화번호',
                },
              ].map(({ key, label }, index) => (
                <div
                  key={key}
                  className={`flex items-center gap-4 p-3 ${
                    index !==
                    [
                      'productName',
                      'manufacturer',
                      'manufactureDate',
                      'expirationDate',
                      'legalInfo',
                      'composition',
                      'storageMethod',
                      'customerServicePhone',
                    ].length -
                      1
                      ? 'border-b border-[#E5E5E5]'
                      : ''
                  }`}
                >
                  <span className="text-sm text-[#262626] min-w-[140px] flex-shrink-0 text-left">
                    {label}
                  </span>
                  {key === 'manufactureDate' ? (
                    /* 제조연월일 특수 처리 - YYYY-MM-DD 분리 입력 */
                    <div className="flex-1 flex items-center gap-2 justify-end">
                      <input
                        type="text"
                        value={manufactureYear}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          if (value.length <= 4) {
                            setManufactureYear(value)
                            // YYYY-MM-DD 형식으로 조합
                            const month = manufactureMonth.padStart(2, '0')
                            const day = manufactureDay.padStart(2, '0')
                            const dateStr =
                              value && month && day
                                ? `${value}-${month}-${day}`
                                : ''
                            setProductInfo(prev => ({
                              ...prev,
                              manufactureDate: dateStr,
                            }))
                          }
                        }}
                        placeholder="YYYY"
                        maxLength={4}
                        className="w-16 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-center border border-[#D9D9D9] p-1"
                      />
                      <span className="text-sm text-[#262626]">-</span>
                      <input
                        type="text"
                        value={manufactureMonth}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          if (value.length <= 2) {
                            const numValue = parseInt(value, 10)
                            if (
                              value === '' ||
                              (numValue >= 1 && numValue <= 12)
                            ) {
                              setManufactureMonth(value)
                              // YYYY-MM-DD 형식으로 조합
                              const year = manufactureYear.padStart(4, '0')
                              const day = manufactureDay.padStart(2, '0')
                              const month = value.padStart(2, '0')
                              const dateStr =
                                year && month && day
                                  ? `${year}-${month}-${day}`
                                  : ''
                              setProductInfo(prev => ({
                                ...prev,
                                manufactureDate: dateStr,
                              }))
                            }
                          }
                        }}
                        placeholder="MM"
                        maxLength={2}
                        className="w-12 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-center border border-[#D9D9D9] p-1"
                      />
                      <span className="text-sm text-[#262626]">-</span>
                      <input
                        type="text"
                        value={manufactureDay}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          if (value.length <= 2) {
                            const numValue = parseInt(value, 10)
                            if (
                              value === '' ||
                              (numValue >= 1 && numValue <= 31)
                            ) {
                              setManufactureDay(value)
                              // YYYY-MM-DD 형식으로 조합
                              const year = manufactureYear.padStart(4, '0')
                              const month = manufactureMonth.padStart(2, '0')
                              const day = value.padStart(2, '0')
                              const dateStr =
                                year && month && day
                                  ? `${year}-${month}-${day}`
                                  : ''
                              setProductInfo(prev => ({
                                ...prev,
                                manufactureDate: dateStr,
                              }))
                            }
                          }
                        }}
                        placeholder="DD"
                        maxLength={2}
                        className="w-12 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-center border border-[#D9D9D9] p-1"
                      />
                    </div>
                  ) : (
                    /* 일반 텍스트 입력 필드 */
                    <input
                      type="text"
                      value={productInfo[key as keyof typeof productInfo]}
                      onChange={e =>
                        setProductInfo(prev => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder="내용을 입력하세요"
                      className="flex-1 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-right"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 상품 상세페이지 */}
          <div className="mb-6">
            <div className="text-base font-medium text-[#262626] mb-[10px]">
              상품 설명 <span className="text-[#F73535]">*</span>
            </div>
            <TiptapEditor
              content={formData.description}
              onChange={content => handleInputChange('description', content)}
              placeholder="상품에 대한 상세한 설명을 작성해주세요."
            />
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? editId
                  ? '수정 중...'
                  : '등록 중...'
                : editId
                  ? '수정'
                  : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SpecialOfferModal
