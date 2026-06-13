import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'
import type { ConstructionOrder, CraftsmanAcceptedOrdersParams } from './type'

/**
 * 获取当前工匠的工地订单列表。
 */
export const getCraftsmanAcceptedOrdersService = (
  params: CraftsmanAcceptedOrdersParams
): Promise<BasicResp<ConstructionOrder[]>> => {
  return Request({
    url: `/api/order/craftsman/orders`,
    method: 'POST',
    data: params
  })
}
