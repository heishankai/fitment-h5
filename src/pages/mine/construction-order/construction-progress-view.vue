<template>
  <div class="page-container">
    <custom-van-navbar />

    <main>
      <van-pull-refresh class="pull-refresh" v-model="refreshing" @refresh="onRefresh">
        <!-- 施工进度 -->
        <construction-progress
          v-if="constructionProgressData?.length"
          :construction_progress="constructionProgressData"
          :order-id="orderId"
          class="fade-in-up"
        />
        <van-empty v-else description="暂无施工进度记录" />
      </van-pull-refresh>
    </main>

    <footer>
      <van-button
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="goToCreateConstructionProgress"
        icon="plus"
      >
        创建施工进度
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import ConstructionProgress from './components/construction-progress.vue'
import { getConstructionProgressByOrderId } from './service'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const constructionProgressData = ref<any>(null)
const refreshing = ref(false)

// 加载施工进度
const loadConstructionProgress = async () => {
  const { success, data } = await getConstructionProgressByOrderId(orderId)
  if (success) {
    constructionProgressData.value = data || null
  }
}

// 跳转到创建施工进度页面
const goToCreateConstructionProgress = () => {
  router.push({
    path: `/mine/construction-progress/${orderId}`
  })
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadConstructionProgress()
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadConstructionProgress()
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

.pull-refresh {
  height: 100%;
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
