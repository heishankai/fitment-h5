<template>
  <div class="page-container">
    <!-- 订单详情弹窗 -->
    <OrderPopup
      :show="showOrderPopup"
      :order="currentOrder"
      :distance="currentOrderDistance"
      :on-grab-order="handleAcceptOrder"
      @update:show="showOrderPopup = $event"
      @close="handleClosePopup"
    />

    <!-- 顶部标题栏 -->
    <div class="header fade-in-up">
      <div class="header-content">
        <div class="header-top">
          <div class="title-wrapper">
            <div class="icon-circle">
              <van-icon name="orders-o" class="title-icon" />
            </div>
            <div class="title-group">
              <div class="title">抢单中心</div>
              <div class="subtitle">实时接收订单</div>
            </div>
          </div>
          <van-badge
            v-if="newOrderCount > 0"
            :content="newOrderCount"
            class="badge fade-in-up"
            :style="{ animationDelay: '0.1s' }"
          >
            <div class="new-order-badge bounce" @click="clearNewOrderCount">
              <van-icon name="bell" />
              <span>新订单</span>
            </div>
          </van-badge>
        </div>
      </div>

      <!-- 当前位置信息 -->
      <div
        class="location-wrapper fade-in-up"
        v-if="location?.address"
        :style="{ animationDelay: '0.2s' }"
        @click.stop="loadCurrentLocation"
      >
        <div class="location-card shine-effect">
          <div class="location-icon-wrapper">
            <van-icon name="location-o" class="location-icon" />
            <div class="location-pulse"></div>
          </div>
          <div class="location-content">
            <div class="location-text">
              {{ location?.address }}
            </div>
            <div class="location-detail" v-if="location?.formattedAddress">
              {{ location?.formattedAddress }}
            </div>
          </div>
          <div class="location-status">
            <van-icon name="success" class="success-icon" />
          </div>
        </div>
      </div>
      <div
        class="location-loading fade-in-up"
        v-else-if="!location?.address && currentLocation"
        :style="{ animationDelay: '0.2s' }"
      >
        <div class="location-card">
          <van-loading size="16px" color="#00cec9" />
          <span class="loading-text">定位中...</span>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 调试信息（开发环境） -->
        <div
          v-if="orders.length > 0"
          style="
            padding: 8px;
            font-size: 12px;
            color: #999;
            background: #f5f5f5;
            margin-bottom: 8px;
            border-radius: 4px;
          "
        >
          订单数量: {{ orders.length }}
        </div>

        <van-empty
          v-if="orders.length === 0"
          description="暂无订单，等待新订单..."
          class="empty-state fade-in-up"
        />

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
                <span class="info-text">{{
                  order.location || `${order.province} ${order.city} ${order.district}`
                }}</span>
              </div>
              <div class="info-row">
                <van-icon name="home-o" class="info-icon" />
                <span class="info-text"
                  >{{ order.houseType === 'new' ? '新房' : '老房' }} · {{ order.roomType }} ·
                  {{ order.area }}m²</span
                >
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrder } from './useOrder'
import OrderPopup from './components/OrderPopup.vue'
import { getCurrentPosition, isWebView, formatTime } from '@/utils/index'
import { getReverseGeocode, updateCraftsmanUser } from './service'

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

// 获取订单状态类型
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning' // 待接单
    case 2:
      return 'primary' // 已接单
    case 3:
      return 'success' // 已完成
    case 4:
      return 'danger' // 已取消
    default:
      return 'default'
  }
}

// 接单处理
const handleAcceptOrder = async (orderId: number) => {
  const order = orders.value.find((o) => o.id === orderId)
  if (!order) return

  acceptingOrderId.value = orderId
  try {
    await acceptOrder(order)
    // 接单成功后关闭弹窗
    showOrderPopup.value = false
    currentOrder.value = null
    // 跳转到我的工地订单页面
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

// 获取用户当前位置
const loadCurrentLocation = async () => {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: isWebView() ? 30000 : 15000,
      maximumAge: isWebView() ? 60000 : 0
    })

    const res = await getReverseGeocode({
      latitude: position.latitude,
      longitude: position.longitude
    })

    if (!res?.success || !res.data) {
      // 如果逆地理编码失败，至少保存坐标信息
      location.value = {
        latitude: position.latitude,
        longitude: position.longitude,
        address: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
      }
      return
    }

    // 保存位置数据
    location.value = res.data
    currentLocation.value = position

    // 更新用户位置信息
    try {
      await updateCraftsmanUser({
        latitude: position.latitude,
        longitude: position.longitude,
        province: res.data.province,
        city: res.data.city,
        district: res.data.district,
        address: res.data.formatted_address || res.data.address
      })
    } catch (error) {
      console.error('更新用户位置信息失败:', error)
    }
  } catch (err: any) {
    console.error('获取位置失败:', err)
    // 即使失败也尝试保存坐标
    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 5000
      })
      location.value = {
        latitude: position.latitude,
        longitude: position.longitude,
        address: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
      }
    } catch (e) {
      // 完全失败时不显示位置信息
      location.value = {}
    }
  }
}

// 设置新订单弹窗回调
onMounted(() => {
  // 加载当前位置
  loadCurrentLocation()

  setOnNewOrderPopup((order: any, distance: number) => {
    currentOrder.value = order
    currentOrderDistance.value = distance
    showOrderPopup.value = true
  })

  // 设置关闭弹窗回调（当订单被其他工匠接单时）
  setOnClosePopup((orderId: number) => {
    if (currentOrder.value && currentOrder.value.id === orderId) {
      showOrderPopup.value = false
      currentOrder.value = null
    }
  })
})

// 监听路由变化，当从详情页返回时刷新列表
onActivated(() => {
  if (route.query.refresh === '1') {
    loadOrders()
    // 清除 refresh 参数
    router.replace({ path: '/home', query: {} })
  }
})

// 监听路由 query 参数变化
watch(
  () => route.query.refresh,
  (refresh) => {
    if (refresh === '1') {
      loadOrders()
      // 清除 refresh 参数
      router.replace({ path: '/home', query: {} })
    }
  }
)

// 跳转到订单详情
const goToOrderDetail = (orderId: number) => {
  router.push(`/home/order/${orderId}`)
}

// 下拉刷新
const onRefresh = async () => {
  await Promise.all([loadOrders(), loadCurrentLocation()])
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

.header {
  background: #00cec9;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px 16px;
  color: #fff;

  .header-content {
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .title-wrapper {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 1;

        .icon-circle {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
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
          }

          .title-icon {
            font-size: 28px;
            color: #fff;
            transition: transform 0.3s ease;
            position: relative;
            z-index: 1;
          }
        }

        .title-wrapper:hover .icon-circle {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);

          .title-icon {
            transform: rotate(5deg);
          }
        }

        .title-group {
          flex: 1;
          min-width: 0;

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: -0.3px;
            line-height: 1.2;
          }

          .subtitle {
            font-size: 12px;
            opacity: 0.9;
            font-weight: 400;
            line-height: 1.4;
          }
        }
      }

      .badge {
        flex-shrink: 0;

        .new-order-badge {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;

          &:active {
            transform: scale(0.95);
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }
    }
  }

  .location-wrapper {
    position: relative;
    z-index: 1;
    margin-top: 12px;

    .location-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: scale(0.98);
      }

      .location-icon-wrapper {
        position: relative;
        flex-shrink: 0;

        .location-icon {
          color: #00cec9;
          font-size: 22px;
          position: relative;
          z-index: 1;
        }

        .location-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          background: rgba(0, 206, 201, 0.2);
          border-radius: 50%;
          animation: pulse-ring 2s ease-in-out infinite;
        }
      }

      .location-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .location-text {
          font-weight: 600;
          color: #323233;
          font-size: 15px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .location-detail {
          color: #969799;
          font-size: 12px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      }

      .location-status {
        flex-shrink: 0;

        .success-icon {
          color: #07c160;
          font-size: 18px;
        }
      }
    }
  }

  .location-loading {
    position: relative;
    z-index: 1;
    margin-top: 12px;

    .location-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      .loading-text {
        font-size: 14px;
        color: #969799;
      }
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.4);
      opacity: 0;
    }
  }
}

.content {
  padding: 8px;
  max-width: 100%;
}

.empty-state {
  padding: 60px 20px;
  animation: fadeInUp 0.5s ease-out both;
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
