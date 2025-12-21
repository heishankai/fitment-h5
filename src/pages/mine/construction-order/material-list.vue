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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import MaterialList from './components/material-list.vue'
import { getMaterialsByOrderId } from './service'

const route = useRoute()

const orderId = Number(route.params.id)
const materialsData = ref<any>(null)
const refreshing = ref(false)

// 加载辅材列表
const loadMaterials = async () => {
  const { success, data } = await getMaterialsByOrderId(orderId)
  if (success) {
    materialsData.value = data || null
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadMaterials()
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadMaterials()
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
