import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取工种信息
export const getWorkKindListService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/work-kind`,
    method: 'GET'
  })
}
