<template>
  <div class="page">
    <custom-van-navbar />
    <van-tabs
      v-model:active="activeTab"
      @change="onTabChange"
      sticky
      class="tabs-container fade-in-up"
      swipeable
    >
      <van-tab title="已接单" name="accepted">
        <order-list-content
          :orders="orders"
          :loading="loading"
          :refreshing="refreshing"
          @update:refreshing="refreshing = $event"
          @refresh="onRefresh"
          @go-to-detail="goToDetail"
        />
      </van-tab>

      <van-tab title="已完成" name="completed">
        <order-list-content
          :orders="orders"
          :loading="loading"
          :refreshing="refreshing"
          @update:refreshing="refreshing = $event"
          @refresh="onRefresh"
          @go-to-detail="goToDetail"
        />
      </van-tab>

      <van-tab title="已取消" name="cancelled">
        <order-list-content
          :orders="orders"
          :loading="loading"
          :refreshing="refreshing"
          @update:refreshing="refreshing = $event"
          @refresh="onRefresh"
          @go-to-detail="goToDetail"
        />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getCraftsmanAcceptedOrdersService } from './service'
import OrderListContent from './components/order-list-content.vue'

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(true)
const refreshing = ref(false)
const activeTab = ref('accepted')

// Tab 配置
const tabConfig = {
  accepted: { status: [2], title: '已接单' },
  completed: { status: [3], title: '已完成' },
  cancelled: { status: [4], title: '已取消' }
}

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true
    const config = tabConfig[activeTab.value as keyof typeof tabConfig]
    const { data, success } = await getCraftsmanAcceptedOrdersService({
      order_status: config.status
    })

    if (!success) return
    orders.value = data || []
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

// Tab 切换
const onTabChange = () => {
  loadOrders()
}

// 下拉刷新
const onRefresh = async () => {
  await loadOrders()
  refreshing.value = false
}

// 跳转到订单详情
const goToDetail = (orderId: number) => {
  router.push(`/mine/construction-order/${orderId}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="less" scoped>
.page {
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

.tabs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.van-tabs__wrap) {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.van-tabs__nav) {
    background: transparent;
  }

  :deep(.van-tab) {
    transition: color 0.3s ease;
  }

  :deep(.van-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.van-tab__panel) {
    height: 100%;
    overflow: hidden;
  }
}
</style>
