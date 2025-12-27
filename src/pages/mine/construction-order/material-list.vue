<template>
  <div class="page-container">
    <custom-van-navbar />

    <main>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 辅材清单 -->
        <material-list
          v-if="materialsData && materialsData.commodity_list?.length"
          :materials="materialsData"
          class="fade-in-up"
        />
        <van-empty v-else description="暂无辅材清单" />
      </van-pull-refresh>
    </main>

    <!-- 底部操作栏 -->
    <footer>
      <van-button
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="handleCreateMaterialOrder"
        icon="plus"
      >
        创建辅料单
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import MaterialList from './components/material-list.vue'
import { getMaterialsByOrderId, getOrderDetail, getUserInfoService } from './service'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const materialsData = ref<any>(null)
const refreshing = ref(false)
const order = ref<any>(null)
const user = ref<any>(null)

// 加载订单详情和用户信息
const loadOrderInfo = async () => {
  const { success: orderSuccess, data: orderData } = await getOrderDetail(orderId)
  if (orderSuccess) {
    order.value = orderData
  }

  const { success: userSuccess, data: userData } = await getUserInfoService()
  if (userSuccess) {
    user.value = userData
  }
}

// 加载辅材列表
const loadMaterials = async () => {
  const { success, data } = await getMaterialsByOrderId(orderId)
  if (success) {
    materialsData.value = data || null
  }
}

// 创建辅料单
const handleCreateMaterialOrder = () => {
  router.push(`/mine/create-material-order/${orderId}`)
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await Promise.all([loadMaterials(), loadOrderInfo()])
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadMaterials()
  loadOrderInfo()
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
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px) + 60px); // 为底部按钮留出空间
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  animation: slideUp 0.5s ease-out both;

  .action-btn {
    width: 100%;
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
