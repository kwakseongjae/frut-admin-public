import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'

/**
 * Signed URL 생성 요청 타입
 */
export interface GenerateSignedUrlRequest {
  file_name: string
  content_type: string
}

/**
 * Signed URL 생성 응답 타입
 */
export interface GenerateSignedUrlResponse extends ApiResponse<{
  signed_url: string
  gcs_path: string
}> {}

/**
 * Signed URL 생성 API
 */
export const generateSignedUrl = async (
  data: GenerateSignedUrlRequest
): Promise<GenerateSignedUrlResponse> => {
  const response = await apiClient.post<GenerateSignedUrlResponse>(
    '/api/generate-upload-signed-url',
    data
  )
  return response.data
}

/**
 * GCS에 파일 업로드
 * Signed URL의 서명에 포함된 헤더와 정확히 일치해야 함
 */
export const uploadToGCS = async (
  signedUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  // Signed URL의 서명에 content-type이 포함되어 있으므로 반드시 설정해야 함
  // 헤더 이름은 정확히 일치해야 함 (대소문자 구분)
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
    // CORS 모드 명시
    mode: 'cors',
    // credentials는 포함하지 않음 (Signed URL에 이미 인증 정보 포함)
    credentials: 'omit',
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `GCS 업로드 실패: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
    )
  }
}

/**
 * 파일명 정리 (특수문자 제거 및 안전한 파일명 생성)
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\s+/g, '_')
}

/**
 * 파일에서 Content-Type 추출 (기본값 포함)
 */
export const getContentType = (file: File, defaultType: string = 'application/octet-stream'): string => {
  return file.type || defaultType
}

/**
 * Signed URL에서 쿼리 파라미터를 제거한 기본 URL 추출
 */
export const extractBaseUrl = (signedUrl: string): string => {
  const url = new URL(signedUrl)
  return `${url.protocol}//${url.host}${url.pathname}`
}

/**
 * 이미지 파일 업로드 헬퍼 함수
 * Signed URL 생성부터 GCS 업로드까지 한번에 처리
 * 
 * @param file 업로드할 파일
 * @param options 옵션
 * @returns 업로드된 파일의 GCS 전체 URL (쿼리 파라미터 제거)
 */
export const uploadImageFile = async (
  file: File,
  options?: {
    prefix?: string
    defaultContentType?: string
  }
): Promise<string> => {
  // 파일명 정리
  const sanitizedFileName = sanitizeFileName(file.name)
  const fileName = options?.prefix
    ? `${options.prefix}_${Date.now()}_${sanitizedFileName}`
    : `${Date.now()}_${sanitizedFileName}`

  // Content-Type 추출
  const contentType = getContentType(
    file,
    options?.defaultContentType || 'image/png'
  )

  // Signed URL 생성
  const signedUrlResponse = await generateSignedUrl({
    file_name: fileName,
    content_type: contentType,
  })

  if (!signedUrlResponse.success) {
    throw new Error(
      signedUrlResponse.message || 'Signed URL 생성에 실패했습니다.'
    )
  }

  // GCS에 파일 업로드
  await uploadToGCS(
    signedUrlResponse.data.signed_url,
    file,
    contentType
  )

  // 백엔드에 전달할 경로: gcs_path만 전달 (백엔드에서 적절히 처리)
  // 백엔드가 전체 URL을 원한다면 extractBaseUrl(signedUrlResponse.data.signed_url) 사용
  return signedUrlResponse.data.gcs_path
}

/**
 * Content 업로드용 Signed URL 생성 요청 타입
 */
export interface GenerateContentUploadSignedUrlRequest {
  file_name: string
  content_type: string
}

/**
 * Content 업로드용 Signed URL 생성 응답 타입
 */
export interface GenerateContentUploadSignedUrlResponse extends ApiResponse<{
  signed_url: string
  gcs_path: string
}> {}

/**
 * Content 업로드용 Signed URL 생성 API
 */
export const generateContentUploadSignedUrl = async (
  data: GenerateContentUploadSignedUrlRequest
): Promise<GenerateContentUploadSignedUrlResponse> => {
  const response = await apiClient.post<GenerateContentUploadSignedUrlResponse>(
    '/api/generate-content-upload-signed-url',
    data
  )
  return response.data
}

/**
 * Content 읽기용 Signed URL 생성 요청 타입
 */
export interface GenerateContentReadSignedUrlRequest {
  gcs_path: string
}

/**
 * Content 읽기용 Signed URL 생성 응답 타입
 */
export interface GenerateContentReadSignedUrlResponse extends ApiResponse<{
  gcs_path: string
  signed_url: string
}> {}

/**
 * Content 읽기용 Signed URL 생성 API
 */
export const generateContentReadSignedUrl = async (
  data: GenerateContentReadSignedUrlRequest
): Promise<GenerateContentReadSignedUrlResponse> => {
  const response = await apiClient.post<GenerateContentReadSignedUrlResponse>(
    '/api/generate-content-read-signed-url',
    data
  )
  return response.data
}

