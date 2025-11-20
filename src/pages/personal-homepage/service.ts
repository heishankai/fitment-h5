import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

export const homePageAuditService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/home-page-audit`,
    method: 'POST',
    data: params
  })
}

export const getHomePageAuditService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/home-page-audit/my`,
    method: 'GET'
  })
}
