<template>
  <div class="product-list">
    <div
      class="product-item"
      v-for="product in products"
      :key="product.id"
      @click="navigateToDetail(product)"
    >
      <div class="product-image">
        <img :src="product.commodity_cover" class="image" />
      </div>
      <div class="product-info">
        <div class="product-name">{{ product.commodity_name }}</div>
        <div class="product-desc">{{ product.commodity_description }}</div>
        <div class="product-price">¥{{ product.commodity_price }}</div>
      </div>
      <div class="product-arrow">
        <van-icon name="arrow" size="16" color="#00cec9" />
      </div>
    </div>

    <!-- 加载中提示 -->
    <div class="loading-more" v-if="loading && products.length > 0">
      <van-loading size="16px" vertical>加载中...</van-loading>
    </div>

    <!-- 没有更多数据 -->
    <div class="no-more" v-if="finish && products.length > 0">
      <div>没有更多商品了~</div>
    </div>

    <!-- 空数据状态 -->
    <div class="empty-state" v-if="!loading && products.length === 0">
      <van-icon name="shop-o" size="60" color="#00cec9" />
      <div>暂无商品</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCommodityConfigService } from '../service'

// 类型定义
interface Product {
  id: number
  commodity_name: string
  commodity_price: number
  commodity_description: string
  commodity_cover: string
  category_name: string
  category_id: number
}

interface PageParams {
  pageIndex: number
  pageSize: number
}

// 定义属性
interface Props {
  searchKeyword?: string | null
}

const props = defineProps<Props>()
const router = useRouter()

// 响应式数据
const products = ref<Product[]>([])
const loading = ref(false)
const finish = ref(false)
const pageParams = ref<PageParams>({
  pageIndex: 1,
  pageSize: 10
})

// 加载商品数据
const loadProducts = async (): Promise<void> => {
  if (finish.value || loading.value) {
    return
  }

  loading.value = true

  const params = {
    ...pageParams.value,
    keyword: props.searchKeyword?.trim() || null
  }

  const { data, success } = await getCommodityConfigService(params)

  if (!success) {
    finish.value = true
    loading.value = false
    return
  }

  const newData = data || []

  if (newData.length === 0) {
    finish.value = true
  } else {
    products.value.push(...newData)
    pageParams.value.pageIndex++
  }

  loading.value = false
}

// 重置商品数据
const resetProducts = (): void => {
  pageParams.value.pageIndex = 1
  products.value = []
  finish.value = false
  loading.value = false
}

// 跳转商品详情
const navigateToDetail = (product: any): void => {
  const currentRoute = router.currentRoute.value
  const orderId = currentRoute.params.id || currentRoute.query.orderId
  router.push({
    path: `/mine/create-material-order/detail/${product.id}`,
    query: orderId ? { orderId: String(orderId) } : undefined
  })
}

// 监听搜索关键词变化
watch(
  () => props.searchKeyword,
  (newKeyword, oldKeyword) => {
    if (newKeyword !== oldKeyword) {
      resetProducts()
      // 无论是否有关键词都加载商品（空关键词时加载全部）
      loadProducts()
    }
  },
  { immediate: false }
)

// 加载更多（滚动加载时调用）
const getMore = (): Promise<void> => {
  return loadProducts()
}

// 组件挂载时加载全部商品
onMounted(() => {
  loadProducts()
})

// 暴露方法
defineExpose({
  loadProducts,
  resetProducts,
  getMore
})
</script>

<style lang="less" scoped>
.product-list {
  padding: 16px;
  background: #f5f5f5;

  .product-item {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 16px;
      flex-shrink: 0;

      .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .product-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-price {
        font-size: 18px;
        font-weight: 700;
        color: #00cec9;
        margin-top: 4px;
      }
    }

    .product-arrow {
      margin-left: 12px;
      flex-shrink: 0;
    }
  }
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #ccc;
  font-size: 16px;
  gap: 12px;
}
</style>
