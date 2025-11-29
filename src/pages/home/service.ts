import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 根据经纬度获取用户位置
export const getReverseGeocode = (params: {
  latitude: number
  longitude: number
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/geolocation/reverse-geocode`,
    method: 'POST',
    data: params
  })
}

// 获取工匠订单列表
export const getCraftsmanOrders = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/craftsman/list`,
    method: 'GET'
  })
}

// 接单
export const acceptOrder = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/accept`,
    method: 'POST',
    data: { orderId }
  })
}

// 更新订单状态
export const updateOrderStatus = (
  orderId: number,
  order_status: number
): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/${orderId}/status`,
    method: 'PUT',
    data: { order_status }
  })
}

// 获取订单详情
export const getOrderDetail = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/${orderId}`,
    method: 'GET'
  })
}

// 更新用户信息
export const updateCraftsmanUser = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'PUT',
    data: params
  })
}
