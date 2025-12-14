import axios from 'axios'
import { apiClient } from '@/lib/axios'
import type { ApiResponse } from './types'
import type { User, LoginRequest } from '@/lib/auth'
import { authStorage } from '@/lib/auth'

export type Tokens = {
  access: string
  refresh: string
}

export type LoginData = {
  user: User
  tokens: Tokens
}

export type RefreshData = {
  access: string
  refresh: string
}

export type LoginResponse = ApiResponse<LoginData>
export type RefreshResponse = ApiResponse<RefreshData>

// refresh 요청용 별도 axios 인스턴스 (interceptor 무시)
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://34.47.115.33',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/api/users/auth/login',
      credentials
    )
    // interceptor에서 success 체크를 하므로 여기서는 항상 success가 true입니다
    return response.data
  },

  refresh: async (): Promise<RefreshResponse> => {
    const refreshToken = authStorage.getRefreshToken()
    if (!refreshToken) {
      throw new Error('Refresh token이 없습니다.')
    }

    // refresh 요청은 Authorization 헤더에 Bearer 토큰으로 전송
    const response = await refreshClient.post<RefreshResponse>(
      '/api/users/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    )

    // refresh 요청도 success 체크 필요
    if (!response.data.success) {
      throw new Error(response.data.message || '토큰 재발급에 실패했습니다.')
    }

    return response.data
  },
}
