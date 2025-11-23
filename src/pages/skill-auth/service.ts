import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

export const isSkillVerifiedService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/is-skill-verified`,
    method: 'POST',
    data: params
  })
}

/**
 * 获取用户技能认证信息
 */
export const getIsSkillVerifiedService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/is-skill-verified/my`,
    method: 'GET'
  })
}
