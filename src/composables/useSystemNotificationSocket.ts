import { onMounted, onUnmounted, ref } from 'vue'
import { flutterVibrate, getToken, isFlutterWebView, showFlutterNotification } from '@/utils/index'

interface SystemNotification {
  id: number
  title: string
  content: string
  notification_type: string
  createdAt?: string
}

const loadSocketIo = async () => {
  if ((window as any).io) return

  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Socket.io 库加载失败'))
    document.head.appendChild(script)
  })
}

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  if (!baseURL) return 'http://localhost:3000'

  if (import.meta.env.MODE === 'production') {
    return baseURL
  }

  return baseURL.replace(/\/api$/, '')
}

export const useSystemNotificationSocket = () => {
  const socket = ref<any>()

  const connect = async () => {
    const token = getToken()
    if (!token || socket.value?.connected) return

    try {
      await loadSocketIo()

      const wsUrl = getWsUrl()
      const baseURL = import.meta.env.VITE_API_BASE_URL || ''
      const isHttps = window.location.protocol === 'https:'
      const isNotLocalhost =
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1')
      const needsPath = baseURL.includes('/api') || (isHttps && isNotLocalhost)

      const socketOptions: any = {
        auth: { token },
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: false
      }

      let wsFullUrl: string
      if (needsPath) {
        const baseUrl = wsUrl.replace(/\/api$/, '')
        wsFullUrl = `${baseUrl}/system-notification`
        socketOptions.path = '/api/socket.io/'
      } else {
        wsFullUrl = `${wsUrl}/system-notification`
      }

      socket.value = (window as any).io(wsFullUrl, socketOptions)

      socket.value.on('system-notification', (data: { notification?: SystemNotification }) => {
        const notification = data?.notification
        if (!notification) return

        if (isFlutterWebView()) {
          showFlutterNotification(
            notification.title || '系统通知',
            notification.content || '您有一条新的系统通知。',
            JSON.stringify({
              type: 'system-notification',
              id: notification.id,
              notification_type: notification.notification_type
            })
          )
          flutterVibrate(500)
        }

        window.dispatchEvent(
          new CustomEvent('system-notification-received', {
            detail: notification
          })
        )
      })
    } catch (error) {
      console.error('系统通知 Socket 连接失败:', error)
    }
  }

  const disconnect = () => {
    socket.value?.disconnect()
    socket.value = undefined
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return {
    connect,
    disconnect
  }
}
