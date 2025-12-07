<template>
  <!-- 主工价清单 -->
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
              <van-space>
                <div class="work-kind-tag">
                  {{ price.work_kind?.work_kind_name || '' }}
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
                <span class="unit-text" v-if="price.labour_cost"
                  >/{{ price.labour_cost.labour_cost_name }}</span
                >
              </div>
            </template>
            <template #footer>
              <div class="item-total">
                <span class="total-label">小计：</span>
                <span class="total-value"> ¥{{ calculateItemTotal(price).toFixed(2) }} </span>
              </div>
              <van-tag
                v-if="
                  group.craftsman_user_work_kind_name === '工长' &&
                  price.work_kind?.work_kind_name === '水电'
                "
                :type="price.is_accepted ? 'success' : 'warning'"
                class="status-tag"
              >
                <van-icon :name="price.is_accepted ? 'success' : 'clock-o'" />
                {{ price.is_accepted ? '水电已验收' : '水电待验收' }}
              </van-tag>

              <van-tag
                v-if="
                  group.craftsman_user_work_kind_name === '工长' &&
                  price.work_kind?.work_kind_name === '泥瓦工'
                "
                :type="price.is_accepted ? 'success' : 'warning'"
                class="status-tag"
              >
                <van-icon :name="price.is_accepted ? 'success' : 'clock-o'" />
                {{ price.is_accepted ? '泥瓦工已验收' : '泥瓦工待验收' }}
              </van-tag>
            </template>
          </van-card>
        </div>

        <!-- 价格汇总区域 -->
        <div class="price-summary">
          <!-- 工价合计 -->
          <div class="summary-row">
            <span class="summary-label">工价合计：</span>
            <span class="summary-value">¥{{ Number(group.total_price).toFixed(2) }}</span>
          </div>

          <!-- 工长费用 -->
          <div class="summary-row" v-if="group?.gangmaster_cost">
            <span class="summary-label">工长费用：</span>
            <span class="summary-value service-fee"
              >¥{{ Number(group.gangmaster_cost).toFixed(2) }}</span
            >
          </div>

          <!-- 服务费 -->
          <div class="summary-row" v-if="group.total_service_fee">
            <span class="summary-label">平台服务费：</span>
            <span class="summary-value service-fee"
              >¥{{ Number(calculateGangmasterServiceFee(group)).toFixed(2) }}</span
            >
          </div>

          <!-- 最终总价 -->
          <div class="summary-row final-total">
            <span class="summary-label">总计：</span>
            <span class="summary-value final-price"
              >¥{{ calculateFinalTotal(group).toFixed(2) }}</span
            >
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
        </div>

        <van-divider v-if="groupIndex !== workPrices.length - 1" class="group-divider" />
      </div>
    </div>
  </section>

  <!-- 子工价清单 -->
  <section class="section" v-if="subWorkPrices?.length">
    <detail-section-title title="子工价清单" icon="orders-o" />

    <div class="price-groups sub-work-price-groups">
      <div
        v-for="(group, groupIndex) in subWorkPrices"
        :key="groupIndex"
        class="price-group fade-in-up sub-work-price-group"
        :style="{ animationDelay: `${groupIndex * 0.1}s` }"
      >
        <!-- 子工价组头部信息 -->
        <div class="sub-group-header">
          <div class="header-info">
            <div class="header-title">
              <van-icon name="user-circle-o" class="header-icon" />
              <span class="work-kind-name">{{
                group.craftsman_user_work_kind_name || '未知工种'
              }}</span>
            </div>
            <div class="header-meta">
              <van-tag :type="group.is_paid ? 'success' : 'warning'" plain class="payment-tag">
                <van-icon :name="group.is_paid ? 'checked' : 'clock-o'" />
                {{ group.is_paid ? '已支付' : '未支付' }}
              </van-tag>
            </div>
          </div>
        </div>

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
              <van-space>
                <div class="work-kind-tag">
                  {{ price.work_kind?.work_kind_name || '' }}
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
                <span class="unit-text" v-if="price.labour_cost"
                  >/{{ price.labour_cost.labour_cost_name }}</span
                >
              </div>
            </template>
            <template #footer>
              <div class="item-total">
                <span class="total-label">小计：</span>
                <span class="total-value"> ¥{{ calculateItemTotal(price).toFixed(2) }} </span>
              </div>
            </template>
          </van-card>
        </div>

        <!-- 价格汇总区域 -->
        <div class="price-summary">
          <!-- 工价合计 -->
          <div class="summary-row">
            <span class="summary-label">工价合计：</span>
            <span class="summary-value">¥{{ Number(group.total_price).toFixed(2) }}</span>
          </div>

          <!-- 服务费 -->
          <div class="summary-row" v-if="group.total_service_fee">
            <span class="summary-label">服务费：</span>
            <span class="summary-value service-fee"
              >¥{{ Number(group.total_service_fee).toFixed(2) }}</span
            >
          </div>

          <!-- 访问服务次数 -->
          <div
            class="summary-row"
            v-if="group.visiting_service_num !== undefined && group.visiting_service_num > 0"
          >
            <span class="summary-label">
              <van-icon name="service-o" />
              访问服务次数：
            </span>
            <span class="summary-value">{{ group.visiting_service_num }}次</span>
          </div>

          <!-- 最终总价 -->
          <div class="summary-row final-total">
            <span class="summary-label">总计：</span>
            <span class="summary-value final-price"
              >¥{{ calculateFinalTotal(group).toFixed(2) }}</span
            >
          </div>

          <!-- 接受状态 -->
          <div class="acceptance-status" v-if="group.total_is_accepted !== undefined">
            <van-tag :type="group.total_is_accepted ? 'success' : 'warning'" class="status-tag">
              <van-icon :name="group.total_is_accepted ? 'success' : 'clock-o'" />
              {{ group.total_is_accepted ? '已验收' : '待验收' }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import DetailSectionTitle from '@/components/detail-section-title.vue'

defineProps<{
  workPrices?: any[]
  subWorkPrices?: any[]
}>()

const router = useRouter()
const route = useRoute()

// 计算单项小计（考虑最低价格）
const calculateItemTotal = (price: any): number => {
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

// 计算平台服务费
const calculateGangmasterServiceFee = (group: any): number => {
  const gangmasterCost = parseFloat(String(group?.gangmaster_cost || 0)) || 0
  return gangmasterCost * 0.1 + (group?.total_service_fee || 0)
}

// 计算最终总价（工价合计 + 服务费 + 工长费用 ）
const calculateFinalTotal = (group: any): number => {
  // 施工费用
  const totalPrice = parseFloat(String(group?.total_price)) || 0
  // 平台服务费
  const serviceFee = parseFloat(String(group?.total_service_fee || 0)) || 0
  // 工长费用
  const gangmasterCost = parseFloat(String(group?.gangmaster_cost || 0)) || 0
  // 工长平台服务费 （10%）
  const gangmasterServiceFee = gangmasterCost * 0.1

  return totalPrice + serviceFee + gangmasterCost + gangmasterServiceFee
}

// 跳转详情
const navigateToDetail = (price: any) => {
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

  &.sub-work-price-group {
    gap: 10px;
    background: transparent;
  }
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

.price-summary {
  margin-top: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(0, 206, 201, 0.03) 0%, rgba(0, 180, 216, 0.03) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 206, 201, 0.1);
}

.sub-work-price-group .price-summary {
  margin-top: 8px;
  padding: 12px;
  background: #fff;
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

    :deep(.van-icon) {
      font-size: 14px;
    }
  }
}

.group-divider {
  margin: 16px 0;
  border-color: #f0f0f0;
}

/* 子工价清单样式 */
.sub-work-price-groups {
  gap: 16px;
}

.sub-work-price-group {
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 206, 201, 0.2);
  }

  &:not(:last-child) {
    margin-bottom: 0;
  }
}

.sub-group-header {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(0, 206, 201, 0.05) 0%, rgba(0, 180, 216, 0.05) 100%);
  border-radius: 8px;

  .header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .header-title {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;

      .header-icon {
        font-size: 16px;
        color: #00cec9;
        flex-shrink: 0;
      }

      .work-kind-name {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;

      .payment-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 10px;
        font-weight: 500;

        :deep(.van-icon) {
          font-size: 12px;
        }

        &.van-tag--success {
          background: rgba(7, 193, 96, 0.1);
          color: #07c160;
          border-color: rgba(7, 193, 96, 0.3);
        }

        &.van-tag--warning {
          background: rgba(255, 152, 0, 0.1);
          color: #ff9800;
          border-color: rgba(255, 152, 0, 0.3);
        }
      }
    }
  }
}

.summary-row {
  .summary-label {
    display: flex;
    align-items: center;
    gap: 4px;

    .van-icon {
      font-size: 14px;
      color: #969799;
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
