import Axios, { AxiosError } from 'axios'
import { getToken } from './index'
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
  // 注意：不在这里设置 FormData 的 Content-Type，让浏览器自动处理
})

// 请求拦截器
Request.interceptors.request.use(
  (config) => {
    const token = getToken()

    console.log('请求 URL:', config.url)
    console.log('Token:', token ? '已设置' : '未设置')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('警告: 请求缺少 token，可能返回 401')
    }

    // FormData 请求不需要设置 Content-Type，让浏览器自动设置（包含 boundary）
    // 这很重要！如果手动设置 Content-Type，会缺少 boundary 参数，导致 400 错误
    if (config.data instanceof FormData) {
      // 删除可能存在的 Content-Type，让浏览器自动设置 multipart/form-data; boundary=xxx
      delete config.headers['content-type']
      delete config.headers['Content-Type']
    }

    // 在发送请求之前做些什么，比如加入 token，
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
    const { success, message } = response.data || {}

    // 后端统一使用 ResponseInterceptor，所有响应都是 { success, data, code, message } 格式
    if (!success) {
      showToast(message || '请求失败')
      return response.data
    }

    // 响应成功，直接返回 response.data（包含 success, data, code, message）
    // 前端可以通过 res.success 和 res.data 访问数据
    return response.data
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
