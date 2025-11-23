import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取平台公告
export const getPlatformNoticeListService = (params: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/platform-notice`,
    method: 'GET',
    params
  }) as Promise<BasicResp<any>>
}

// 获取平台公告详情
export const getPlatformNoticeDetailService = (id: any): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/platform-notice/${id}`,
    method: 'GET'
  }) as Promise<BasicResp<any>>
}

// 获取系统通知列表（根据token获取当前用户的通知）
export const getSystemNotificationListService = (isRead?: boolean): Promise<BasicResp<any>> => {
  const params: any = {}
  if (isRead !== undefined) {
    params.isRead = String(isRead)
  }
  return Request({
    url: `/api/system-notification/my`,
    method: 'GET',
    params
  }) as Promise<BasicResp<any>>
}

// 获取用户未读通知数量（根据token获取当前用户）
export const getUnreadNotificationCountService = (): Promise<BasicResp<{ count: number }>> => {
  return Request({
    url: `/api/system-notification/unread-count`,
    method: 'GET'
  }) as Promise<BasicResp<{ count: number }>>
}

// 标记通知为已读
export const markNotificationAsReadService = (notificationId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/system-notification/read/${notificationId}`,
    method: 'PUT'
  }) as Promise<BasicResp<any>>
}

// 标记所有通知为已读（根据token获取当前用户）
export const markAllNotificationsAsReadService = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/system-notification/read-all`,
    method: 'PUT'
  }) as Promise<BasicResp<any>>
}
