import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

/**
 * 获取当前工匠已接单的订单列表
 * @returns 订单列表
 */
export const getCraftsmanAcceptedOrdersService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/craftsman/orders`,
    method: 'POST',
    data: params
  })
}
