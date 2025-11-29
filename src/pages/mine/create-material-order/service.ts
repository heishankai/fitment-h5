import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 分页获取辅料
export const getCommodityConfigService = (params: {
  pageIndex: number
  pageSize: number
  category_id?: number | null
  keyword?: string | null
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config/page`,
    method: 'POST',
    data: params
  })
}

// 获取商品详情
export const getCommodityDetailService = (id: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config/${id}`,
    method: 'GET'
  })
}

// 根据分类获取商品列表（GET请求）
export const getCommodityByCategoryService = (
  categoryId?: number | null
): Promise<BasicResp<any>> => {
  const url = categoryId
    ? `/api/commodity-config?category_id=${categoryId}`
    : `/api/commodity-config`
  return Request({
    url,
    method: 'GET'
  })
}

// 获取分类列表
export const getCategoryListService = (params: {
  pageIndex: number
  pageSize: number
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/category-config/page`,
    method: 'POST',
    data: params
  })
}

// 创建辅料单
export const createMaterialOrder = (data: {
  orderId: number
  commodities: Array<{
    commodityId: number
    quantity: number
  }>
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/material-order`,
    method: 'POST',
    data
  })
}

/**
 * 根据分类获取辅材商品列表
 */
export const getCommodityConfigListService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/commodity-config`,
    method: 'POST',
    data: params
  })
}
