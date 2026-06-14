import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 根据订单 ID 获取施工进度记录。
export const getConstructionProgressByOrderId = (orderId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/construction-progress/order/${orderId}`,
    method: 'GET'
  })
}
