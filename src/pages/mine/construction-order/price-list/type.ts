export type WorkerInfo = {
  nickname?: string
  phone?: string
}

export type WorkPriceGroup = {
  id?: number | string
  work_price_id?: number | string
  work_price?: number | string
  work_title?: string
  quantity?: number | string
  work_kind_name?: string
  labour_cost_name?: string
  minimum_price?: number | string
  is_set_minimum_price?: number | string
  is_paid?: boolean
  is_accepted?: boolean
  assigned_craftsman_id?: number | string
  assigned_craftsman?: WorkerInfo
  settlement_amount?: number | string
  display_images?: string[]
}

export type FeeDetail = {
  amount?: number | string
  is_paid?: boolean
}

export type OrderDetail = {
  id?: number
  parent_work_price_groups?: WorkPriceGroup[]
  total_price?: number | string
  all_total_price?: number | string
  total_service_fee_details?: FeeDetail[]
  gangmaster_cost_details?: FeeDetail[]
  visiting_service_num?: number | string
  order_type?: string
  is_paid?: boolean
  total_is_accepted?: boolean
}
