<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
    <header class="fade-in-up">
      <header-content
        :new-order-count="newOrderCount"
        :location="location"
        :current-location="currentLocation"
        @clear-new-order-count="clearNewOrderCount"
        @open-map-picker="handleOpenMapPicker"
      />
    </header>

    <!-- 订单列表 -->
    <main class="fade-in-up">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="refresh">
        <van-empty v-if="orders.length === 0" description="暂无订单，等待新订单..." />

        <div v-else class="order-list">
          <div
            v-for="(order, index) in orders"
            :key="`order-${order.id}-${index}`"
            class="order-card fade-in-up shine-effect"
            :class="{ 'new-order': order.order_status === 1 }"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="goToOrderDetail(order.id)"
          >
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-title-section">
                <div class="work-kind-icon">
                  <van-icon name="bag-o" />
                </div>
                <div class="order-title-info">
                  <div class="order-title-row">
                    <span class="order-title">{{ order.work_kind_name }}</span>
                    <van-tag :type="getStatusType(order.order_status)" round class="status-tag">
                      {{ order.order_status_name }}
                    </van-tag>
                  </div>
                  <div class="order-time" v-if="order.createdAt">
                    {{ formatTime(order.createdAt) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单信息 -->
            <div class="order-info">
              <div class="info-row">
                <van-icon name="location-o" class="info-icon" />
                <span class="info-text">
                  {{ order.location || `${order.province} ${order.city} ${order.district}` }}
                </span>
              </div>
              <div class="info-row">
                <van-icon name="home-o" class="info-icon" />
                <span class="info-text">
                  {{ order.houseType === 'new' ? '新房' : '老房' }} · {{ order.roomType }} ·
                  {{ order.area }}m²
                </span>
              </div>
              <div class="info-row" v-if="order.wechat_user">
                <van-icon name="user-o" class="info-icon" />
                <span class="info-text">{{ order.wechat_user.nickname || '用户' }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="order-actions">
              <van-button
                v-if="order.order_status === 1"
                type="primary"
                size="normal"
                round
                block
                @click.stop="handleAcceptOrder(order.id)"
                :loading="acceptingOrderId === order.id"
                class="action-btn primary-btn"
              >
                <span>立即接单</span>
              </van-button>
              <div v-else class="action-group">
                <van-button
                  v-if="order.order_status === 2 && order.craftsman_user_id"
                  type="success"
                  size="small"
                  round
                  @click.stop="handleUpdateOrderStatus(order.id, 3)"
                  class="action-btn"
                >
                  <van-icon name="checked" />
                  完成
                </van-button>
                <van-button
                  v-if="order.order_status === 2"
                  type="warning"
                  size="small"
                  round
                  @click.stop="handleUpdateOrderStatus(order.id, 4)"
                  class="action-btn"
                >
                  <van-icon name="cross" />
                  取消
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </main>

    <!-- 订单详情弹窗 -->
    <order-popup
      :show="showOrderPopup"
      :order="currentOrder"
      :distance="currentOrderDistance"
      :on-grab-order="handleAcceptOrder"
      @update:show="showOrderPopup = $event"
      @close="handleClosePopup"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrder } from './useOrder'
import OrderPopup from './components/OrderPopup.vue'
import HeaderContent from './components/HeaderContent.vue'
import { getCurrentPosition, isWebView, formatTime } from '@/utils/index'
import { getStatusType, loadLocationFromLocal } from './utils'

const router = useRouter()
const route = useRoute()

const {
  orders,
  newOrderCount,
  handleAcceptOrder: acceptOrder,
  handleUpdateOrderStatus,
  clearNewOrderCount,
  loadOrders,
  setOnNewOrderPopup,
  setOnClosePopup
} = useOrder()
const refreshing = ref(false)
const acceptingOrderId = ref<number | null>(null)
const showOrderPopup = ref(false)
const currentOrder = ref<any>(null)
const currentOrderDistance = ref(0)
const currentLocation = ref<any>(null)

const location = ref<any>({})

// 接单处理
const handleAcceptOrder = async (orderId: number) => {
  const order = orders.value.find((o) => o.id === orderId)
  if (!order) return

  acceptingOrderId.value = orderId
  try {
    await acceptOrder(order)
    showOrderPopup.value = false
    currentOrder.value = null
    router.push('/mine/my-construction')
  } catch (error) {
    console.error('接单失败:', error)
  } finally {
    acceptingOrderId.value = null
  }
}

// 关闭弹窗
const handleClosePopup = () => {
  showOrderPopup.value = false
  currentOrder.value = null
}

// 从本地存储加载位置信息
const loadLocationFromStorage = () => {
  const saved = loadLocationFromLocal()
  if (saved && saved.location && saved.currentLocation) {
    location.value = saved.location
    currentLocation.value = saved.currentLocation
  }
}

// 获取用户当前位置（用于打开地图选择器时）
const getCurrentPositionForMap = async () => {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: isWebView() ? 30000 : 15000,
      maximumAge: isWebView() ? 60000 : 0
    })
    return position
  } catch (error) {
    console.error('获取位置失败:', error)
    return null
  }
}

// 打开地图选择器 - 跳转到新页面
const handleOpenMapPicker = async () => {
  // 优先使用本地存储的位置，如果没有才实时获取
  const saved = loadLocationFromLocal()
  let initialLocation = null

  if (saved?.currentLocation) {
    // 使用本地存储的位置
    initialLocation = saved.currentLocation
  } else {
    // 没有本地存储的位置，实时获取
    const position = await getCurrentPositionForMap()
    if (position) {
      initialLocation = position
    }
  }

  // 跳转到地图选择页面，传递初始位置
  const query: any = {}
  if (initialLocation) {
    query.latitude = initialLocation.latitude.toString()
    query.longitude = initialLocation.longitude.toString()
  }
  router.push({
    path: '/home/map-picker',
    query
  })
}

// 设置新订单弹窗回调
onMounted(() => {
  // 进入页面时从本地存储加载位置信息，不自动获取位置
  loadLocationFromStorage()

  setOnNewOrderPopup((order: any, distance: number) => {
    currentOrder.value = order
    currentOrderDistance.value = distance
    showOrderPopup.value = true
  })

  setOnClosePopup((orderId: number) => {
    if (currentOrder.value?.id === orderId) {
      showOrderPopup.value = false
      currentOrder.value = null
    }
  })
})

// 页面激活时重新加载位置信息（如果使用了 keep-alive）
onActivated(() => {
  loadLocationFromStorage()
})

// 监听路由变化，当从详情页返回时刷新列表
watch(
  () => route.query.refresh,
  (refresh) => {
    if (refresh === '1') {
      loadOrders()
      router.replace({ path: '/home', query: {} })
    }
  }
)

// 监听路由变化，当从地图选择页返回时重新加载位置信息
let previousPath = route.path
watch(
  () => route.path,
  (newPath) => {
    // 如果从地图选择页返回首页，重新加载位置信息
    if (previousPath === '/home/map-picker' && newPath === '/home') {
      loadLocationFromStorage()
    }
    previousPath = newPath
  },
  { immediate: true }
)

const goToOrderDetail = (orderId: number) => {
  router.push(`/home/order/${orderId}`)
}

const onRefresh = async () => {
  await loadOrders()
  refreshing.value = false
}
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

.refresh {
  height: 100%;
}

header {
  background: #00cec9;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px 16px;
  color: #fff;
}

main {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  opacity: 1;
  animation: fadeInUp 0.4s ease-out forwards;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #00cec9;
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.new-order {
    border-color: #ff9800;
    box-shadow: 0 2px 12px rgba(255, 152, 0, 0.2);
    animation: pulse 2s infinite;
  }

  .order-header {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f5f5f5;

    .order-title-section {
      display: flex;
      align-items: center;
      gap: 8px;

      .work-kind-icon {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 206, 201, 0.25);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          animation: shine 3s infinite;
          z-index: 0;
        }

        .van-icon {
          color: #fff;
          font-size: 14px;
          transition: transform 0.3s ease;
          position: relative;
          z-index: 1;
        }
      }

      .order-title-info {
        flex: 1;
        min-width: 0;

        .order-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 3px;

          .order-title {
            font-size: 14px;
            font-weight: 600;
            color: #323233;
            line-height: 1.3;
            flex: 1;
            min-width: 0;
          }

          .status-tag {
            flex-shrink: 0;
            font-weight: 500;
            padding: 1px 6px;
            font-size: 10px;
          }
        }

        .order-time {
          font-size: 10px;
          color: #969799;
        }
      }
    }

    &:hover .work-kind-icon {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 206, 201, 0.35);

      .van-icon {
        transform: rotate(5deg);
      }
    }
  }

  .order-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;

    .info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #646566;
      line-height: 1.4;
      transition:
        transform 0.2s ease,
        color 0.2s ease;

      &:hover {
        transform: translateX(2px);
        color: #323233;
      }

      .info-icon {
        color: #00cec9;
        font-size: 14px;
        flex-shrink: 0;
        transition:
          transform 0.3s ease,
          color 0.3s ease;
      }

      &:hover .info-icon {
        transform: scale(1.2) rotate(5deg);
        color: #00b4d8;
      }

      .info-text {
        flex: 1;
        min-width: 0;
        word-break: break-all;
        transition: color 0.2s ease;
      }
    }
  }

  .order-actions {
    padding-top: 8px;
    border-top: 1px solid #f5f5f5;

    .primary-btn {
      height: 32px;
      font-size: 13px;
      font-weight: 600;
      background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
      border: none;
      box-shadow: 0 2px 6px rgba(0, 206, 201, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .van-icon {
        font-size: 13px;
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 206, 201, 0.35);
      }

      &:active {
        transform: scale(0.96);
        box-shadow: 0 1px 4px rgba(0, 206, 201, 0.3);
      }

      &:active .van-icon {
        transform: scale(1.1);
      }
    }

    .action-group {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .action-btn {
      font-weight: 500;
      padding: 0 10px;
      height: 26px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .van-icon {
        font-size: 11px;
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 20px rgba(0, 206, 201, 0.25);
  }
  50% {
    box-shadow: 0 6px 28px rgba(0, 206, 201, 0.4);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shine {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
