import type { OrderStatusTagType, OrderTab, OrderTabConfig, OrderTabName } from './type'

// 页面 tab 与后端订单状态的对应关系。
export const ORDER_TAB_LIST: readonly OrderTab[] = [
  { name: 'accepted', title: '已接单' },
  { name: 'completed', title: '已完成' },
  { name: 'cancelled', title: '已取消' }
] as const

export const ORDER_TAB_CONFIG: Record<OrderTabName, OrderTabConfig> = {
  accepted: { status: [2], title: '已接单' },
  completed: { status: [3], title: '已完成' },
  cancelled: { status: [4], title: '已取消' }
}

// Vant Tag 类型映射，保持订单状态颜色表现集中维护。
export const ORDER_STATUS_TAG_TYPE: Record<number, OrderStatusTagType> = {
  1: 'warning',
  2: 'primary',
  3: 'success',
  4: 'danger'
}
