<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="productDetail">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 商品轮播图 -->
        <div class="product-carousel">
          <van-swipe :autoplay="3000" :show-indicators="true" indicator-color="#00cec9">
            <van-swipe-item
              v-for="(image, index) in productDetail?.commodity_images || []"
              :key="index"
            >
              <img class="carousel-image" :src="image" @click="handlePreviewCarouselImage(index)" />
            </van-swipe-item>
          </van-swipe>
        </div>

        <div class="divider-view"></div>

        <div class="content-area">
          <div class="category-tag">{{ productDetail?.category_name }}</div>

          <div class="divider-view"></div>

          <div class="product-title">{{ productDetail?.commodity_name }}</div>

          <div class="divider-view"></div>

          <div class="product-price">
            <span class="product-price-value">¥{{ productDetail?.commodity_price }}</span>
            <span class="product-price-unit">/{{ productDetail?.commodity_unit }}</span>
          </div>

          <div class="divider-view"></div>

          <!-- 数量选择 -->
          <div class="quantity-section">
            <div class="quantity-label">数量</div>
            <van-stepper
              v-model="quantity"
              min="1"
              :max="999"
              integer
              @change="handleQuantityChange"
            />
          </div>

          <div class="divider-view"></div>

          <!-- 服务保障 -->
          <div class="card">
            <div class="card-header">
              <van-icon name="shield-o" color="#00cec9" size="20" />
              <div class="card-title">服务保障</div>
            </div>
            <div class="card-content">
              {{ productDetail?.service_guarantee }}
            </div>
          </div>

          <div class="divider-view"></div>

          <!-- 商品描述 -->
          <div class="card">
            <div class="card-header">
              <van-icon name="description" color="#00cec9" size="20" />
              <div class="card-title">商品描述</div>
            </div>
            <div class="card-content">
              {{ productDetail?.commodity_description }}
            </div>
          </div>

          <div class="divider-view"></div>

          <!-- 商品详情 -->
          <div class="card">
            <div class="section-title">商品详情</div>
            <div
              class="detail-item"
              v-for="(item, index) in productDetail?.commodity_details || []"
              :key="index"
            >
              <div class="detail-title" v-if="item.title">{{ item.title }}</div>
              <img
                v-for="(image, imgIndex) in item.image || []"
                :key="imgIndex"
                class="detail-image"
                :src="image"
                :class="{ 'has-title': item.title }"
                @click="handlePreviewImage(image, item.image)"
              />
              <div class="detail-desc" v-if="item.desc">
                {{ item.desc }}
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </main>

    <footer>
      <van-button type="primary" size="normal" round class="action-btn" @click="handleAddToCart">
        <van-icon name="shopping-cart-o" />
        加入辅料单
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getCommodityDetailService } from './service'

const route = useRoute()
const router = useRouter()

const productDetail = ref<any>(null)
const refreshing = ref(false)
const quantity = ref(1)

// 加载商品详情
const loadProductDetail = async (id: number): Promise<void> => {
  const { success, data } = await getCommodityDetailService(id)
  if (!success) return

  productDetail.value = data
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  const id = Number(route.params.id)
  await loadProductDetail(id)
  refreshing.value = false
}

// 查看轮播图图片
const handlePreviewCarouselImage = (index: number): void => {
  const images = productDetail.value?.commodity_images || []
  showImagePreview({
    images,
    startPosition: index
  })
}

// 查看图片详情
const handlePreviewImage = (currentImage: string, images: string[]): void => {
  showImagePreview({
    images: images.length > 0 ? images : [currentImage],
    startPosition: 0
  })
}

// 数量变化
const handleQuantityChange = (value: number) => {
  quantity.value = value
}

// 加入辅料单
const handleAddToCart = () => {
  // 这里应该通过事件总线或者状态管理来通知父页面添加商品
  // 暂时使用路由参数传递
  router.back()
  // 触发父页面添加商品的事件
  // 可以通过 provide/inject 或者事件总线实现
  showToast(`已添加 ${quantity.value} 件商品`)
}

onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    loadProductDetail(id)
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
}

.divider-view {
  height: 12px;
}

// 商品轮播图
.product-carousel {
  width: 100vw;
  height: 250px;
  background-color: #fff;
  position: relative;
  overflow: hidden;

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.content-area {
  padding: 0 16px 16px;
}

.category-tag {
  width: fit-content;
  background: linear-gradient(135deg, #00cec9, #00b4d8);
  color: #fff;
  padding: 6px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
}

.product-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.5;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 4px;

  .product-price-value {
    font-size: 24px;
    font-weight: 600;
    color: #00cec9;
  }

  .product-price-unit {
    font-size: 16px;
    font-weight: 400;
    color: #2c3e50;
  }
}

.quantity-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;

  .quantity-label {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .card-content {
    font-size: 15px;
    line-height: 1.8;
    color: #555;
    word-break: break-all;
    white-space: pre-line;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0;
  }
}

// 商品详情
.detail-item {
  margin-top: 16px;

  &:first-child {
    margin-top: 0;
  }

  .detail-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  .detail-image {
    width: 100%;
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    &.has-title {
      margin-top: 16px;
    }
  }

  .detail-desc {
    font-size: 15px;
    line-height: 1.8;
    color: #555;
    padding: 0;
    word-break: break-all;
    position: relative;
    white-space: pre-line;
  }
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
