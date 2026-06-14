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
