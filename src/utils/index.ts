// 获取路径参数
export const getUrlParame = () => {
  const route = useRoute()
  return route?.query
}

// Token 管理
const TOKEN_KEY = 'auth_token'

/**
 * 设置 token
 */
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * 获取 token
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除 token
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}
