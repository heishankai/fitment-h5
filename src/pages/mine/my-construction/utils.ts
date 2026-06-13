import { ORDER_STATUS_TAG_TYPE } from './constants'
import type { ConstructionOrder, OrderStatusTagType } from './type'

// 订单状态转 Vant Tag 类型。
export const getOrderStatusType = (status?: number): OrderStatusTagType => {
  return ORDER_STATUS_TAG_TYPE[Number(status)] || 'default'
}

// 优先展示后端完整地址，没有时回退省市区拼接。
export const getOrderAddress = (order: ConstructionOrder): string => {
  return order.location || [order.province, order.city, order.district].filter(Boolean).join('')
}

// 统一订单卡片中的房屋信息文案。
export const getOrderHouseText = (order: ConstructionOrder): string => {
  const houseType = order.houseType === 'new' ? '新房' : '老房'
  return `${houseType} · ${order.roomType || ''} · ${order.area || 0}m²`
}

// 订单客户名兜底。
export const getOrderUserName = (order: ConstructionOrder): string => {
  return order.wechat_user?.nickname || '用户'
}
