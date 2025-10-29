import Axios, { AxiosError } from 'axios'
import { showToast } from 'vant'
// common
import { codeMessage } from '@/constants/common'

// 根据环境变量设置 baseURL
const getBaseURL = () => {
  // 使用环境变量 VITE_API_BASE_URL
  // 开发环境（test/development）使用代理时为空字符串
  // 生产环境从 .env.production 中读取
  return import.meta.env.VITE_API_BASE_URL || ''
}

// 创建一个 Axios 实例
const Request = Axios.create({
  baseURL: getBaseURL(), // 生产环境使用完整域名，开发环境使用代理
  timeout: 8000, // 设置请求超时时间
  headers: { 'content-type': 'application/json' },
  withCredentials: true // 携带跨域请求凭证（包括设置的 cookie）
})

// 请求拦截器
Request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，比如加入 token，这里不加，入口设置了cookie，请求自动携带
    return config
  },
  (error) => {
    // 对请求错误
    return Promise.reject(error)
  }
)

// 响应拦截器
Request.interceptors.response.use(
  (response) => {
    const { success, message } = response.data
    if (!success) {
      showToast(message)
      return response.data
    }

    // 响应成功
    if (success) {
      return response.data
    }
  },
  (error: AxiosError) => {
    // 响应错误
    const { response } = error
    if (response && response.status) {
      const { status, statusText } = response
      const errorText = codeMessage[status] || statusText
      showToast(errorText)
    } else if (!response) {
      showToast('您的网络发生异常，无法连接服务器')
    }
    return Promise.reject(error)
  }
)

export default Request
