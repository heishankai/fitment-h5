<template>
  <div class="page-container">
    <custom-van-navbar />

    <!-- 搜索栏 -->
    <div class="search-header">
      <div class="search-bar" @click="navigateToSearch">
        <van-icon name="search" color="#00cec9" size="18" />
        <div class="search-placeholder">搜索您想要的商品...</div>
      </div>
    </div>

    <!-- 品类选择组件 -->
    <category-selector @category-change="onCategoryChange" ref="categorySelectorRef" />

    <main ref="mainRef" @scroll="handleScroll">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 商品瀑布流组件 -->
        <product-waterfall :selected-category="selectedCategory" ref="productWaterfallRef" />
      </van-pull-refresh>
    </main>

    <footer>
      <van-button
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="onSubmit"
        :disabled="selectedCommodities.length === 0"
      >
        <van-icon name="checked" />
        提交 ({{ selectedCommodities.length }})
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import CategorySelector from './components/category-selector.vue'
import ProductWaterfall from './components/product-waterfall.vue'
import { createMaterialOrder } from './service'

const route = useRoute()
const router = useRouter()

// 响应式数据
const refreshing = ref(false)
const selectedCategory = ref<number | null>(null)
const selectedCommodities = ref<Array<{ commodityId: number; quantity: number }>>([])
const isLoadingMore = ref(false)

// 组件引用
const categorySelectorRef = ref<InstanceType<typeof CategorySelector> | null>(null)
const productWaterfallRef = ref<InstanceType<typeof ProductWaterfall> | null>(null)
const mainRef = ref<HTMLElement | null>(null)

// 品类变化处理
const onCategoryChange = (categoryId: number | null): void => {
  selectedCategory.value = categoryId
}

// 下拉刷新
const onRefresh = async (): Promise<void> => {
  refreshing.value = true
  // 重置商品数据并重新加载
  productWaterfallRef.value?.resetProducts()
  await productWaterfallRef.value?.loadProducts()
  refreshing.value = false
}

// 滚动加载更多
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement
  if (!target || isLoadingMore.value || refreshing.value) return

  // 计算是否滚动到底部（距离底部 200px 时触发）
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  // 距离底部 200px 时加载更多
  if (distanceToBottom < 200) {
    isLoadingMore.value = true
    try {
      await productWaterfallRef.value?.getMore()
    } finally {
      isLoadingMore.value = false
    }
  }
}

// 跳转搜索页面
const navigateToSearch = (): void => {
  const orderId = route.params.id
  router.push({
    path: `/mine/create-material-order/search/${orderId}`
  })
}

// 提交辅料单
const onSubmit = async () => {
  if (selectedCommodities.value.length === 0) {
    showToast('请先选择商品')
    return
  }

  try {
    const orderId = Number(route.params.id)
    const { success, message } = await createMaterialOrder({
      orderId,
      commodities: selectedCommodities.value
    })

    if (success) {
      showToast('创建成功')
      router.back()
    } else {
      showToast(message || '创建失败')
    }
  } catch (error: any) {
    showToast(error?.message || '创建失败')
  }
}

// 暴露方法供详情页调用
defineExpose({
  addCommodity: (commodityId: number, quantity: number) => {
    const existing = selectedCommodities.value.find((item) => item.commodityId === commodityId)
    if (existing) {
      existing.quantity += quantity
    } else {
      selectedCommodities.value.push({ commodityId, quantity })
    }
  },
  removeCommodity: (commodityId: number) => {
    const index = selectedCommodities.value.findIndex((item) => item.commodityId === commodityId)
    if (index > -1) {
      selectedCommodities.value.splice(index, 1)
    }
  },
  getCommodityQuantity: (commodityId: number) => {
    const item = selectedCommodities.value.find((item) => item.commodityId === commodityId)
    return item ? item.quantity : 0
  }
})
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

/* 搜索栏 */
.search-header {
  padding: 12px 16px;
  background: #fff;
  flex-shrink: 0;

  .search-bar {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 25px;
    padding: 14px 20px;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 206, 201, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4px 16px rgba(0, 206, 201, 0.15);
      border-color: rgba(0, 206, 201, 0.4);
    }

    .search-placeholder {
      color: #999;
      font-size: 15px;
      font-weight: 400;
    }
  }
}

main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);

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

    .van-icon {
      font-size: 16px;
    }
  }
}
</style>
