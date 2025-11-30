<template>
  <section class="section" v-if="workPrices?.length">
    <detail-section-title title="工价清单" icon="bag-o" />

    <div class="price-groups">
      <div
        v-for="(group, groupIndex) in workPrices"
        :key="groupIndex"
        class="price-group fade-in-up"
        :style="{ animationDelay: `${groupIndex * 0.1}s` }"
      >
        <!-- 工价卡片列表 -->
        <div class="price-list">
          <van-card
            v-for="(price, priceIndex) in group?.prices_list"
            :key="price.id"
            :title="price.work_title"
            :thumb="price?.display_images?.[0]"
            class="price-card fade-in-up shine-effect"
            :style="{ animationDelay: `${groupIndex * 0.1 + priceIndex * 0.05}s` }"
            @click="navigateToDetail(price)"
          >
            <template #desc>
              <div class="work-kind-tag">
                {{ price.work_kind?.work_kind_name || '' }}
              </div>
            </template>
            <template #price>
              <div class="price-wrapper">
                <span class="unit-price">¥{{ price.work_price }}</span>
                <span class="unit-text" v-if="price.labour_cost"
                  >/{{ price.labour_cost.labour_cost_name }}</span
                >
              </div>
            </template>
            <template #tags>
              <van-tag type="primary" plain class="quantity-tag"> ×{{ price.quantity }} </van-tag>
              <van-tag
                v-if="price.is_set_minimum_price === '1' && price.minimum_price"
                type="warning"
                plain
                class="minimum-price-tag"
              >
                最低¥{{ price.minimum_price }}
              </van-tag>
            </template>
            <template #footer>
              <div class="item-total">
                <span class="total-label">小计：</span>
                <span class="total-value"> ¥{{ calculateItemTotal(price).toFixed(2) }} </span>
              </div>
            </template>
          </van-card>
        </div>

        <!-- 小计 -->
        <div class="group-subtotal">
          <span class="subtotal-label">合计：</span>
          <span class="subtotal-price">¥{{ Number(group.total_price).toFixed(2) }}</span>
        </div>

        <van-divider v-if="groupIndex !== workPrices.length - 1" class="group-divider" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import DetailSectionTitle from '@/components/detail-section-title.vue'

interface WorkKind {
  id: number
  work_kind_name: string
}

interface LabourCost {
  id: number
  labour_cost_name: string
}

interface PriceItem {
  id: number
  quantity: number
  work_kind_id: number
  work_title: string
  work_price: string
  labour_cost_id?: number
  labour_cost?: LabourCost
  work_kind?: WorkKind
  minimum_price?: string
  is_set_minimum_price?: string
  display_images?: string[]
  service_scope?: string
  pricing_description?: string
  service_details?: any[]
}

interface PriceGroup {
  total_price: number | string
  prices_list: PriceItem[]
}

defineProps<{
  workPrices?: PriceGroup[]
}>()

const router = useRouter()
const route = useRoute()

// 计算单项小计（考虑最低价格）
const calculateItemTotal = (price: PriceItem): number => {
  const unitPrice = parseFloat(String(price.work_price)) || 0
  const quantity = price.quantity || 1
  const itemTotal = unitPrice * quantity

  // 如果设置了最低价格，且合计低于最低价格，则使用最低价格
  const hasMinimumPrice =
    String(price.is_set_minimum_price) === '1' || Number(price.is_set_minimum_price) === 1
  if (hasMinimumPrice && price.minimum_price) {
    const minimumPrice = parseFloat(String(price.minimum_price)) || 0
    return itemTotal >= minimumPrice ? itemTotal : minimumPrice
  }

  return itemTotal
}

// 跳转详情
const navigateToDetail = (price: PriceItem) => {
  const orderId = route.params.id || route.query.orderId
  router.push({
    path: `/mine/foreman-price/detail/${price.id}`,
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

.price-groups {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.price-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-card {
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

  .work-kind-tag {
    display: inline-block;
    background: linear-gradient(135deg, rgba(0, 206, 201, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%);
    color: #00cec9;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-top: 8px;
    margin-bottom: 12px;
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
    margin-top: 0;
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .van-tag {
      margin: 0;
    }

    .quantity-tag {
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(0, 206, 201, 0.1);
      color: #00cec9;
      border-color: rgba(0, 206, 201, 0.3);
      font-weight: 600;
    }

    .minimum-price-tag {
      font-size: 11px;
      padding: 4px 8px;
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
      border-color: rgba(255, 152, 0, 0.3);
      font-weight: 500;
    }
  }

  :deep(.van-card__footer) {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
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
}

.group-subtotal {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(0, 206, 201, 0.05) 0%, rgba(0, 180, 216, 0.05) 100%);
  border-radius: 12px;
  margin-top: 4px;

  .subtotal-label {
    font-size: 15px;
    color: #646566;
    font-weight: 500;
  }

  .subtotal-price {
    font-size: 20px;
    font-weight: 700;
    color: #00cec9;
  }
}

.group-divider {
  margin: 16px 0;
  border-color: #f0f0f0;
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
