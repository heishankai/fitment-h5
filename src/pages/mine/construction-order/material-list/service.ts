import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取订单详情，用于辅材清单页展示订单基础信息。
export const getOrderDetail = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/${orderId}`,
    method: 'GET'
  })
}

// 获取当前工匠用户信息，用于判断页面展示逻辑。
export const getUserInfoService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'GET'
  })
}

// 根据订单 ID 获取辅材列表。
export const getMaterialsByOrderId = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/materials/order/${orderId}`,
    method: 'GET'
  })
}
