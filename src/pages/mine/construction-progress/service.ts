import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 保存施工进度
export const saveConstructionProgress = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/order/construction-progress`,
    method: 'POST',
    data: params
  })
}

// 根据经纬度获取用户位置
export const getReverseGeocode = (params: {
  latitude: number
  longitude: number
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/geolocation/reverse-geocode`,
    method: 'POST',
    data: params
  })
}
