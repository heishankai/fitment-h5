import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取订单详情
export const getOrderDetail = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/${orderId}`,
    method: 'GET'
  })
}

// 获取用户信息
export const getUserInfoService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'GET'
  })
}
