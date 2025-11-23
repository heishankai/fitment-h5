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

    socket.value = (window as any).io(`${getWsUrl()}/craftsman-chat`, {
      auth: { token: t },
      query: { token: t },
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
      const res = await getCraftsmanUserRoom()
      if (!res?.success || !res.data) throw new Error(res?.message || '获取房间失败')

      roomId.value = res.data.id
      // 保存工匠用户头像
      if (res.data.craftsman_user?.avatar) {
        craftsmanUserAvatar.value = res.data.craftsman_user.avatar
      }
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
    craftsmanUserAvatar
  }
}
