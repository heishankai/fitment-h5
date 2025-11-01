// 获取路径参数
// 从 URL 查询字符串中解析参数，适用于所有场景（包括 Axios 拦截器）
export const getUrlParame = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    // 优先使用 Vue Router 的 route.query（如果可用）
    // @ts-ignore
    if (typeof useRoute !== 'undefined') {
      // @ts-ignore
      const route = useRoute()
      if (route && route.query) {
        return route.query
      }
    }
  } catch (e) {
    // 如果 useRoute 不可用，继续使用其他方法
  }

  // 从 window.location.search 解析 URL 参数
  const searchParams = new URLSearchParams(window.location.search)
  const params: Record<string, string> = {}

  searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}
