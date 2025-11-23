import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

// 获取用户未读通知数量
export const getUnreadNotificationCountService = (): Promise<BasicResp<{ count: number }>> => {
  return Request({
    url: `/api/system-notification/unread-count`,
    method: 'GET'
  }) as Promise<BasicResp<{ count: number }>>
}

// ========== 工匠-微信用户聊天相关 API ==========

/**
 * 获取工匠用户的所有聊天房间列表
 */
export const getCraftsmanRooms = (): Promise<BasicResp<any[]>> => {
  return Request({
    url: `/api/craftsman-wechat-chat/rooms/craftsman`,
    method: 'GET'
  }) as Promise<BasicResp<any[]>>
}

/**
 * 获取微信用户的所有聊天房间列表
 */
export const getWechatUserRooms = (): Promise<BasicResp<any[]>> => {
  return Request({
    url: `/api/craftsman-wechat-chat/rooms/wechat`,
    method: 'GET'
  }) as Promise<BasicResp<any[]>>
}

/**
 * 获取房间内的消息列表
 * @param roomId 房间ID
 * @param getAll 是否获取全部消息，默认true
 */
export const getCraftsmanWechatRoomMessages = (
  roomId: number,
  getAll: boolean = true
): Promise<BasicResp<any>> => {
  if (getAll) {
    return Request({
      url: `/api/craftsman-wechat-chat/rooms/${roomId}/messages`,
      method: 'GET',
      params: { all: 'true' }
    }) as Promise<BasicResp<any>>
  }

  return Request({
    url: `/api/craftsman-wechat-chat/rooms/${roomId}/messages`,
    method: 'GET',
    params: { page: 1, pageSize: 50 }
  }) as Promise<BasicResp<any>>
}

/**
 * 获取工匠用户列表（分页）
 * @param params 查询参数 {pageIndex, pageSize, nickname?, phone?}
 */
export const getCraftsmanList = (params: {
  pageIndex: number
  pageSize: number
  nickname?: string
  phone?: string
}): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-user/page`,
    method: 'POST',
    data: params
  }) as Promise<BasicResp<any>>
}

/**
 * 创建或获取聊天房间
 * @param craftsmanUserId 工匠用户ID
 * 注意：wechat_user_id 会从token中自动获取，无需传递
 */
export const createOrGetRoom = (craftsmanUserId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-wechat-chat/rooms`,
    method: 'POST',
    data: {
      craftsman_user_id: craftsmanUserId
    }
  }) as Promise<BasicResp<any>>
}

/**
 * 标记房间消息为已读
 * @param roomId 房间ID
 */
export const markRoomAsRead = (roomId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-wechat-chat/rooms/${roomId}/read`,
    method: 'PUT'
  }) as Promise<BasicResp<any>>
}

/**
 * 删除聊天房间
 * @param roomId 房间ID
 */
export const deleteRoom = (roomId: number): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/craftsman-wechat-chat/rooms/${roomId}`,
    method: 'DELETE'
  }) as Promise<BasicResp<any>>
}

/**
 * 上传图片
 */
export const uploadImage = (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'chat')

  return Request({
    url: `/api/upload`,
    method: 'POST',
    data: formData,
    timeout: 30000
  })
    .then((res: any) => {
      if (res?.success && res?.data?.url) {
        return { url: res.data.url }
      }
      throw new Error(res?.message || '上传失败：未获取到图片URL')
    })
    .catch((error: any) => {
      if (error?.response?.data) {
        const errorData = error.response.data
        throw new Error(errorData?.message || errorData?.error || '上传失败')
      }
      throw error
    })
}
