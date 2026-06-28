import { ref, nextTick } from 'vue'
import { showToast } from 'vant'
import { io } from 'socket.io-client'
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
    // 优先使用 VITE_WS_URL
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL
    }

    // 从 VITE_API_BASE_URL 推导
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    if (baseURL) {
      // 生产环境：保留 /api 后缀
      // 开发环境：去掉 /api 后缀（因为使用代理，需要直连服务器）
      const isProduction = import.meta.env.MODE === 'production'
      if (isProduction) {
        // 生产环境直接使用 baseURL（包含 /api）
        return baseURL
      } else {
        // 开发环境去掉 /api 后缀
        return baseURL.replace(/\/api$/, '')
      }
    }

    // 开发环境默认值
    return 'http://localhost:3000'
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

    const wsUrl = getWsUrl()
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''

    // Socket.io 连接配置
    const socketOptions: any = {
      auth: { token: t },
      query: {
        token: t,
        craftsmanUserId: craftsmanUserId // 传递工匠用户ID
      },
      transports: ['polling'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    }

    // 判断是否需要配置 path
    const isHttps = window.location.protocol === 'https:'
    const isNotLocalhost =
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    const needsPath = baseURL.includes('/api') || (isHttps && isNotLocalhost)

    let wsFullUrl: string
    if (needsPath) {
      const baseUrl = wsUrl.replace(/\/api$/, '')
      wsFullUrl = `${baseUrl}/craftsman-wechat-chat`
      socketOptions.path = '/api/socket.io/'
      socket.value = io(wsFullUrl, socketOptions)
    } else {
      wsFullUrl = `${wsUrl}/craftsman-wechat-chat`
      socket.value = io(wsFullUrl, socketOptions)
    }

    console.log('🔗 WebSocket 连接信息:', {
      url: wsFullUrl,
      path: socketOptions.path,
      needsPath,
      baseURL,
      wsUrl
    })

    socket.value.on('connect', () => {
      console.log('✅ WebSocket已连接', {
        id: socket.value?.id,
        transport: socket.value?.io?.engine?.transport?.name
      })
    })

    socket.value.on('connect_error', (err: any) => {
      console.error('❌ WebSocket连接失败:', {
        message: err?.message,
        type: err?.type,
        description: err?.description,
        url: wsFullUrl,
        error: err
      })

      let errorMsg = '连接失败'
      const errorMessage = err?.message || err?.toString() || ''

      if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
        errorMsg = '连接超时，请检查网络或服务器状态'
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMsg = '认证失败，请重新登录'
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMsg = '聊天服务未找到，请检查服务器配置'
      } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('拒绝连接')) {
        errorMsg = '无法连接到服务器，请确认服务器是否运行'
      } else if (
        errorMessage.includes('xhr poll error') ||
        errorMessage.includes('polling error')
      ) {
        errorMsg = '网络连接异常，请检查网络设置'
      }

      showToast(errorMsg)
    })

    socket.value.on('disconnect', (reason: string) => {
      console.warn('⚠️ WebSocket断开连接:', reason)
      if (reason === 'io server disconnect') {
        showToast('连接已断开，请重新登录')
      }
    })

    socket.value.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 WebSocket重连成功 (第${attemptNumber}次尝试)`)
    })

    socket.value.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 WebSocket重连尝试 (第${attemptNumber}次)`)
    })

    socket.value.on('reconnect_error', (error: any) => {
      console.error('❌ WebSocket重连失败:', error)
    })

    socket.value.on('reconnect_failed', () => {
      console.error('❌ WebSocket重连失败，已达到最大重试次数')
      showToast('连接失败，请刷新页面重试')
    })
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
