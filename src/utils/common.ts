import Cookies from 'js-cookie'
import { useRoute } from 'vue-router'
import Request from '@/utils/request'
import { API_PREFIX } from '@/constants/common.js'
import type { BasicResp } from '@/types/common'

const PREFIX_URL = API_PREFIX.CRM_ZUUL
const PREFIX_WEB_URL = API_PREFIX.SCM_ZUUL_TERMINAL

// 设置cookie
export const setCookie = (name: string, value: any) => {
  Cookies.set(name, value)
}

// 获取cookie
export const getCookie = () => {
  const accessToken = Cookies.get('access_token')
  const refreshToken = Cookies.get('refresh_token')
  return {
    accessToken,
    refreshToken
  }
}

// 获取路径参数
export const getUrlParame = () => {
  const route = useRoute()
  return route?.query
}

// 获取用户信息 调用sso接口
export const getUserInfo = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `${PREFIX_URL}/api-b2b-base-manage-front/sso/user/getUser`,
    params,
    method: 'GET'
  })
}

// 获取按钮权限
export const getButtons = (): Promise<BasicResp<any>> => {
  return Request({
    url: `${PREFIX_WEB_URL}/api-b2b-trml-config/trml/resource/buttonList`,
    method: 'GET'
  })
}
