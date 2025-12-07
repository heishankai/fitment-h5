<template>
  <section class="section" v-if="materials?.length">
    <detail-section-title title="辅材清单" icon="shopping-cart-o" />

    <div class="material-groups">
      <div
        v-for="(group, groupIndex) in materials"
        :key="groupIndex"
        class="material-group fade-in-up"
        :style="{ animationDelay: `${groupIndex * 0.1}s` }"
      >
        <!-- 商品卡片列表 -->
        <div class="commodity-list">
          <van-card
            v-for="(commodity, commodityIndex) in group?.commodity_list"
            :key="commodity.id"
            :title="commodity.commodity_name"
            :thumb="commodity?.commodity_cover?.[0]"
            class="commodity-card fade-in-up shine-effect"
            :style="{ animationDelay: `${groupIndex * 0.1 + commodityIndex * 0.05}s` }"
            @click="navigateToDetail(commodity)"
          >
            <template #price>
              <div class="price-wrapper">
                <span class="unit-price">¥{{ commodity.commodity_price }}</span>
                <span class="unit-text">/{{ commodity.commodity_unit }}</span>
              </div>
            </template>
            <template #tags>
              <van-tag type="primary" plain class="quantity-tag">
                ×{{ commodity.quantity }}
              </van-tag>
            </template>
            <template #footer>
              <div class="item-total">
                <span class="total-label">小计：</span>
                <span class="total-value">
                  ¥{{ (Number(commodity.commodity_price) * commodity.quantity).toFixed(2) }}
                </span>
              </div>
            </template>
          </van-card>
        </div>

        <!-- 小计 -->
        <div class="group-subtotal">
          <span class="subtotal-label">合计：</span>
          <span class="subtotal-price">¥{{ Number(group.total_price).toFixed(2) }}</span>
        </div>

        <!-- 支付状态和验收状态 -->
        <div
          class="acceptance-status"
          v-if="group.is_paid !== undefined || group.total_is_accepted !== undefined"
        >
          <div class="status-tags-wrapper">
            <!-- 支付状态 -->
            <van-tag :type="group.is_paid ? 'success' : 'warning'" class="status-tag">
              <van-icon :name="group.is_paid ? 'checked' : 'clock-o'" />
              {{ group.is_paid ? '已支付' : '未支付' }}
            </van-tag>
            <!-- 验收状态 -->
            <van-tag :type="group.total_is_accepted ? 'success' : 'warning'" class="status-tag">
              <van-icon :name="group.total_is_accepted ? 'success' : 'clock-o'" />
              {{ group.total_is_accepted ? '已验收' : '待验收' }}
            </van-tag>
          </div>
        </div>

        <van-divider v-if="groupIndex !== materials.length - 1" class="group-divider" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import DetailSectionTitle from '@/components/detail-section-title.vue'

interface Commodity {
  id: number
  quantity: number
  commodity_name: string
  commodity_unit: string
  commodity_cover: string | string[]
  commodity_price: string | number
}

interface MaterialGroup {
  total_price: number | string
  commodity_list: Commodity[]
  is_paid?: boolean
  total_is_accepted?: boolean
}

defineProps<{
  materials?: MaterialGroup[]
}>()

const router = useRouter()
const route = useRoute()

// 跳转详情
const navigateToDetail = (commodity: Commodity) => {
  const orderId = route.params.id || route.query.orderId
  router.push({
    path: `/mine/create-material-order/detail/${commodity.id}`,
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

.material-groups {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.material-group {
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

.acceptance-status {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;

  .status-tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .status-tag {
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;

    :deep(.van-icon) {
      font-size: 14px;
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
