<template>
  <div class="page-container">
    <custom-van-navbar />
    <main>
      <custom-tabs
        :tabs="tabsList"
        :active-tab="activeTab"
        :refreshing="refreshing"
        @update:active-tab="activeTab = $event"
        @update:refreshing="refreshing = $event"
        @refresh="onRefresh"
      >
        <order-list-content :orders="orders" />
      </custom-tabs>
    </main>
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getCraftsmanAcceptedOrdersService } from './service'
import OrderListContent from './components/order-list-content.vue'
import CustomTabs from './components/custom-tabs.vue'

const orders = ref<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
const loading = ref(true)
const refreshing = ref(false)
const activeTab = ref('accepted')

// Tabs 列表
const tabsList = [
  { name: 'accepted', title: '已接单' },
  { name: 'completed', title: '已完成' },
  { name: 'cancelled', title: '已取消' }
]

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
watch(activeTab, () => {
  loadOrders()
})

// 下拉刷新
const onRefresh = async () => {
  await loadOrders()
  refreshing.value = false
}

onMounted(() => {
  loadOrders()
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
