<template>
  <section class="section" v-if="commodityList?.length">
    <detail-section-title title="辅材清单" icon="shopping-cart-o" />

    <div class="material-content">
      <!-- 商品卡片列表 -->
      <div class="commodity-list">
        <van-card
          v-for="(commodity, commodityIndex) in commodityList"
          :key="commodity.id"
          :title="commodity.commodity_name"
          :thumb="commodity?.commodity_cover?.[0]"
          class="commodity-card fade-in-up shine-effect"
          :style="{ animationDelay: `${commodityIndex * 0.05}s` }"
          @click="navigateToDetail(commodity)"
        >
          <template #price>
            <div class="price-wrapper">
              <span class="unit-price">¥{{ commodity.commodity_price }}</span>
              <span class="unit-text">/{{ commodity.commodity_unit }}</span>
            </div>
          </template>
          <template #tags>
            <van-tag type="primary" plain class="quantity-tag"> ×{{ commodity.quantity }} </van-tag>
          </template>
          <template #footer>
            <div class="item-total">
              <span class="total-label">小计：</span>
              <span class="total-value">
                ¥{{ Number(commodity.settlement_amount || 0).toFixed(2) }}
              </span>
            </div>
            <!-- 状态标签容器 -->
            <div class="status-tags-container">
              <!-- 支付状态 -->
              <van-tag
                v-if="commodity.is_paid !== undefined"
                :type="commodity.is_paid ? 'success' : 'warning'"
                class="status-tag"
              >
                <van-icon :name="commodity.is_paid ? 'success' : 'clock-o'" />
                {{ commodity.is_paid ? '已支付' : '待支付' }}
              </van-tag>
              <!-- 验收状态 -->
              <van-tag
                v-if="commodity.is_accepted !== undefined"
                :type="commodity.is_accepted ? 'success' : 'warning'"
                class="status-tag"
              >
                <van-icon :name="commodity.is_accepted ? 'success' : 'clock-o'" />
                {{ commodity.is_accepted ? '已验收' : '待验收' }}
              </van-tag>
            </div>
          </template>
        </van-card>
      </div>

      <!-- 价格汇总区域 -->
      <div class="price-summary">
        <!-- 合计 -->
        <div class="summary-row final-total">
          <span class="summary-label">总计：</span>
          <span class="summary-value final-price">¥{{ Number(totalPrice || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DetailSectionTitle from '@/components/detail-section-title.vue'

interface Commodity {
  id: number
  commodity_id: number
  quantity: number
  commodity_name: string
  commodity_unit: string
  commodity_cover: string | string[]
  commodity_price: string | number
  settlement_amount: number
  is_paid?: boolean
  is_accepted?: boolean
}

interface MaterialData {
  commodity_list: Commodity[]
  total_price: number | string
}

const props = defineProps<{
  materials?: MaterialData | MaterialData[]
}>()

const router = useRouter()
const route = useRoute()

// 兼容新旧数据结构：如果是数组，取第一个；如果是对象，直接使用
const materialData = computed(() => {
  if (!props.materials) return null
  if (Array.isArray(props.materials)) {
    return props.materials.length > 0 ? props.materials[0] : null
  }
  return props.materials
})

// 商品列表
const commodityList = computed(() => {
  return materialData.value?.commodity_list || []
})

// 总价
const totalPrice = computed(() => {
  return materialData.value?.total_price || 0
})

// 跳转详情
const navigateToDetail = (commodity: Commodity) => {
  const orderId = route.params.id || route.query.orderId
  // 使用 commodity_id 跳转详情
  const commodityId = commodity.commodity_id || commodity.id
  router.push({
    path: `/mine/create-material-order/detail/${commodityId}`,
    query: orderId ? { orderId: String(orderId) } : undefined
  })
}
</script>

<style lang="less" scoped>
.section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.material-content {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.commodity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.commodity-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
  opacity: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  :deep(.van-card) {
    border-radius: 16px;
    overflow: hidden;
    padding: 16px;
    background: #fff;
  }

  :deep(.van-card__thumb) {
    width: 80px;
    height: 80px;
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

  &:hover :deep(.van-card__thumb img) {
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

  .price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-top: 8px;
  }

  .unit-price {
    font-size: 18px;
    font-weight: 700;
    color: #00cec9;
  }

  .unit-text {
    font-size: 12px;
    color: #969799;
    font-weight: 400;
  }

  :deep(.van-card__tags) {
    margin-top: 8px;
    margin-bottom: 12px;

    .quantity-tag {
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(0, 206, 201, 0.1);
      color: #00cec9;
      border-color: rgba(0, 206, 201, 0.3);
      font-weight: 600;
    }
  }

  :deep(.van-card__footer) {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 6px;

    .total-label {
      font-size: 13px;
      color: #646566;
      font-weight: 500;
    }

    .total-value {
      font-size: 16px;
      font-weight: 700;
      color: #00cec9;
    }
  }

  .status-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
    margin-left: auto;

    .status-tag {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
      margin: 0;

      :deep(.van-icon) {
        font-size: 12px;
      }
    }
  }
}

.price-summary {
  margin-top: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(0, 206, 201, 0.03) 0%, rgba(0, 180, 216, 0.03) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 206, 201, 0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;

  .summary-label {
    color: #646566;
    font-weight: 500;
  }

  .summary-value {
    color: #323233;
    font-weight: 600;
    font-size: 15px;

    &.final-price {
      font-size: 20px;
      font-weight: 700;
      color: #00cec9;
    }
  }

  &.final-total {
    margin-top: 4px;
    padding-top: 12px;
    border-top: 2px solid rgba(0, 206, 201, 0.2);
    border-bottom: none;

    .summary-label {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }
}

/* 动画效果 */
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.4s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
