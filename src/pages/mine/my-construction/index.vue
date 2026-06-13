<template>
  <div class="page-container">
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
import { useRequest } from 'vue-hooks-plus'
import OrderListContent from './components/order-list-content.vue'
import CustomTabs from './components/custom-tabs.vue'
import { ORDER_TAB_CONFIG, ORDER_TAB_LIST } from './constants'
import { getCraftsmanAcceptedOrdersService } from './service'
import type { ConstructionOrder, CraftsmanAcceptedOrdersParams, OrderTabName } from './type'

const refreshing = ref(false)
const activeTab = ref<OrderTabName>('accepted')
const orders = ref<ConstructionOrder[]>([])
const tabsList = ORDER_TAB_LIST

const getOrderParams = (tabName: OrderTabName): CraftsmanAcceptedOrdersParams => {
  return {
    order_status: ORDER_TAB_CONFIG[tabName].status
  }
}

// 订单列表请求：tab 变化由 refreshDeps 自动触发，成功后直接回填列表。
const { refresh } = useRequest(
  () => getCraftsmanAcceptedOrdersService(getOrderParams(activeTab.value)),
  {
    refreshDeps: [activeTab],
    onSuccess(res) {
      orders.value = res.success ? res.data || [] : []
    },
    onFinally() {
      refreshing.value = false
    }
  }
)

// 下拉刷新：直接复用 useRequest 的 refresh。
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
