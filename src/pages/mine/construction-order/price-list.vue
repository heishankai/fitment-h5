<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="order">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 工价清单 -->
        <price-list
          :work-prices="order?.work_prices"
          :sub-work-prices="order?.sub_work_prices"
          class="fade-in-up"
        />
      </van-pull-refresh>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import PriceList from './components/price-list.vue'
import { getOrderDetail } from './service'

const route = useRoute()

const order = ref<any>(null)
const refreshing = ref(false)

// 加载订单详情
const loadOrderDetail = async () => {
  const orderId = Number(route?.params?.id)
  const { success, data } = await getOrderDetail(orderId)
  if (!success) return
  order.value = data
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

.fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
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
</style>
