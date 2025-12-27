<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="order">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 订单头部（包含用户信息） -->
        <detail-header :order="order" :user="order?.wechat_user" class="fade-in-up" />

        <!-- 订单信息 -->
        <order-info :order="order" class="fade-in-up" :style="{ animationDelay: '0.2s' }" />

        <!-- 快捷入口卡片 -->
        <div class="quick-access-cards fade-in-up" :style="{ animationDelay: '0.35s' }">
          <!-- 辅材清单入口 -->
          <div
            v-if="user?.skillInfo?.workKindName !== '工长'"
            class="access-card"
            @click="goToMaterialList"
          >
            <div class="card-icon-wrapper material-icon">
              <van-icon name="shopping-cart-o" />
            </div>
            <div class="card-content">
              <div class="card-title">辅材清单</div>
              <div class="card-desc">查看辅材信息</div>
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>

          <!-- 施工进度入口 -->
          <div class="access-card" @click="goToConstructionProgressView">
            <div class="card-icon-wrapper progress-icon">
              <van-icon name="orders-o" />
            </div>
            <div class="card-content">
              <div class="card-title">施工进度</div>
              <div class="card-desc">查看施工记录</div>
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>
        </div>

        <!-- 工价清单 -->
        <price-list
          :parent-work-price-groups="filteredParentWorkPriceGroups"
          :order-info="order"
          class="fade-in-up"
          :style="{ animationDelay: '0.3s' }"
        />

        <!-- 子工价清单 -->
        <sub-price-list
          v-if="filteredSubWorkPriceGroups?.length"
          :sub-work-prices="filteredSubWorkPriceGroups"
          :show-summary="!isAssignedOrder"
          class="fade-in-up"
          :style="{ animationDelay: '0.4s' }"
        />
      </van-pull-refresh>
    </main>

    <footer v-if="order?.order_status === 2">
      <van-button
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="handleCreateForemanPrice"
        icon="plus"
      >
        创建工价
      </van-button>
    </footer>
    <van-floating-bubble
      v-if="order?.order_status === 2"
      icon="chat"
      :offset="chatBubbleOffset"
      @click="onContactUser"
      class="chat-bubble"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// components
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import DetailHeader from './components/detail-header.vue'
import OrderInfo from './components/order-info.vue'
import PriceList from './components/price-list.vue'
import SubPriceList from './components/sub-price-list.vue'
// utils
import { getOrderDetail, getUserInfoService, getSubWorkPricesByOrderId } from './service'
import { handleContactUser, calculateChatBubbleOffset } from './utils'

const route = useRoute()
const router = useRouter()

const order = ref<any>(null)
const user = ref<any>(null)
const refreshing = ref(false)
const sub_work_price_groups = ref<any>([])
const windowSize = ref({ width: window.innerWidth, height: window.innerHeight })

// 监听窗口大小变化
const handleResize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// 计算浮动气泡位置（右下角）
// chat 气泡位置（下方）
const chatBubbleOffset = computed(() => {
  return calculateChatBubbleOffset(windowSize.value, order.value?.order_status)
})

// 判断是否是分配的订单
const isAssignedOrder = computed(() => {
  return order.value?.is_assigned_order === true
})

// 获取当前用户手机号
const currentUserPhone = computed(() => {
  return user.value?.phone
})

// 过滤父工价数据：如果是分配的订单，只显示分配给当前用户的工价
const filteredParentWorkPriceGroups = computed(() => {
  if (!order.value?.parent_work_price_groups) return []

  // 如果不是分配的订单，返回全部父工价
  if (!isAssignedOrder.value) {
    return order.value.parent_work_price_groups
  }

  // 如果是分配的订单，需要用户手机号才能过滤
  if (!currentUserPhone.value) {
    return order.value.parent_work_price_groups
  }

  // 如果是分配的订单，只返回分配给当前用户的工价（通过手机号匹配）
  return order.value.parent_work_price_groups.filter((price: any) => {
    return price.assigned_craftsman?.phone === currentUserPhone.value
  })
})

// 过滤子工价数据：如果是分配的订单，只显示分配给当前用户的工价组
const filteredSubWorkPriceGroups = computed(() => {
  if (!sub_work_price_groups.value?.length) return []

  // 如果不是分配的订单，返回全部子工价组
  if (!isAssignedOrder.value) {
    return sub_work_price_groups.value
  }

  // 如果是分配的订单，需要用户手机号才能过滤
  if (!currentUserPhone.value) {
    return sub_work_price_groups.value
  }

  // 如果是分配的订单，只返回分配给当前用户的工价组
  // 检查子工价组中的每个子工价是否分配给当前用户
  return sub_work_price_groups.value.filter((group: any) => {
    if (!group.sub_work_price_groups?.length) return false
    // 如果组内任何一个子工价分配给当前用户，则显示该组
    return group.sub_work_price_groups.some((price: any) => {
      return price.assigned_craftsman?.phone === currentUserPhone.value
    })
  })
})

// 加载订单详情
const loadOrderDetail = async () => {
  const orderId = Number(route?.params?.id)
  const { success, data } = await getOrderDetail(orderId)
  if (!success) return
  order.value = data

  const { success: userSuccess, data: userData } = await getUserInfoService()
  if (!userSuccess) return
  user.value = userData

  const { success: subWorkPricesSuccess, data: subWorkPricesData } =
    await getSubWorkPricesByOrderId(orderId)
  if (!subWorkPricesSuccess) return
  sub_work_price_groups.value = subWorkPricesData
}

// 联系用户
const onContactUser = async () => {
  await handleContactUser(order.value?.wechat_user, router)
}

// 跳转到辅材清单页面
const goToMaterialList = () => {
  router.push({
    path: `/mine/construction-order/${order.value?.id}/material-list`
  })
}

// 跳转到施工进度查看页面
const goToConstructionProgressView = () => {
  router.push({
    path: `/mine/construction-order/${order.value?.id}/construction-progress`
  })
}

// 创建工价
const handleCreateForemanPrice = () => {
  const orderId = order.value?.id
  const { area, work_kind_name } = order.value ?? {}

  router.push({
    path: `/mine/foreman-price/${orderId}`,
    query: {
      area,
      craftsman_user_work_kind_name: work_kind_name
    }
  })
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadOrderDetail()
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadOrderDetail()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%);
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px;
  gap: 12px;
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.5s ease-out both;
  animation-delay: 0.5s;

  display: flex;
  gap: 10px;

  .action-btn {
    flex: 1;
    height: 44px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:active {
      transform: scale(0.96);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }

    .van-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    &:active .van-icon {
      transform: scale(1.1);
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 浮动气泡层级控制
:deep(.chat-bubble) {
  z-index: 1000;
}

// 快捷入口卡片样式
.quick-access-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.access-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .card-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;

    .van-icon {
      font-size: 24px;
      color: #fff;
    }

    &.material-icon {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    }

    &.progress-icon {
      background: linear-gradient(135deg, #ff9800 0%, #ff6b35 100%);
    }
  }

  &:active .card-icon-wrapper {
    transform: scale(0.95);
  }

  .card-content {
    flex: 1;
    min-width: 0;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 4px;
    }

    .card-desc {
      font-size: 13px;
      color: #969799;
      line-height: 1.4;
    }
  }

  .arrow-icon {
    font-size: 16px;
    color: #c8c9cc;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  &:active .arrow-icon {
    transform: translateX(2px);
  }
}
</style>
