<template>
  <div class="waterfall-container">
    <div class="waterfall-column" v-for="(column, index) in waterfallColumns" :key="index">
      <div
        class="product-item"
        v-for="product in column"
        :key="product.id"
        @click="navigateToDetail(product)"
      >
        <div class="product-image" :style="{ height: product.imageHeight + 'px' }">
          <img :src="product.commodity_cover" class="image" />
          <div class="product-tag">{{ product.category_name }}</div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.commodity_name }}</div>
          <div class="product-price">¥{{ product.commodity_price }}</div>
          <div class="product-desc">{{ product.commodity_description }}</div>
        </div>
      </div>
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
  <van-empty v-if="!products?.length && !loading" description="暂无商品" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
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
  imageHeight?: number
  descLength?: number
  isHighPrice?: boolean
  isLongName?: boolean
}

interface PageParams {
  pageIndex: number
  pageSize: number
}

// 定义属性
interface Props {
  selectedCategory?: number | null
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

// 常量定义
const HEIGHT_VARIATIONS = [100, 150, 200, 250, 120, 180, 160, 220] as const
const BASE_HEIGHT = 180
const MAX_DESC_HEIGHT = 100
const HIGH_PRICE_THRESHOLD = 1000
const LONG_NAME_THRESHOLD = 20

// 为商品添加高度信息
const addHeightInfo = (product: Product, index: number): Product => {
  const descLength = product.commodity_description?.length || 0
  const isHighPrice = product.commodity_price > HIGH_PRICE_THRESHOLD
  const isLongName = product.commodity_name?.length > LONG_NAME_THRESHOLD

  return {
    ...product,
    imageHeight: HEIGHT_VARIATIONS[index % HEIGHT_VARIATIONS.length],
    descLength,
    isHighPrice,
    isLongName
  }
}

// 计算商品预估高度
const calculateProductHeight = (product: Product): number => {
  const descHeight = Math.min((product.descLength || 0) * 2, MAX_DESC_HEIGHT)
  const priceHeight = product.isHighPrice ? 30 : 20
  const nameHeight = product.isLongName ? 50 : 35

  return BASE_HEIGHT + (product.imageHeight || 0) + descHeight + priceHeight + nameHeight + 40
}

// 瀑布流布局 - 计算属性
const waterfallColumns = computed(() => {
  const columns: Product[][] = [[], []]
  const columnHeights = [0, 0] // 记录每列的高度

  products.value.forEach((product, index) => {
    const productWithHeight = addHeightInfo(product, index)

    // 找到高度最小的列
    const minHeightIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1

    // 将商品添加到高度最小的列
    columns[minHeightIndex].push(productWithHeight)

    // 计算并更新列高度
    const estimatedHeight = calculateProductHeight(productWithHeight)
    columnHeights[minHeightIndex] += estimatedHeight
  })

  return columns
})

// 加载商品数据
const loadProducts = async (showToastMessage: boolean = false): Promise<void> => {
  if (finish.value || loading.value) {
    if (showToastMessage && finish.value) {
      showToast('没有更多数据~')
    }
    return
  }

  loading.value = true

  const params = {
    ...pageParams.value,
    category_id: props.selectedCategory || null,
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

// 监听品类变化
watch(
  () => props.selectedCategory,
  (newCategory, oldCategory) => {
    if (newCategory !== oldCategory) {
      resetProducts()
      loadProducts(false)
    }
  },
  { immediate: false }
)

// 监听搜索关键词变化
watch(
  () => props.searchKeyword,
  (newKeyword, oldKeyword) => {
    if (newKeyword !== oldKeyword) {
      resetProducts()
      loadProducts(false)
    }
  },
  { immediate: false }
)

// 加载更多（滚动加载时调用，不显示提示）
const getMore = (): Promise<void> => {
  return loadProducts(false)
}

// 组件挂载时加载商品
onMounted(() => {
  loadProducts(false)
})

// 暴露方法
defineExpose({
  loadProducts: () => loadProducts(true),
  resetProducts,
  getMore
})
</script>

<style lang="less" scoped>
/* 瀑布流布局 */
.waterfall-container {
  display: flex;
  gap: 8px;
  padding: 0 8px;
  align-items: flex-start;

  .waterfall-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;

    .product-item {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-bottom: 8px;
      position: relative;
      cursor: pointer;

      &:active {
        transform: scale(0.98);
      }

      .product-image {
        position: relative;
        width: 100%;

        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 206, 201, 0.9);
          color: #fff;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
        }
      }

      .product-info {
        padding: 12px;

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          font-size: 16px;
          font-weight: 700;
          color: #ff4757;
          margin-bottom: 6px;
        }

        .product-desc {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
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
</style>
