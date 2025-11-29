import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 提交设计师工价
export const submitDesignerPrice = (data: {
  orderId: number
  designFee: string
  designArea: string
  unitPrice: string
  remark?: string
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/designer-price`,
    method: 'POST',
    data
  })
}
