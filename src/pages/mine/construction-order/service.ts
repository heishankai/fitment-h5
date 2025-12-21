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

// 根据订单ID获取施工进度
export const getConstructionProgressByOrderId = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/construction-progress/order/${orderId}`,
    method: 'GET'
  })
}

// 根据订单ID获取辅材列表
export const getMaterialsByOrderId = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/materials/order/${orderId}`,
    method: 'GET'
  })
}

/**
 * 获取所有子工价
 */
export const getSubWorkPricesByOrderId = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/${orderId}/sub-groups`,
    method: 'GET'
  })
}
