<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="order">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 订单头部（包含用户信息） -->
        <detail-header :order="order" :user="order?.wechat_user" class="fade-in-up" />

        <!-- 订单信息 -->
        <order-info :order="order" class="fade-in-up" :style="{ animationDelay: '0.2s' }" />

        <!-- 辅材清单 -->
        <material-list
          :materials="order?.materials_list"
          class="fade-in-up"
          :style="{ animationDelay: '0.3s' }"
        />

        <!-- 工价清单 -->
        <price-list
          :work-prices="order?.work_prices"
          :sub-work-prices="order?.sub_work_prices"
          class="fade-in-up"
          :style="{ animationDelay: '0.35s' }"
        />

        <!-- 施工进度-->
        <construction-progress
          :construction_progress="order?.construction_progress"
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
      <van-button
        v-if="order?.work_prices?.[0]?.is_paid"
        type="warning"
        size="normal"
        round
        class="action-btn"
        @click="handleCreateMaterialOrder"
        icon="plus"
      >
        {{ buttonText }}
      </van-button>
    </footer>
    <van-floating-bubble
      v-if="order?.order_status === 2"
      icon="chat"
      :offset="chatBubbleOffset"
      @click="onContactUser"
      class="chat-bubble"
    />
    <van-floating-bubble
      icon="location"
      :offset="plusBubbleOffset"
      @click="goToConstructionProgress"
      class="plus-bubble"
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
import MaterialList from './components/material-list.vue'
import PriceList from './components/price-list.vue'
import ConstructionProgress from './components/construction-progress.vue'
// utils
import { getOrderDetail, getUserInfoService } from './service'
import {
  handleContactUser,
  getButtonTextByWorkKind,
  calculateChatBubbleOffset,
  calculatePlusBubbleOffset
} from './utils'

const route = useRoute()
const router = useRouter()

const order = ref<any>(null)
const user = ref<any>(null)
const refreshing = ref(false)
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

// plus 气泡位置（上方，在 chat 气泡上方）
const plusBubbleOffset = computed(() => {
  return calculatePlusBubbleOffset(windowSize.value, order.value?.order_status)
})

// 根据工种计算按钮文本
const buttonText = computed(() => {
  const workKindName = user.value?.skillInfo?.workKindName
  return getButtonTextByWorkKind(workKindName)
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

  console.log(user.value.skillInfo.workKindName, 'user.value.skillInfo.workKindName ')
}

// 联系用户
const onContactUser = async () => {
  await handleContactUser(order.value?.wechat_user, router)
}

// 跳转到施工进度
const goToConstructionProgress = () => {
  router.push({
    path: `/mine/construction-progress/${order.value?.id}`
  })
}

// 创建辅料单
const handleCreateMaterialOrder = () => {
  const orderId = order.value?.id
  router.push(`/mine/create-material-order/${orderId}`)
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

:deep(.plus-bubble) {
  z-index: 1001; // 确保 plus 气泡在 chat 气泡上方
}
</style>
