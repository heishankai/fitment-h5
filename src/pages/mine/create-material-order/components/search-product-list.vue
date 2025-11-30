<template>
  <div class="product-list">
    <van-card
      v-for="product in products"
      :key="product.id"
      :title="product.commodity_name"
      :desc="product.commodity_description"
      :thumb="product.commodity_cover"
      class="product-card"
      @click="navigateToDetail(product)"
    >
      <template #price>
        <div class="product-price-wrapper">
          <span class="product-price">¥{{ product.commodity_price }}</span>
          <span class="product-unit" v-if="product.commodity_unit"
            >/{{ product.commodity_unit }}</span
          >
        </div>
      </template>
      <template #footer>
        <van-button
          size="mini"
          type="primary"
          class="add-btn"
          @click.stop="handleAddToCart(product)"
          icon="shopping-cart-o"
        >
          加入清单
        </van-button>
      </template>
    </van-card>

    <!-- 加载更多触发器 -->
    <div ref="loadMoreRef" class="load-more-trigger"></div>

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
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCommodityConfigService } from '../service'
import { useCart } from '../composables/useCart'

// 类型定义
interface Product {
  id: number
  commodity_name: string
  commodity_price: number
  commodity_description: string
  commodity_cover: string
  commodity_unit?: string
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

// 使用购物车功能
const { addToCart } = useCart()

// 响应式数据
const products = ref<Product[]>([])
const loading = ref(false)
const finish = ref(false)
const pageParams = ref<PageParams>({
  pageIndex: 1,
  pageSize: 10
})

// IntersectionObserver 用于监听滚动到底部
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// 加入清单
const handleAddToCart = (product: any) => {
  addToCart(product)
}

// 加载商品数据
const loadProducts = async (): Promise<void> => {
  if (loading.value) {
    return
  }

  loading.value = true

  const params = {
    ...pageParams.value,
    commodity_name: props.searchKeyword?.trim() || null
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
    // 没有更多数据时，断开观察器
    if (observer) {
      observer.disconnect()
    }
  } else {
    products.value.push(...newData)
    pageParams.value.pageIndex++
    // 如果返回的数据少于 pageSize，说明没有更多数据了
    if (newData.length < pageParams.value.pageSize) {
      finish.value = true
      // 没有更多数据时，断开观察器
      if (observer) {
        observer.disconnect()
      }
    } else {
      // 还有更多数据时，确保观察器正在工作
      nextTick(() => {
        if (!observer && loadMoreRef.value) {
          initIntersectionObserver()
        }
      })
    }
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
    // 当关键词变化时，重置并重新加载
    if (newKeyword !== oldKeyword) {
      resetProducts()
      // 使用 nextTick 确保 resetProducts 完成后再加载
      nextTick(() => {
        loadProducts()
        // 重新初始化观察器
        if (observer) {
          observer.disconnect()
        }
        nextTick(() => {
          initIntersectionObserver()
        })
      })
    }
  },
  { immediate: false }
)

// 加载更多（滚动加载时调用）
const getMore = async (): Promise<void> => {
  // 如果已经加载完成或正在加载，直接返回
  if (finish.value || loading.value) {
    return
  }
  return loadProducts()
}

// 初始化 IntersectionObserver
const initIntersectionObserver = () => {
  // 如果已经完成或没有触发器元素，不初始化
  if (finish.value || !loadMoreRef.value) return

  // 如果已有观察器，先断开
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      // 当触发器进入视口时，加载更多
      if (entries[0].isIntersecting && !loading.value && !finish.value) {
        getMore()
      }
    },
    {
      root: null, // 使用视口作为根
      rootMargin: '100px', // 提前100px开始加载
      threshold: 0.1
    }
  )

  observer.observe(loadMoreRef.value)
}

// 组件挂载时加载全部商品并初始化观察器
onMounted(() => {
  loadProducts()
  nextTick(() => {
    initIntersectionObserver()
  })
})

// 组件卸载时清理观察器
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f5f5f5;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  :deep(.van-card) {
    border-radius: 16px;
    overflow: hidden;
    padding: 16px;
    background: #fff;
  }

  :deep(.van-card__thumb) {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  &:active :deep(.van-card__thumb img) {
    transform: scale(1.05);
  }

  :deep(.van-card__content) {
    flex: 1;
    min-width: 0;
  }

  :deep(.van-card__title) {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 1.4;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  :deep(.van-card__desc) {
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  :deep(.van-card__price) {
    margin-top: 8px;
  }

  .product-price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .product-price {
    font-size: 20px;
    font-weight: 700;
    color: #00cec9;
  }

  .product-unit {
    font-size: 12px;
    color: #969799;
    font-weight: 400;
  }

  :deep(.van-card__footer) {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
  }

  .add-btn {
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border: none;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 206, 201, 0.3);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
      box-shadow: 0 1px 4px rgba(0, 206, 201, 0.4);
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

.load-more-trigger {
  height: 1px;
  width: 100%;
  visibility: hidden;
}
</style>
