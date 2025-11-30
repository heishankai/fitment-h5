import { ref, onMounted, onUnmounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getToken } from '@/utils/index'
import { acceptOrder, updateOrderStatus, getCraftsmanOrders } from './service'

interface Order {
  id: number
  area: string
  city: string
  district: string
  houseType: string
  roomType: string
  location: string
  latitude: number
  longitude: number
  province: string
  work_kind_name: string
  work_kind_id: string
  order_status: number
  order_status_name: string
  wechat_user_id: number
  craftsman_user_id?: number
  wechat_user?: any
  craftsman_user?: any
  createdAt: string
  updatedAt: string
}

export function useOrder() {
  const socket = ref<any>()
  const orders = ref<Order[]>([])
  const newOrderCount = ref(0)
  // eslint-disable-next-line no-unused-vars
  const onNewOrderPopup = ref<((order: Order, distance: number) => void) | null>(null)
  // eslint-disable-next-line no-unused-vars
  const onClosePopup = ref<((orderId: number) => void) | null>(null)

  const getWsUrl = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    return import.meta.env.VITE_WS_URL || baseURL.replace(/\/api$/, '') || 'http://localhost:3000'
  }

  const connectSocket = async () => {
    const token = getToken()
    if (!token) {
      showToast('请先登录')
      return
    }

    // 等待 socket.io 库加载
    const ioFunc = (window as any).io
    if (!ioFunc) {
      // 动态加载 socket.io-client
      await new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js'
        script.onload = resolve
        document.head.appendChild(script)
      })
    }

    if (!(window as any).io) {
      showToast('WebSocket库加载失败')
      return
    }

    socket.value = (window as any).io(`${getWsUrl()}/order`, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling']
    })

    socket.value.on('connect', () => {
      console.log('✅ 订单WebSocket已连接')
    })

    socket.value.on('connect_error', (err: any) => {
      console.error('连接失败:', err)
      showToast('连接订单服务失败')
    })

    // 监听新订单弹窗（需要弹出订单详情）
    socket.value.on('new-order-popup', (data: { order: Order; distance: number }) => {
      console.log('收到新订单弹窗:', data)
      const order = data.order

      // 检查订单是否已存在
      const existingIndex = orders.value.findIndex((o) => o.id === order.id)
      if (existingIndex === -1) {
        // 只添加待接单状态的订单
        if (order.order_status === 1) {
          orders.value.unshift(order)
          newOrderCount.value++

          // 触发弹窗显示事件（通过回调函数）
          if (onNewOrderPopup.value) {
            onNewOrderPopup.value(order, data.distance)
          }
        }
      }
    })

    // 监听新订单（列表显示，不弹窗）
    socket.value.on('new-order', (data: { order: Order; distance: number }) => {
      console.log('收到新订单:', data)
      const order = data.order

      // 检查订单是否已存在
      const existingIndex = orders.value.findIndex((o) => o.id === order.id)
      if (existingIndex === -1) {
        // 只添加待接单状态的订单
        if (order.order_status === 1) {
          orders.value.unshift(order)
          newOrderCount.value++
        }
      }
    })

    // 监听订单状态更新
    socket.value.on('order-status-updated', (data: { order: Order }) => {
      console.log('订单状态更新:', data)
      const order = data.order
      const index = orders.value.findIndex((o) => o.id === order.id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...order }
      } else if (order.order_status === 2) {
        // 如果是已接单状态，也添加到列表（可能是自己接的单）
        orders.value.unshift(order)
      }
    })

    // 监听接单成功
    socket.value.on('order-accepted', async (data: { order: Order }) => {
      console.log('接单成功:', data)
      const order = data.order
      const index = orders.value.findIndex((o) => o.id === order.id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...order }
      }
      showToast('接单成功')
      // 刷新订单列表
      await loadOrders()
    })

    // 监听订单已被接单（关闭弹窗）
    socket.value.on('order-taken', (data: { orderId: number; message: string }) => {
      console.log('订单已被接单:', data)
      const index = orders.value.findIndex((o) => o.id === data.orderId)
      if (index !== -1) {
        orders.value[index].order_status = 2
        orders.value[index].order_status_name = '已接单'
      }

      showToast('该订单已被其他工匠接单')

      // 触发关闭弹窗事件（通过回调通知组件）
      if (onClosePopup.value) {
        onClosePopup.value(data.orderId)
      }
    })

    // 监听错误
    socket.value.on('error', (data: { message: string }) => {
      showToast(data.message || '发生错误')
    })
  }

  // 接单
  const handleAcceptOrder = async (order: Order) => {
    if (order.order_status !== 1) {
      showToast('订单状态不正确，无法接单')
      return
    }

    try {
      await showConfirmDialog({
        title: '确认接单',
        message: `确定要接这个${order.work_kind_name}订单吗？`
      })

      // 通过Socket发送接单请求（Socket会自动更新状态并通知）
      if (socket.value) {
        socket.value.emit('accept-order', { orderId: order.id })
        // Socket 接单成功会在 order-accepted 事件中处理刷新
      } else {
        // 如果Socket未连接，使用HTTP接口
        const res = await acceptOrder(order.id)
        if (res?.success) {
          showToast('接单成功')

          // 更新本地订单状态
          const index = orders.value.findIndex((o) => o.id === order.id)
          if (index !== -1) {
            orders.value[index].order_status = 2
            orders.value[index].order_status_name = '已接单'
            orders.value[index].craftsman_user_id = res.data?.craftsman_user_id
          }
          // 刷新订单列表
          await loadOrders()
        } else {
          showToast(res?.message || '接单失败')
        }
      }
    } catch (error: any) {
      if (error === 'cancel') {
        return // 用户取消
      }
      console.error('接单失败:', error)
      showToast('接单失败')
    }
  }

  // 更新订单状态
  const handleUpdateOrderStatus = async (orderId: number, status: number) => {
    try {
      const res = await updateOrderStatus(orderId, status)
      if (res?.success) {
        // 通过Socket发送状态更新
        if (socket.value) {
          socket.value.emit('update-order-status', { orderId, order_status: status })
        }
        showToast('状态更新成功')
      } else {
        showToast(res?.message || '更新失败')
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      showToast('更新失败')
    }
  }

  // 断开连接
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  // 清除新订单计数
  const clearNewOrderCount = () => {
    newOrderCount.value = 0
  }

  // 加载订单列表
  const loadOrders = async () => {
    try {
      const res = await getCraftsmanOrders()
      console.log('订单列表接口返回:', res)
      if (res?.success && res.data) {
        // 确保 res.data 是数组
        const orderList = Array.isArray(res.data) ? res.data : []
        console.log('原始订单数据:', orderList)
        orders.value = orderList.filter((order: Order) => order.order_status !== 4) // 过滤已取消的订单
        console.log('过滤后的订单列表:', orders.value)
        console.log('订单列表长度:', orders.value.length)
      } else {
        console.warn('订单列表接口返回数据格式不正确:', res)
        orders.value = []
      }
    } catch (error) {
      console.error('加载订单列表失败:', error)
      orders.value = []
    }
  }

  onMounted(async () => {
    await loadOrders()
    connectSocket()
  })

  onUnmounted(() => {
    disconnect()
  })

  // 设置新订单弹窗回调
  // eslint-disable-next-line no-unused-vars
  const setOnNewOrderPopup = (callback: (order: Order, distance: number) => void) => {
    onNewOrderPopup.value = callback
  }

  // 设置关闭弹窗回调
  // eslint-disable-next-line no-unused-vars
  const setOnClosePopup = (callback: (orderId: number) => void) => {
    onClosePopup.value = callback
  }

  return {
    orders,
    newOrderCount,
    handleAcceptOrder,
    handleUpdateOrderStatus,
    clearNewOrderCount,
    disconnect,
    connectSocket,
    loadOrders,
    setOnNewOrderPopup,
    setOnClosePopup
  }
}
