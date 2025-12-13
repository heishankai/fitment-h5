import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取分类列表
export const getCategoryListService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/category-config`,
    method: 'GET'
  })
}

/**
 * 根据分类获取辅材商品列表
 */
export const getCategoryCommodityService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config`,
    method: 'POST',
    data: params
  })
}

/**
 * 获取商品配置列表（支持分页、分类筛选、关键词搜索）
 */
export const getCommodityConfigService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config/page`,
    method: 'POST',
    data: params
  })
}

/**
 * 获取商品配置列表（列表形式，不分页）
 */
export const getCommodityConfigListService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config`,
    method: 'GET',
    params: params
  })
}

// 获取商品详情
export const getCommodityDetailService = (id: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config/${id}`,
    method: 'GET'
  })
}

/**
 * 添加辅材
 */
export const addMaterialService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/materials`,
    method: 'POST',
    data: params
  })
}
