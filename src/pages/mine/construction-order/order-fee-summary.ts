/** 与订单详情接口一致：费用明细项 */
export type OrderFeeDetailItem = {
  index?: number
  amount?: number
  is_paid?: boolean
}

const ORDER_TYPE_GANGMASTER = 'gangmaster'

export function sortFeeDetailsByIndex<T extends { index?: number }>(details: T[]): T[] {
  if (!Array.isArray(details)) return []
  return [...details].sort((a, b) => (Number(a?.index) ?? 0) - (Number(b?.index) ?? 0))
}

export interface FeeSummaryDisplayRow {
  key: string
  label: string
  amount: number
  isPaid?: boolean
}

/** 平台服务费展示行（details → list → 单笔） */
export function getPlatformServiceFeeRows(orderInfo: any): FeeSummaryDisplayRow[] {
  const d = orderInfo ?? {}
  const details = d.total_service_fee_details as OrderFeeDetailItem[] | undefined
  if (Array.isArray(details) && details.length > 0) {
    return sortFeeDetailsByIndex(details).map((item, idx, arr) => ({
      key: `svc-${item.index ?? idx}`,
      label: arr.length > 1 ? `平台服务费 (${idx + 1})` : '平台服务费',
      amount: Number(item.amount) || 0,
      isPaid: !!item.is_paid
    }))
  }
  const list = d.total_service_fee_list as number[] | undefined
  const paidList = d.total_service_fee_is_paid_list as boolean[] | undefined
  if (Array.isArray(list) && list.length > 0) {
    return list.map((amount, idx, arr) => ({
      key: `svc-${idx}`,
      label: arr.length > 1 ? `平台服务费 (${idx + 1})` : '平台服务费',
      amount: Number(amount) || 0,
      isPaid: !!paidList?.[idx]
    }))
  }
  return [
    {
      key: 'svc-0',
      label: '平台服务费',
      amount: Number(d.total_service_fee) || 0,
      isPaid: !!d.total_service_fee_is_paid
    }
  ]
}

/** 工长工费展示行（仅工长单；与小程序订单详情一致） */
export function getGangmasterFeeRows(orderInfo: any): FeeSummaryDisplayRow[] {
  const d = orderInfo ?? {}
  if (d.order_type !== ORDER_TYPE_GANGMASTER) return []

  const visiting = d.visiting_service_num ?? 0
  const details = d.gangmaster_cost_details as OrderFeeDetailItem[] | undefined
  if (Array.isArray(details) && details.length > 0) {
    return sortFeeDetailsByIndex(details).map((item, idx, arr) => ({
      key: `gm-${item.index ?? idx}`,
      label:
        arr.length > 1
          ? idx === 0
            ? `工长工费 (${idx + 1}) (上门${visiting}次)`
            : `工长工费 (${idx + 1})`
          : `工长工费 (上门${visiting}次)`,
      amount: Number(item.amount) || 0,
      isPaid: !!item.is_paid
    }))
  }
  const list = d.gangmaster_cost_list as number[] | undefined
  const paidList = d.gangmaster_cost_is_paid_list as boolean[] | undefined
  if (Array.isArray(list) && list.length > 0) {
    return list.map((amount, idx, arr) => ({
      key: `gm-${idx}`,
      label:
        arr.length > 1
          ? idx === 0
            ? `工长工费 (${idx + 1}) (上门${visiting}次)`
            : `工长工费 (${idx + 1})`
          : `工长工费 (上门${visiting}次)`,
      amount: Number(amount) || 0,
      isPaid: !!paidList?.[idx]
    }))
  }
  return [
    {
      key: 'gm-0',
      label: `工长工费 (上门${visiting}次)`,
      amount: Number(d.gangmaster_cost) || 0,
      isPaid: !!d.gangmaster_cost_is_paid
    }
  ]
}

export function sumPlatformServiceFees(orderInfo: any): number {
  return getPlatformServiceFeeRows(orderInfo).reduce((s, r) => s + r.amount, 0)
}

export function sumGangmasterFees(orderInfo: any): number {
  return getGangmasterFeeRows(orderInfo).reduce((s, r) => s + r.amount, 0)
}

/** 总计：工价合计 + 平台服务费合计 + 工长工费合计（仅工长单计入工长费） */
export function calculateOrderFeeGrandTotal(orderInfo: any): number {
  const totalPrice = Number(orderInfo?.total_price) || 0
  return totalPrice + sumPlatformServiceFees(orderInfo) + sumGangmasterFees(orderInfo)
}
