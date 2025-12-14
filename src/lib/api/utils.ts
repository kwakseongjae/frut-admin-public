import type { ApiResponse } from './types'

/**
 * API 응답에서 data만 추출하는 헬퍼 함수
 * interceptor에서 success 체크를 하므로 여기서는 항상 success가 true입니다
 */
export const extractData = <T>(response: ApiResponse<T>): T => {
  return response.data
}

/**
 * API 응답의 메시지를 추출하는 헬퍼 함수
 */
export const extractMessage = <T>(response: ApiResponse<T>): string => {
  return response.message
}

