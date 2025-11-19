import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

export const isSkillVerifiedService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/is-skill-verified`,
    method: 'POST',
    data: params
  })
}

export const getisSkillVerifiedService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/is-skill-verified/my`,
    method: 'GET'
  })
}
