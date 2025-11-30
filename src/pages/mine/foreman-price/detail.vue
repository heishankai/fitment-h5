<template>
  <div class="page-container">
    <custom-van-navbar />

    <main v-if="priceDetail">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 工价轮播图 -->
        <div class="price-carousel fade-in-up" v-if="priceDetail?.display_images?.length">
          <van-swipe :autoplay="3000" :show-indicators="true" indicator-color="#00cec9">
            <van-swipe-item v-for="(image, index) in priceDetail.display_images" :key="index">
              <img class="carousel-image" :src="image" @click="handlePreviewCarouselImage(index)" />
            </van-swipe-item>
          </van-swipe>
        </div>

        <div class="divider-view"></div>

        <div class="content-area">
          <div class="work-kind-tag fade-in-up" :style="{ animationDelay: '0.1s' }">
            {{ priceDetail?.work_kind?.work_kind_name || '' }}
          </div>

          <div class="divider-view"></div>

          <div class="price-title fade-in-up" :style="{ animationDelay: '0.2s' }">
            {{ priceDetail?.work_title || '未设置标题' }}
          </div>

          <div class="divider-view"></div>

          <div class="price-info fade-in-up" :style="{ animationDelay: '0.3s' }">
            <span class="price-value">¥{{ priceDetail?.work_price }}</span>
            <span class="price-unit" v-if="priceDetail?.labour_cost">
              /{{ priceDetail.labour_cost.labour_cost_name }}
            </span>
          </div>

          <div
            class="divider-view"
            v-if="priceDetail?.is_set_minimum_price === '1' && priceDetail?.minimum_price"
          ></div>

          <div
            class="minimum-price fade-in-up"
            v-if="priceDetail?.is_set_minimum_price === '1' && priceDetail?.minimum_price"
            :style="{ animationDelay: '0.35s' }"
          >
            <van-icon name="info-o" />
            <span>最低价格：¥{{ priceDetail.minimum_price }}</span>
          </div>

          <div class="divider-view"></div>

          <!-- 定价说明 -->
          <div
            class="card fade-in-up shine-effect"
            v-if="priceDetail?.pricing_description"
            :style="{ animationDelay: '0.4s' }"
          >
            <div class="card-header">
              <van-icon name="description" color="#00cec9" size="20" />
              <div class="card-title">定价说明</div>
            </div>
            <div class="card-content">
              {{ priceDetail.pricing_description }}
            </div>
          </div>

          <div class="divider-view" v-if="priceDetail?.pricing_description"></div>

          <!-- 服务范围 -->
          <div
            class="card fade-in-up shine-effect"
            v-if="priceDetail?.service_scope"
            :style="{ animationDelay: '0.5s' }"
          >
            <div class="card-header">
              <van-icon name="service-o" color="#00cec9" size="20" />
              <div class="card-title">服务范围</div>
            </div>
            <div class="card-content">
              {{ priceDetail.service_scope }}
            </div>
          </div>

          <div class="divider-view" v-if="priceDetail?.service_scope"></div>

          <!-- 服务详情 -->
          <div
            class="card fade-in-up shine-effect"
            v-if="priceDetail?.service_details?.length"
            :style="{ animationDelay: '0.6s' }"
          >
            <div class="card-header">
              <van-icon name="orders-o" color="#00cec9" size="20" />
              <div class="card-title">服务详情</div>
            </div>
            <div class="service-details">
              <div
                class="detail-item fade-in-up"
                v-for="(item, index) in priceDetail.service_details"
                :key="index"
                :style="{ animationDelay: `${0.7 + index * 0.1}s` }"
              >
                <SectionTitle v-if="item.service_title" :title="item.service_title" />
                <div class="service-desc" v-if="item.service_desc">
                  {{ item.service_desc }}
                </div>
                <div class="service-images" v-if="item.service_image?.length">
                  <img
                    v-for="(image, imgIndex) in item.service_image"
                    :key="imgIndex"
                    class="detail-image"
                    :src="image"
                    :class="{ 'has-title': item.service_title }"
                    @click="handlePreviewImage(image, item.service_image)"
                  />
                </div>
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
import { getWorkPriceDetailService } from './service'

const route = useRoute()

const priceDetail = ref<any>(null)
const refreshing = ref(false)

// 加载工价详情
const loadPriceDetail = async (id: number): Promise<void> => {
  const { success, data } = await getWorkPriceDetailService(id)
  if (!success) return

  priceDetail.value = data
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  const id = Number(route.params.id)
  await loadPriceDetail(id)
  refreshing.value = false
}

// 查看轮播图图片
const handlePreviewCarouselImage = (index: number): void => {
  const images = priceDetail.value?.display_images || []
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
    loadPriceDetail(id)
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

// 工价轮播图
.price-carousel {
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

.work-kind-tag {
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

.price-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.3s ease;

  .price-value {
    font-size: 28px;
    font-weight: 700;
    color: #00cec9;
    transition: transform 0.3s ease;
  }

  .price-unit {
    font-size: 16px;
    font-weight: 400;
    color: #2c3e50;
  }
}

.minimum-price {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff3cd;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;

  .van-icon {
    font-size: 16px;
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

// 服务详情
.service-details {
  .detail-item {
    margin-top: 16px;

    &:first-child {
      margin-top: 0;
    }

    .service-desc {
      font-size: 15px;
      line-height: 1.8;
      color: #555;
      margin-bottom: 12px;
      word-break: break-all;
      white-space: pre-line;
    }

    .service-images {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-image {
      width: 100%;
      border-radius: 12px;
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

      &.has-title {
        margin-top: 16px;
      }
    }
  }
}
</style>
