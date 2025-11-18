import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取用户信息
export const getUserInfoService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'GET'
  })
}

// 修改用户信息
export const updatInfoService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'PUT',
    data: params
  })
}
