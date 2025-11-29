<template>
  <div class="page-container">
    <custom-van-navbar title="搜索商品" />

    <!-- 搜索框 -->
    <div class="search-header">
      <div class="search-box">
        <van-icon name="search" size="18" color="#999" />
        <van-field
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          clearable
          @keyup.enter="onSearch"
          @update:model-value="onSearchInput"
          @clear="clearSearch"
          class="search-input"
        />
      </div>
    </div>

    <!-- 搜索结果 -->
    <main ref="mainRef" @scroll="handleScroll">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 商品列表组件 -->
        <search-product-list :search-keyword="searchKeyword" ref="productListRef" />
      </van-pull-refresh>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { debounce } from 'lodash-es'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import SearchProductList from './components/search-product-list.vue'

// 搜索相关状态
const searchKeyword = ref('')
const refreshing = ref(false)
const isLoadingMore = ref(false)
const productListRef = ref<InstanceType<typeof SearchProductList> | null>(null)
const mainRef = ref<HTMLElement | null>(null)

// 执行搜索的函数
const performSearch = async (): Promise<void> => {
  if (productListRef.value) {
    productListRef.value.resetProducts()
    await productListRef.value.loadProducts()
  }
}

// 防抖搜索函数
const debouncedSearch = debounce(performSearch, 500)

// 搜索输入处理
const onSearchInput = (value: string): void => {
  searchKeyword.value = value

  // 如果输入框为空，重置并加载全部商品
  if (!value.trim()) {
    productListRef.value?.resetProducts()
    productListRef.value?.loadProducts()
    return
  }

  // 使用防抖搜索
  debouncedSearch()
}

// 执行搜索
const onSearch = async (): Promise<void> => {
  if (!searchKeyword.value.trim()) return

  // 等待下一个tick确保组件状态更新
  await new Promise((resolve) => setTimeout(resolve, 0))

  if (productListRef.value) {
    productListRef.value.resetProducts()
    await productListRef.value.loadProducts()
  }
}

// 清空搜索
const clearSearch = (): void => {
  searchKeyword.value = ''
  productListRef.value?.resetProducts()
  productListRef.value?.loadProducts()
}

// 滚动加载更多
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement
  if (!target || isLoadingMore.value || refreshing.value) return

  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  if (distanceToBottom < 200) {
    isLoadingMore.value = true
    try {
      await productListRef.value?.getMore()
    } catch (error) {
      console.error('加载更多失败:', error)
    } finally {
      isLoadingMore.value = false
    }
  }
}

// 下拉刷新
const onRefresh = async (): Promise<void> => {
  refreshing.value = true

  if (productListRef.value) {
    productListRef.value.resetProducts()
    await productListRef.value.loadProducts()
  }

  refreshing.value = false
}
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

.search-header {
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;

  .search-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 20px;
    padding: 8px 12px;
    gap: 8px;

    .van-icon {
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      font-size: 14px;
      color: #333;
      background: transparent;
      border: none;
      outline: none;
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
</style>
