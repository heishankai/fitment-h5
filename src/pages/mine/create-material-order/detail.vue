<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="productDetail">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 商品轮播图 -->
        <div class="product-carousel fade-in-up">
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
          <div class="category-tag fade-in-up" :style="{ animationDelay: '0.1s' }">
            {{ productDetail?.category_name }}
          </div>

          <div class="divider-view"></div>

          <div class="product-title fade-in-up" :style="{ animationDelay: '0.2s' }">
            {{ productDetail?.commodity_name }}
          </div>

          <div class="divider-view"></div>

          <div class="product-price fade-in-up" :style="{ animationDelay: '0.3s' }">
            <span class="product-price-value">¥{{ productDetail?.commodity_price }}</span>
            <span class="product-price-unit">/{{ productDetail?.commodity_unit }}</span>
          </div>

          <div class="divider-view"></div>

          <!-- 服务保障 -->
          <div class="card fade-in-up shine-effect" :style="{ animationDelay: '0.4s' }">
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
          <div class="card fade-in-up shine-effect" :style="{ animationDelay: '0.5s' }">
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
          <div class="card fade-in-up shine-effect" :style="{ animationDelay: '0.6s' }">
            <div
              class="detail-item fade-in-up"
              v-for="(item, index) in productDetail?.commodity_details || []"
              :key="index"
              :style="{ animationDelay: `${0.7 + index * 0.1}s` }"
            >
              <SectionTitle v-if="item.title" :title="item.title" />
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showImagePreview } from 'vant'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import SectionTitle from '@/components/section-title.vue'
import { getCommodityDetailService } from './service'

const route = useRoute()

const productDetail = ref<any>(null)
const refreshing = ref(false)

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
  transition: transform 0.3s ease;

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.98);
    }
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
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 206, 201, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 206, 201, 0.4);
  }
}

.product-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.3s ease;

  .product-price-value {
    font-size: 24px;
    font-weight: 600;
    color: #00cec9;
    transition: transform 0.3s ease;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .van-icon {
      transition: transform 0.3s ease;
    }

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
}

// 商品详情
.detail-item {
  margin-top: 16px;

  &:first-child {
    margin-top: 0;
  }

  .detail-image {
    width: 100%;
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: scale(0.98);
    }

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
    transition: color 0.3s ease;
  }
}
</style>
