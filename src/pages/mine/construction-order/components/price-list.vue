<template>
  <!-- 主工价清单 -->
  <section class="section" v-if="parentWorkPriceGroups?.length">
    <detail-section-title title="工价清单" icon="bag-o" />

    <div class="price-list">
      <van-card
        v-for="(price, priceIndex) in parentWorkPriceGroups"
        :key="price.id"
        :title="price.work_title"
        :thumb="price?.display_images?.[0]"
        class="price-card fade-in-up shine-effect"
        :style="{ animationDelay: `${priceIndex * 0.05}s` }"
        @click="navigateToDetail(price)"
      >
        <template #desc>
          <van-space>
            <div class="work-kind-tag">
              {{ price.work_kind_name || '' }}
            </div>
            <van-tag type="primary" plain class="quantity-tag"> ×{{ price.quantity }} </van-tag>
          </van-space>
        </template>

        <template #origin-price>
          <van-tag
            v-if="price.is_set_minimum_price === '1' && price.minimum_price"
            type="warning"
            plain
            class="minimum-price-tag"
          >
            最低¥{{ price.minimum_price }}
          </van-tag>
        </template>
        <template #price>
          <div class="price-wrapper">
            <span class="unit-price">¥{{ price.work_price }}</span>
            <span class="unit-text" v-if="price.labour_cost_name"
              >/{{ price.labour_cost_name }}</span
            >
          </div>
        </template>
        <template #footer>
          <div class="item-total">
            <span class="total-label">小计：</span>
            <span class="total-value">
              ¥{{ Number(price.settlement_amount || 0).toFixed(2) }}
            </span>
          </div>
          <!-- 状态标签容器 -->
          <div class="status-tags-container">
            <!-- 分配工匠信息 -->
            <van-tag
              v-if="price.is_assigned"
              type="primary"
              class="status-tag assigned-craftsman-tag"
            >
              <van-icon name="user-circle-o" />
              <span v-if="price.assigned_craftsman">
                已分配：{{ price.assigned_craftsman.nickname }} ({{
                  price.assigned_craftsman.phone
                }})
              </span>
            </van-tag>
            <!-- 验收状态 -->
            <van-tag
              v-if="price.is_accepted !== undefined"
              :type="price.is_accepted ? 'success' : 'warning'"
              class="status-tag"
            >
              <van-icon :name="price.is_accepted ? 'success' : 'clock-o'" />
              {{ price.is_accepted ? '已验收' : '待验收' }}
            </van-tag>
            <!-- 支付状态 -->
            <van-tag
              v-if="price.is_paid !== undefined"
              :type="price.is_paid ? 'success' : 'warning'"
              class="status-tag"
            >
              <van-icon :name="price.is_paid ? 'success' : 'clock-o'" />
              {{ price.is_paid ? '已支付' : '待支付' }}
            </van-tag>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 价格汇总区域 -->
    <div class="price-summary">
      <!-- 工价合计 -->
      <div class="summary-row">
        <span class="summary-label">工价合计：</span>
        <span class="summary-value">¥{{ Number(orderInfo?.total_price || 0).toFixed(2) }}</span>
      </div>

      <!-- 工长费用 -->
      <div class="summary-row" v-if="orderInfo?.gangmaster_cost">
        <span class="summary-label">工长工费：</span>
        <span class="summary-value service-fee"
          >¥{{ Number(orderInfo.gangmaster_cost).toFixed(2) }}</span
        >
      </div>

      <!-- 上门服务数量 -->
      <div
        class="summary-row"
        v-if="orderInfo?.visiting_service_num !== undefined && orderInfo.visiting_service_num > 0"
      >
        <span class="summary-label"> 上门服务数量： </span>
        <span class="summary-value">{{ orderInfo.visiting_service_num }}次</span>
      </div>

      <!-- 平台服务费 -->
      <div class="summary-row">
        <span class="summary-label">平台服务费：</span>
        <span class="summary-value service-fee"
          >¥{{ calculatePlatformServiceFee(orderInfo).toFixed(2) }}</span
        >
      </div>

      <!-- 最终总价 -->
      <div class="summary-row final-total">
        <span class="summary-label">总计：</span>
        <span class="summary-value final-price"
          >¥{{ calculateFinalTotal(orderInfo).toFixed(2) }}</span
        >
      </div>

      <!-- 支付状态和验收状态 -->
      <div class="acceptance-status">
        <div class="status-tags-wrapper">
          <!-- 支付状态 -->
          <van-tag :type="orderInfo?.is_paid ? 'success' : 'warning'" class="status-tag">
            <van-icon :name="orderInfo?.is_paid ? 'checked' : 'clock-o'" />
            {{ orderInfo?.is_paid ? '已支付' : '未支付' }}
          </van-tag>
          <!-- 验收状态 -->
          <van-tag :type="orderInfo?.total_is_accepted ? 'success' : 'warning'" class="status-tag">
            <van-icon :name="orderInfo?.total_is_accepted ? 'success' : 'clock-o'" />
            {{ orderInfo?.total_is_accepted ? '已验收' : '待验收' }}
          </van-tag>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import DetailSectionTitle from '@/components/detail-section-title.vue'

defineProps<{
  parentWorkPriceGroups?: any[]
  orderInfo?: any
}>()

const router = useRouter()
const route = useRoute()

// 计算平台服务费：(total_price + gangmaster_cost) * 10%
const calculatePlatformServiceFee = (orderInfo: any): number => {
  const totalPrice = parseFloat(String(orderInfo?.total_price || 0)) || 0
  const gangmasterCost = parseFloat(String(orderInfo?.gangmaster_cost || 0)) || 0
  return (totalPrice + gangmasterCost) * 0.1
}

// 计算最终总价（工价合计 + 工长工费 + 平台服务费）
const calculateFinalTotal = (orderInfo: any): number => {
  // 工价合计
  const totalPrice = parseFloat(String(orderInfo?.total_price || 0)) || 0
  // 工长工费
  const gangmasterCost = parseFloat(String(orderInfo?.gangmaster_cost || 0)) || 0
  // 平台服务费
  const platformServiceFee = calculatePlatformServiceFee(orderInfo)

  return totalPrice + gangmasterCost + platformServiceFee
}

// 跳转详情
const navigateToDetail = (price: any) => {
  const orderId = route.params.id || route.query.orderId
  // 使用 work_price_id 跳转详情
  const priceId = price.work_price_id || price.id
  router.push({
    path: `/mine/foreman-price/detail/${priceId}`,
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

    .assigned-craftsman-tag {
      background: linear-gradient(135deg, rgba(0, 206, 201, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%);
      color: #00cec9;
      border-color: rgba(0, 206, 201, 0.3);
      font-weight: 500;
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

  &:not(:last-child) {
    border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
  }

  .summary-label {
    color: #646566;
    font-weight: 500;
  }

  .summary-value {
    color: #323233;
    font-weight: 600;
    font-size: 15px;

    &.service-fee {
      color: #969799;
      font-size: 14px;
    }

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
    margin-top: 8px;

    :deep(.van-icon) {
      font-size: 14px;
    }
  }

  .assigned-craftsman-tag {
    background: linear-gradient(135deg, rgba(0, 206, 201, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%);
    color: #00cec9;
    border-color: rgba(0, 206, 201, 0.3);
    font-weight: 600;
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
