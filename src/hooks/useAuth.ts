import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/auth'
import { authStorage } from '@/lib/auth'
import type { LoginRequest } from '@/lib/auth'

export const useLogin = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: data => {
      // 응답에서 받은 토큰 저장 (access, refresh)
      authStorage.setAccessToken(data.data.tokens.access)
      authStorage.setRefreshToken(data.data.tokens.refresh)
      authStorage.setUser(data.data.user)

      // 사용자가 ADMIN인지 확인
      if (data.data.user.user_type === 'ADMIN') {
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/', { replace: true })
      } else {
        // ADMIN이 아닌 경우 로그아웃 처리
        authStorage.clearAll()
        alert('관리자만 접근할 수 있습니다.')
      }
    },
    onError: (error: any) => {
      // interceptor에서 success=false인 경우도 에러로 처리하므로
      // error.response?.data?.message 또는 error.message를 사용할 수 있습니다
      const message =
        error.response?.data?.message ||
        error.message ||
        '로그인에 실패했습니다.'
      alert(message)
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    authStorage.clearAll()
    queryClient.clear()
    navigate('/login')
  }
}
