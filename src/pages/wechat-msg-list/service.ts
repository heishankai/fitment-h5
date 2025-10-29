import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取按钮权限
export const getCaseListService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/case-query/page`,
    method: 'POST',
    data: params
  })
}
