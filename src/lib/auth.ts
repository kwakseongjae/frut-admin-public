export interface User {
  id: number
  username: string
  name: string
  email: string
  phone: string
  profile_image: string | null
  user_type: 'ADMIN' | 'USER' | 'SELLER'
  point_balance: number
  is_marketing_consented: boolean
  date_joined: string
  last_login: string | null
}

export type LoginRequest = {
  username: string
  password: string
}

const USER_STORAGE_KEY = 'user'
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const authStorage = {
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_STORAGE_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY)
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  removeAccessToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  clearAll: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  isAdmin: (): boolean => {
    const user = authStorage.getUser()
    return user?.user_type === 'ADMIN'
  },
}

