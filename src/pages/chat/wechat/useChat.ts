import { ref, nextTick } from 'vue'
import { showToast } from 'vant'
import { getCraftsmanWechatRoomMessages, uploadImage, markRoomAsRead } from '../service'
import { getToken } from '@/utils/index'
import Request from '@/utils/request'
import dayjs from 'dayjs'

interface ChatMessage {
  id: number | string
  content: string
  sender_type?: 'craftsman' | 'wechat' | string
  senderType?: 'craftsman' | 'wechat' | string
  message_type?: 'text' | 'image' | string
  messageType?: 'text' | 'image' | string
  createdAt?: string
  created_at?: string
}

export function useChat(roomId: number, craftsmanUserId: number) {
  const messages = ref<ChatMessage[]>([])
  const inputText = ref('')
  const loading = ref(false)
  const sending = ref(false)
  const socket = ref<any>()
  const messagesRef = ref<HTMLElement>()
  const craftsmanUserAvatar = ref<string>('')
  const wechatUserAvatar = ref<string>('')

  const getWsUrl = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    return import.meta.env.VITE_WS_URL || baseURL.replace(/\/api$/, '') || 'http://localhost:3000'
  }

  const formatTime = (time?: string) => {
    if (!time) return ''
    const m = dayjs(time)
    const days = dayjs().diff(m, 'day')
    if (days === 0) return m.format('HH:mm')
    if (days === 1) return '昨天 ' + m.format('HH:mm')
    return m.format('MM-DD HH:mm')
  }

  const scrollBottom = () =>
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })

  const loadMessages = async () => {
    if (!roomId) return
    const res = await getCraftsmanWechatRoomMessages(roomId, true)
    if (res?.success && res.data?.messages) {
      messages.value = res.data.messages
      scrollBottom()
    }
    // 获取房间信息以获取用户头像
    try {
      const roomRes: any = await Request({
        url: `/api/craftsman-wechat-chat/rooms/${roomId}`,
        method: 'GET'
      })
      console.log('房间信息:', roomRes)
      if (roomRes?.success && roomRes.data) {
        // 获取微信用户头像（自己）
        if (roomRes.data.wechat_user?.avatar) {
          wechatUserAvatar.value = roomRes.data.wechat_user.avatar
          console.log('设置微信用户头像:', wechatUserAvatar.value)
        }
        // 获取工匠用户头像（对方）
        if (roomRes.data.craftsman_user?.avatar) {
          craftsmanUserAvatar.value = roomRes.data.craftsman_user.avatar
          console.log('设置工匠用户头像:', craftsmanUserAvatar.value)
        }
      }
    } catch (e) {
      console.error('获取房间信息失败', e)
    }
  }

  const connectWS = async () => {
    const t = getToken()
    if (!t) return showToast('缺少token')

    const ioFunc = (window as any).io
    if (!ioFunc) {
      await new Promise((r) => setTimeout(r, 500))
      if (!(window as any).io) return showToast('WebSocket库未加载')
    }

    socket.value = (window as any).io(`${getWsUrl()}/craftsman-wechat-chat`, {
      auth: { token: t },
      query: {
        token: t,
        craftsmanUserId: craftsmanUserId // 传递工匠用户ID
      },
      transports: ['websocket', 'polling']
    })

    socket.value.on('connect', () => console.log('✅ WebSocket已连接'))
    socket.value.on('connect_error', () => showToast('连接失败'))
    socket.value.on('new-message', (data: ChatMessage) => {
      const msg: ChatMessage = {
        ...data,
        sender_type: data.sender_type || data.senderType,
        message_type: data.message_type || data.messageType || 'text',
        createdAt: data.createdAt || data.created_at
      }
      messages.value.push(msg)
      scrollBottom()
    })
  }

  const init = async () => {
    loading.value = true
    try {
      // 先连接 WebSocket，这样会自动创建房间
      await connectWS()
      // 等待一下让房间创建完成
      await new Promise((r) => setTimeout(r, 500))
      await loadMessages()
      // 标记房间消息为已读
      if (roomId) {
        try {
          await markRoomAsRead(roomId)
          console.log('已标记房间消息为已读')
        } catch (e) {
          console.error('标记已读失败', e)
        }
      }
    } catch (e: any) {
      showToast(e?.message || '初始化失败')
    } finally {
      loading.value = false
    }
  }

  const handleSend = async () => {
    const text = inputText.value.trim()
    if (!text || !roomId || !socket.value || sending.value) return

    sending.value = true
    try {
      socket.value.emit('send-message', {
        roomId: roomId,
        content: text,
        message_type: 'text'
      })
      inputText.value = ''
      scrollBottom()
    } catch {
      showToast('发送失败')
    } finally {
      sending.value = false
    }
  }

  const handleSendImage = async (file: File) => {
    if (!roomId || !socket.value || sending.value) return

    sending.value = true

    try {
      const res = await uploadImage(file)
      if (res?.url) {
        socket.value.emit('send-message', {
          roomId: roomId,
          content: res.url,
          message_type: 'image'
        })

        scrollBottom()
      } else {
        showToast('上传失败：未获取到图片URL')
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '上传失败'
      showToast(errorMsg)
    } finally {
      sending.value = false
    }
  }

  const disconnect = () => socket.value?.disconnect()

  return {
    messages,
    inputText,
    loading,
    sending,
    messagesRef,
    formatTime,
    handleSend,
    handleSendImage,
    init,
    disconnect,
    craftsmanUserAvatar,
    wechatUserAvatar
  }
}
