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
    <main>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-wrapper">
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
const productListRef = ref<InstanceType<typeof SearchProductList> | null>(null)

// 防抖搜索函数 - 只更新搜索关键词，让 watch 来处理实际的搜索
const debouncedSearch = debounce((keyword: string) => {
  searchKeyword.value = keyword
}, 500)

// 搜索输入处理
const onSearchInput = (value: string): void => {
  // 如果输入框为空，立即更新并搜索
  if (!value.trim()) {
    searchKeyword.value = ''
    return
  }

  // 使用防抖搜索
  debouncedSearch(value)
}

// 执行搜索（回车键触发）
const onSearch = async (): Promise<void> => {
  if (!searchKeyword.value.trim()) return
  // 取消防抖，立即执行
  debouncedSearch.cancel()
  // searchKeyword 已经是最新的值，watch 会自动触发搜索
}

// 清空搜索
const clearSearch = (): void => {
  searchKeyword.value = ''
  productListRef.value?.resetProducts()
  productListRef.value?.loadProducts()
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
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  .search-box {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 24px;
    padding: 8px 14px;
    gap: 8px;
    height: 40px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    .van-icon {
      flex-shrink: 0;
      font-size: 16px;
    }

    .search-input {
      flex: 1;
      font-size: 14px;
      color: #323233;
      background: transparent;
      border: none;
      outline: none;
      padding: 0;

      :deep(.van-field__control) {
        font-size: 14px;
        color: #323233;
      }

      :deep(.van-field__placeholder) {
        color: #969799;
      }
    }
  }
}

main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pull-refresh-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
</style>
