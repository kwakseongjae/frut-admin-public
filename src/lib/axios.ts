import axios, { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, ApiErrorResponse } from './api/types'
import { authApi } from './api/auth'
import { authStorage } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.47.115.33'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// refresh 요청 중복 방지를 위한 플래그
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Request interceptor - Bearer 토큰 자동 추가
apiClient.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - success 체크 및 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 204 No Content 응답은 body가 없으므로 바로 통과
    if (response.status === 204) {
      return response
    }

    const { data } = response

    // data가 없거나 success 필드가 없는 경우 (204 등) 통과
    if (!data || typeof data.success === 'undefined') {
      return response
    }

    // success가 false인 경우 에러로 처리
    if (!data.success) {
      const error: ApiErrorResponse = {
        success: false,
        data: null,
        message: data.message || '요청이 실패했습니다.',
      }

      const axiosError = new AxiosError(
        error.message,
        'API_ERROR',
        response.config,
        response.request,
        response
      )
      axiosError.response = response
      return Promise.reject(axiosError)
    }

    return response
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // HTTP 에러 처리
    if (error.response) {
      const { status, data } = error.response

      // 401 Unauthorized - 토큰 만료 시 refresh 시도
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // refresh 요청이 이미 진행 중인 경우 대기
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return apiClient(originalRequest)
            })
            .catch(err => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // refresh 토큰으로 새 토큰 발급
          const refreshResponse = await authApi.refresh()

          // 새 토큰 저장
          authStorage.setAccessToken(refreshResponse.data.access)
          authStorage.setRefreshToken(refreshResponse.data.refresh)

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`
          }

          // 대기 중인 요청들 처리
          processQueue(null, refreshResponse.data.access)

          return apiClient(originalRequest)
        } catch (refreshError) {
          // refresh 실패 시 대기 중인 요청들 모두 실패 처리
          processQueue(refreshError as AxiosError, null)

          // 로그아웃 처리
          authStorage.clearAll()
          window.location.href = '/login'

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // API 응답이 있고 success가 false인 경우
      if (data && !data.success) {
        const axiosError = new AxiosError(
          data.message || '요청이 실패했습니다.',
          'API_ERROR',
          error.config,
          error.request,
          error.response
        )
        return Promise.reject(axiosError)
      }
    }

    // 네트워크 에러 등 기타 에러
    return Promise.reject(error)
  }
)

export default apiClient
