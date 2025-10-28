// 通用的基础请求响应类型
export interface BasicResp<TYPE_OF_DATA> {
  success: boolean
  data: TYPE_OF_DATA
  code?: string
  message?: string
}
