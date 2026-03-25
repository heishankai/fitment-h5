<template>
  <div class="page-container">
    <main>
      <van-pull-refresh class="pull-refresh" v-model="refreshing" @refresh="onRefresh">
        <!-- 施工进度 -->
        <construction-progress
          v-if="constructionProgressData?.length"
          :construction_progress="constructionProgressData"
          :order-id="orderId"
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
  min-height: 0; /* flex 子项默认可被内容撑开，不设置则 overflow 无法在本区域滚动 */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px;
  gap: 12px;
}

/* 由 main 滚动；勿设 height:100%，否则内部高度被锁死、列表长时无法滑动 */
.pull-refresh {
  display: block;
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);

  .action-btn {
    width: 100%;
    height: 44px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .van-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }
  }
}
</style>
