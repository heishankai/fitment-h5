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

/** 技能认证页：工种下拉数据 */
export const getWorkKindListService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/work-kind`,
    method: 'GET'
  })
}

/**
 * 分页查询工匠用户（关联工长场景固定为工长工种）
 * body 可参考：pageIndex、pageSize、work_kind_code、craftsman_phone
 */
export const searchForemanPageService = (
  params: Partial<{
    pageIndex: number
    pageSize: number
    craftsman_phone: string
    phone: string
  }> = {}
): Promise<BasicResp<any>> => {
  const tel = params.craftsman_phone ?? params.phone
  return Request({
    url: `/api/craftsman-user/page`,
    method: 'POST',
    data: {
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
      work_kind_code: 'GONGZHANG',
      ...(tel ? { craftsman_phone: tel } : {})
    }
  })
}
