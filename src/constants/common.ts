/** 华为云图片obs 公共域名 */
export const PREFIX_IMG_URL =
  'https://nfsq-filesystem.obs.cn-east-2.myhuaweicloud.com/terminal-clients/images'

/**  接口前缀获取 */
export const API_PREFIX = {
  SCM_ZUUL_TERMINAL: '/crm-zuul-terminal-api',
  CRM_ZUUL: '/crm-zuul-api',
  BUDGET: '/api-b2b-budget',
  B2B_BASE_MANAGE: '/api-b2b-base-manage-front'
}

/** 响应提示 */
export const codeMessage: Record<number, string> = {
  400: '请求错误',
  401: '用户没有权限。',
  403: '用户得到授权，但是访问是被禁止的',
  404: '发出的请求是不存在的记录',
  406: '请求的格式不可得',
  410: '请求的资源被永久删除',
  422: '验证错误',
  500: '服务器发生错误',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时'
}
