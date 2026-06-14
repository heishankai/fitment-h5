<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="order">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 工价清单 -->
        <price-list
          :parent-work-price-groups="order?.parent_work_price_groups"
          :order-info="order"
          class="fade-in-up"
        />
      </van-pull-refresh>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRequest } from 'vue-hooks-plus'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import PriceList from './components/price-list.vue'
import { getOrderDetail } from './service'
import type { OrderDetail } from './type'

const route = useRoute()

const refreshing = ref(false)

const orderId = computed(() => Number(route.params.id))

// 工价页只需要订单详情接口，接口里已经包含工价和费用汇总字段。
const getPageData = async (): Promise<OrderDetail | null> => {
  if (!orderId.value) return null

  const { success, data } = await getOrderDetail(orderId.value)
  return success ? data : null
}

// useRequest 负责初始请求、路由 ID 变化后的刷新，以及下拉刷新结束态。
const { data: order, refresh } = useRequest(getPageData, {
  refreshDeps: [orderId],
  onFinally() {
    refreshing.value = false
  }
})

const onRefresh = refresh
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
