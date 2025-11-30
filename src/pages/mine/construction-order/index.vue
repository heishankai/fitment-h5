<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="order">
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
        class="fade-in-up"
        :style="{ animationDelay: '0.35s' }"
      />

      <!-- 施工进度-->
      <construction-progress
        :construction_progress="order?.construction_progress"
        class="fade-in-up"
        :style="{ animationDelay: '0.4s' }"
      />
    </main>

    <footer v-if="order?.order_status === 2">
      <van-button
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="goToConstructionProgress"
        icon="location"
      >
        施工打卡
      </van-button>
      <van-button
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
      :offset="bubbleOffset"
      @click="onContactUser"
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
import { handleContactUser, getButtonTextByWorkKind, getRouteByWorkKind } from './utils'

const route = useRoute()
const router = useRouter()

const order = ref<any>(null)
const user = ref<any>(null)
const windowSize = ref({ width: window.innerWidth, height: window.innerHeight })

// 监听窗口大小变化
const handleResize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// 计算浮动气泡位置（右下角）
const bubbleOffset = computed(() => {
  // 气泡大小约 56px
  // footer 高度约 60px + padding
  // 计算距离右边的 x 和距离底部的 y
  const bubbleSize = 56
  const footerHeight = order.value?.order_status === 2 ? 80 : 0
  const padding = 16
  // 考虑安全区域
  const safeAreaBottom =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') ||
        '0',
      10
    ) || 0

  return {
    x: windowSize.value.width - bubbleSize - padding, // 距离右边 16px
    y: windowSize.value.height - footerHeight - bubbleSize - padding - safeAreaBottom // 距离底部，考虑 footer 和安全区域
  }
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

  console.log('订单数据:', order.value)
  console.log('工价清单数据:', order.value?.work_prices)

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

// 创建辅料单 - 根据工种判断跳转
const handleCreateMaterialOrder = () => {
  const workKindName = user.value?.skillInfo?.workKindName
  const orderId = order.value?.id
  const route = getRouteByWorkKind(workKindName, orderId)
  router.push(route)
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
</style>
