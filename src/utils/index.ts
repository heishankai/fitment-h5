// 获取路径参数
export const getUrlParame = () => {
  const route = useRoute()
  return route?.query
}
