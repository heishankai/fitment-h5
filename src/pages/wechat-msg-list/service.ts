import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 测试接口
export const getCaseListService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/case-query/page`,
    method: 'POST',
    data: params
  })
}
