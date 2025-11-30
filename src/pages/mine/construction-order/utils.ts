import type { Router } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getCraftsmanRooms, createOrGetRoomByCraftsman } from '@/pages/chat/service'

/**
 * 工种枚举
 */
export enum WorkKind {
  // eslint-disable-next-line no-unused-vars
  DESIGNER = '设计师',
  // eslint-disable-next-line no-unused-vars
  FOREMAN = '工长'
}

/**
 * 联系用户 - 跳转到聊天房间
 * @param wechatUser 微信用户信息
 * @param router Vue Router 实例
 */
export const handleContactUser = async (
  wechatUser: { id: number; nickname?: string } | null | undefined,
  router: Router
): Promise<void> => {
  if (!wechatUser?.id) {
    showToast('用户信息不存在')
    return
  }

  try {
    showLoadingToast({
      message: '正在进入聊天...',
      forbidClick: true
    })

    // 获取工匠用户的所有聊天房间
    const roomsRes = await getCraftsmanRooms()

    if (!roomsRes?.success || !roomsRes.data) {
      closeToast()
      showToast('获取聊天房间失败')
      return
    }

    // 查找是否已有与当前微信用户的聊天房间
    const existingRoom = roomsRes.data.find((room: any) => room.wechat_user_id === wechatUser.id)

    if (existingRoom) {
      // 如果房间已存在，直接跳转
      closeToast()
      router.push({
        path: `/chat/craftsman/${existingRoom.id}`,
        query: {
          wechatUserId: wechatUser.id,
          wechatUserName: wechatUser.nickname || '用户'
        }
      })
    } else {
      // 如果房间不存在，创建新房间
      const createRes = await createOrGetRoomByCraftsman(wechatUser.id)

      if (createRes?.success && createRes.data) {
        closeToast()
        router.push({
          path: `/chat/craftsman/${createRes.data.id}`,
          query: {
            wechatUserId: wechatUser.id,
            wechatUserName: wechatUser.nickname || '用户'
          }
        })
      } else {
        closeToast()
        showToast(createRes?.message || '创建聊天房间失败')
      }
    }
  } catch (error: any) {
    closeToast()
    console.error('联系用户失败:', error)
    showToast(error?.message || '联系用户失败')
  }
}

/**
 * 根据工种获取按钮文本
 * @param workKindName 工种名称
 * @returns 按钮文本
 */
export const getButtonTextByWorkKind = (workKindName?: string): string => {
  if (workKindName === WorkKind.DESIGNER) {
    return '创建工价'
  } else if (workKindName === WorkKind.FOREMAN) {
    return '创建工价'
  } else {
    return '创建辅料单'
  }
}

/**
 * 根据工种获取跳转路径和参数
 * @param workKindName 工种名称
 * @param orderId 订单ID
 * @returns 路由跳转配置
 */
export const getRouteByWorkKind = (workKindName?: string, orderId?: number): { path: string } => {
  if (workKindName === WorkKind.DESIGNER || workKindName === WorkKind.FOREMAN) {
    // 设计师和工长都跳转到工价页面
    return {
      path: `/mine/foreman-price/${orderId || ''}`
    }
  } else {
    return {
      path: `/mine/create-material-order/${orderId || ''}`
    }
  }
}
