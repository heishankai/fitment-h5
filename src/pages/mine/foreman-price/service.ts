import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取工种信息
export const getWorkKindListService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/work-kind`,
    method: 'GET'
  })
}

// 根据工种id获取工价信息
export const getWorkKindPriceService = (workKindId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/work-type/work-kind/${workKindId}`,
    method: 'GET'
  })
}

// 获取工价详情
export const getWorkPriceDetailService = (id: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/work-type/${id}`,
    method: 'GET'
  })
}

// 提交工价清单
export const submitWorkPriceService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/work-prices`,
    method: 'POST',
    data: params
  })
}

// 获取用户信息
export const getUserInfoService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user`,
    method: 'GET'
  })
}
