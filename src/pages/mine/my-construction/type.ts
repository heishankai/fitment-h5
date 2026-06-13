export type OrderTabName = 'accepted' | 'completed' | 'cancelled'

export type OrderStatusTagType = 'warning' | 'primary' | 'success' | 'danger' | 'default'

export interface OrderTab {
  name: OrderTabName
  title: string
}

export interface OrderTabConfig {
  status: number[]
  title: string
}

export interface CraftsmanAcceptedOrdersParams {
  order_status: number[]
}

export interface ConstructionOrder {
  id: number
  area?: string | number
  city?: string
  district?: string
  houseType?: string
  is_assigned?: boolean
  location?: string
  order_status?: number
  order_status_name?: string
  province?: string
  roomType?: string
  work_kind_name?: string
  createdAt?: string
  wechat_user?: {
    nickname?: string
  }
}
