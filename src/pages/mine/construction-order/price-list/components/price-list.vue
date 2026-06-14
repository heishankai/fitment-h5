<template>
  <section v-if="priceItems.length" class="section">
    <detail-section-title title="工价清单" icon="bag-o" />

    <div class="price-list">
      <van-card
        v-for="item in priceItems"
        :key="item.key"
        :title="item.title"
        :thumb="item.thumb"
        class="price-card fade-in-up"
        :style="{ animationDelay: item.animationDelay }"
        @click="navigateToDetail(item.raw)"
      >
        <template #tags>
          <van-space wrap class="price-tags">
            <van-tag type="primary" plain>{{ item.workKind }}</van-tag>
            <van-tag type="primary" plain>×{{ item.quantity }}</van-tag>
            <van-tag v-if="item.minimumPrice" type="warning" plain>
              最低 ¥{{ item.minimumPrice }}
            </van-tag>
          </van-space>
        </template>

        <template #price>
          <span class="price-value">¥{{ item.workPrice }}</span>
          <span v-if="item.unit" class="price-unit">/{{ item.unit }}</span>
        </template>

        <template #footer>
          <div class="item-total">
            <span>小计</span>
            <strong>¥{{ item.settlement }}</strong>
          </div>

          <div v-if="item.assignedTag || item.statusTags.length" class="status-row">
            <van-tag
              v-if="item.assignedTag"
              class="assigned-tag"
              :type="item.assignedTag.type"
              :plain="item.assignedTag.plain"
              :icon="item.assignedTag.icon"
            >
              {{ item.assignedTag.text }}
            </van-tag>

            <van-space v-if="item.statusTags.length" wrap class="status-tags">
              <van-tag
                v-for="tag in item.statusTags"
                :key="tag.key"
                :type="tag.type"
                :plain="tag.plain"
                :icon="tag.icon"
              >
                {{ tag.text }}
              </van-tag>
            </van-space>
          </div>
        </template>
      </van-card>
    </div>

    <van-cell-group inset class="summary-card">
      <van-cell v-for="row in summaryRows" :key="row.key" :title="row.label">
        <template #value>
          <van-space class="summary-value" align="center">
            <van-tag v-if="row.isPaid" type="success" plain>已支付</van-tag>
            <span :class="['summary-amount', { highlight: row.isTotal }]">
              ¥{{ formatMoney(row.amount) }}
            </span>
          </van-space>
        </template>
      </van-cell>

      <van-cell title="订单状态" :border="false" class="order-status">
        <template #value>
          <van-space wrap>
            <van-tag :type="paymentTag.type" :icon="paymentTag.icon">{{ paymentTag.text }}</van-tag>
            <van-tag :type="acceptanceTag.type" :icon="acceptanceTag.icon">
              {{ acceptanceTag.text }}
            </van-tag>
          </van-space>
        </template>
      </van-cell>
    </van-cell-group>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DetailSectionTitle from '@/components/detail-section-title.vue'
import type { OrderDetail, WorkPriceGroup } from '../type'

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'default'

type StatusTag = {
  key: string
  text: string
  type: TagType
  icon?: string
  plain?: boolean
}

type SummaryRow = {
  key: string
  label: string
  amount: number | string | undefined
  isPaid?: boolean
  isTotal?: boolean
}

const props = defineProps<{
  parentWorkPriceGroups?: WorkPriceGroup[]
  orderInfo?: OrderDetail
}>()

const router = useRouter()
const route = useRoute()

/** 金额统一展示为两位小数，避免模板里反复写 Number(...).toFixed(...)。 */
const formatMoney = (value: unknown): string => {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

/** 分配工匠单独展示在状态行左侧，避免和验收/支付标签互相挤压。 */
const getAssignedTag = (price: WorkPriceGroup): StatusTag | null => {
  if (!price.assigned_craftsman_id) return null

  const craftsman = price.assigned_craftsman
  const name = craftsman?.nickname || `工匠 ${price.assigned_craftsman_id}`
  const phone = craftsman?.phone ? `（${craftsman.phone}）` : ''

  return {
    key: 'assigned',
    text: `已分配：${name}${phone}`,
    type: 'primary',
    icon: 'user-circle-o',
    plain: true
  }
}

/** 验收和支付状态集中生成，模板只需要循环 tag。 */
const getStatusTags = (price: WorkPriceGroup): StatusTag[] => {
  const tags: StatusTag[] = []

  if (price.is_accepted !== undefined) {
    tags.push({
      key: 'accepted',
      text: price.is_accepted ? '已验收' : '待验收',
      type: price.is_accepted ? 'success' : 'warning',
      icon: price.is_accepted ? 'success' : 'clock-o',
      plain: true
    })
  }

  if (price.is_paid !== undefined) {
    tags.push({
      key: 'paid',
      text: price.is_paid ? '已支付' : '待支付',
      type: price.is_paid ? 'success' : 'warning',
      icon: price.is_paid ? 'checked' : 'clock-o',
      plain: true
    })
  }

  return tags
}

/** 把接口工价整理成卡片数据，减少模板里的字段判断。 */
const priceItems = computed(() => {
  return (props.parentWorkPriceGroups || []).map((price, index) => ({
    key: String(price.id ?? price.work_price_id ?? index),
    raw: price,
    title: price.work_title || '未命名工价',
    thumb: price.display_images?.[0],
    workKind: price.work_kind_name || '工种未设置',
    quantity: price.quantity ?? 0,
    unit: price.labour_cost_name || '',
    workPrice: formatMoney(price.work_price),
    settlement: formatMoney(price.settlement_amount),
    minimumPrice:
      String(price.is_set_minimum_price) === '1' && price.minimum_price
        ? formatMoney(price.minimum_price)
        : '',
    assignedTag: getAssignedTag(price),
    statusTags: getStatusTags(price),
    animationDelay: `${index * 0.05}s`
  }))
})

/** 平台服务费和工长工费都是详情接口给出的费用明细，只负责转成展示行。 */
const serviceFeeRows = computed<SummaryRow[]>(() => {
  const platformRows = (props.orderInfo?.total_service_fee_details || []).map(
    (item, index, all) => ({
      key: `service-${index}`,
      label: all.length > 1 ? `平台服务费 (${index + 1})` : '平台服务费',
      amount: item.amount,
      isPaid: item.is_paid
    })
  )

  if (props.orderInfo?.order_type !== 'gangmaster') return platformRows

  const visiting = props.orderInfo?.visiting_service_num ?? 0
  const gangmasterRows = (props.orderInfo?.gangmaster_cost_details || []).map(
    (item, index, all) => ({
      key: `gangmaster-${index}`,
      label:
        all.length > 1
          ? index === 0
            ? `工长工费 (${index + 1}) (上门${visiting}次)`
            : `工长工费 (${index + 1})`
          : `工长工费 (上门${visiting}次)`,
      amount: item.amount,
      isPaid: item.is_paid
    })
  )

  return [...platformRows, ...gangmasterRows]
})

/** 汇总区统一在这里组装，最终总价直接使用后端聚合字段。 */
const summaryRows = computed<SummaryRow[]>(() => [
  { key: 'work-total', label: '工价合计', amount: props.orderInfo?.total_price },
  ...serviceFeeRows.value,
  {
    key: 'grand-total',
    label: '总计',
    amount: props.orderInfo?.all_total_price ?? props.orderInfo?.total_price,
    isTotal: true
  }
])

const paymentTag = computed<StatusTag>(() => ({
  key: 'payment',
  text: props.orderInfo?.is_paid ? '已支付' : '未支付',
  type: props.orderInfo?.is_paid ? 'success' : 'warning',
  icon: props.orderInfo?.is_paid ? 'checked' : 'clock-o'
}))

const acceptanceTag = computed<StatusTag>(() => ({
  key: 'acceptance',
  text: props.orderInfo?.total_is_accepted ? '已验收' : '待验收',
  type: props.orderInfo?.total_is_accepted ? 'success' : 'warning',
  icon: props.orderInfo?.total_is_accepted ? 'success' : 'clock-o'
}))

/** 工价卡片点击进入工价详情，保留当前订单 ID 作为查询参数。 */
const navigateToDetail = (price: WorkPriceGroup) => {
  const orderId = route.params.id || route.query.orderId
  const priceId = price.work_price_id || price.id

  router.push({
    path: `/mine/foreman-price/detail/${priceId}`,
    query: orderId ? { orderId: String(orderId) } : undefined
  })
}
</script>

<style lang="less" scoped>
.section {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid #edf2f0;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(30, 34, 34, 0.05);
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.price-card {
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(30, 34, 34, 0.06);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:active {
    transform: scale(0.99);
  }

  :deep(.van-card) {
    padding: 12px;
    background: #fff;
  }

  :deep(.van-card__thumb) {
    width: 72px;
    height: 72px;
    overflow: hidden;
    border-radius: 10px;
  }

  :deep(.van-card__footer) {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f3f2;
    text-align: initial;
  }

  :deep(.van-card__title) {
    display: -webkit-box;
    overflow: hidden;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 650;
    line-height: 1.45;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

.price-tags {
  margin-top: 7px;
}

.price-value {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 700;
}

.price-unit {
  margin-left: 3px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.item-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-secondary);
  font-size: 14px;

  strong {
    color: var(--color-primary);
    font-size: 16px;
    font-weight: 700;
  }
}

.status-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 9px;
}

.assigned-tag {
  min-width: 0;
  max-width: 100%;
  flex: 1;

  :deep(.van-tag__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.status-tags {
  flex: none;
  justify-content: flex-end;
  max-width: 128px;
}

.summary-card {
  margin: 14px 0 0;
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb), 0.03) 0%,
    rgba(0, 180, 216, 0.03) 100%
  );

  :deep(.van-cell) {
    padding: 10px 12px;
    background: transparent;
  }

  :deep(.van-cell__title) {
    color: var(--color-text-secondary);
    font-weight: 500;
  }
}

.summary-value {
  justify-content: flex-end;
}

.summary-amount {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 650;

  &.highlight {
    color: var(--color-primary);
    font-size: 19px;
    font-weight: 800;
  }
}

.order-status {
  :deep(.van-cell__title) {
    color: var(--color-text);
    font-weight: 650;
  }
}

.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.35s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
