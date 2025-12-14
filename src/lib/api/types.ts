/**
 * 공통 API 응답 타입
 * 모든 API 응답은 success와 message를 포함합니다.
 */
export type ApiResponse<T = unknown> = {
  success: boolean
  data: T
  message: string
}

/**
 * API 에러 응답 타입
 */
export type ApiErrorResponse = {
  success: false
  data: null
  message: string
  errors?: Record<string, string[]>
}

