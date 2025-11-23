import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

/**
 * 申请实名认证
 * @returns
 */
export const isVerifiedService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/is-verified`,
    method: 'POST',
    data: params
  })
}

/**
 * 获取用户实名认证的信息
 */
export const getIsVerifiedService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/is-verified/my`,
    method: 'GET'
  })
}
