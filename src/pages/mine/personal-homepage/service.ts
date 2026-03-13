import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取用户信息
export const getUserInfoService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'GET'
  })
}

// 新增
export const homePageAuditService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/home-page-audit`,
    method: 'POST',
    data: params
  })
}

// 获取列表（分页）
export const getHomePageAuditService = (params: {
  pageIndex: number
  pageSize: number
}): Promise<BasicResp<any[]>> => {
  return Request({
    url: `/api/home-page-audit/my/page`,
    method: 'POST',
    data: params
  })
}
