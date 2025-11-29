import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 提交工长工价
export const submitForemanPrice = (data: {
  orderId: number
  laborFee: string
  workArea: string
  unitPrice: string
  workDays: string
  remark?: string
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/foreman-price`,
    method: 'POST',
    data
  })
}
