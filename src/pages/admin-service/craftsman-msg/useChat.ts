import { ref, nextTick } from 'vue'
import { showToast } from 'vant'
import { getCraftsmanUserRoom, getRoomMessages, uploadImage } from './service'
import { getToken } from '@/utils/index'
import dayjs from 'dayjs'

interface ChatMessage {
  id: number | string
  content: string
  sender_type?: 'craftsman' | 'admin' | string
  senderType?: 'craftsman' | 'admin' | string
  message_type?: 'text' | 'image' | string
  messageType?: 'text' | 'image' | string
  createdAt?: string
  created_at?: string
  serviceAvatar?: string
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const inputText = ref('')
  const loading = ref(false)
  const sending = ref(false)
  const roomId = ref<number>()
  const socket = ref<any>()
  const messagesRef = ref<HTMLElement>()
  const craftsmanUserAvatar = ref<string>('')
  const serviceAvatar = ref<string>('')

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
    if (!roomId.value) return
    const res = await getRoomMessages(roomId.value, true)
    if (res?.success && res.data?.messages) {
      messages.value = res.data.messages
      scrollBottom()
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

    const wsUrl = getWsUrl()
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''

    // Socket.io 连接配置
    const socketOptions: any = {
      auth: { token: t },
      query: { token: t },
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
      wsFullUrl = `${baseUrl}/craftsman-chat`
      socketOptions.path = '/api/socket.io/'
      socket.value = (window as any).io(wsFullUrl, socketOptions)
    } else {
      wsFullUrl = `${wsUrl}/craftsman-chat`
      socket.value = (window as any).io(wsFullUrl, socketOptions)
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
      if (data.serviceAvatar) {
        serviceAvatar.value = data.serviceAvatar
      }
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
      const res = await getCraftsmanUserRoom()
      if (!res?.success || !res.data) throw new Error(res?.message || '获取房间失败')

      roomId.value = res.data.id
      // 保存工匠用户头像
      if (res.data.craftsman_user?.avatar) {
        craftsmanUserAvatar.value = res.data.craftsman_user.avatar
      }
      serviceAvatar.value = res.data.service_config?.avatar || ''
      await loadMessages()
      await connectWS()
    } catch (e: any) {
      showToast(e?.message || '初始化失败')
    } finally {
      loading.value = false
    }
  }

  const handleSend = async () => {
    const text = inputText.value.trim()
    if (!text || !roomId.value || !socket.value || sending.value) return

    sending.value = true
    try {
      socket.value.emit('send-message', {
        roomId: roomId.value,
        content: text,
        messageType: 'text'
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
    if (!roomId.value || !socket.value || sending.value) return

    sending.value = true

    try {
      const res = await uploadImage(file)
      if (res?.url) {
        socket.value.emit('send-message', {
          roomId: roomId.value,
          content: res.url,
          messageType: 'image'
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
    serviceAvatar
  }
}
