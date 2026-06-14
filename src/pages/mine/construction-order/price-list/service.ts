import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'
import type { OrderDetail } from './type'

// 获取工价清单所在订单详情，接口已包含工价聚合数据。
export const getOrderDetail = (orderId: number): Promise<BasicResp<OrderDetail>> => {
  return Request({
    url: `/api/order/${orderId}`,
    method: 'GET'
  })
}
