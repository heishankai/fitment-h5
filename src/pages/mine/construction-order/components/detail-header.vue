<template>
  <van-cell-group :border="false" class="detail-header">
    <van-cell class="header-cell" center :border="false">
      <template #title>
        <span class="order-title">{{ orderTitle }}</span>
        <van-tag :type="statusType" round>{{ statusText }}</van-tag>
        <van-tag v-if="isAssigned" type="warning" plain round>被分配</van-tag>
      </template>

      <template #label>
        <van-icon name="wap-home-o" />
        <span>{{ housingName }}</span>
      </template>

      <template #value>
        <van-button
          v-if="contactPhone"
          type="primary"
          size="small"
          round
          icon="phone"
          class="call-btn"
          @click="handleCallPhone"
        >
          {{ contactPhone }}
        </van-button>
        <van-tag v-else plain round class="empty-phone">暂无电话</van-tag>
      </template>
    </van-cell>

    <van-grid :column-num="3" :border="false" class="stats-grid">
      <van-grid-item v-for="item in statItems" :key="item.label">
        <span class="stat-label">{{ item.label }}</span>
        <strong class="stat-value">{{ item.value }}</strong>
      </van-grid-item>
    </van-grid>

    <van-cell
      v-for="row in detailRows"
      :key="row.icon"
      :icon="row.icon"
      :title="row.label"
      :label="row.text"
      :border="false"
      :class="['meta-cell', row.className]"
    />
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showToast } from 'vant'
import { callPhone, formatTime } from '@/utils/index'
import type { OrderDetail, WechatUser } from '../type'

const props = defineProps<{
  order: OrderDetail
  contactUser?: WechatUser | null
}>()

const orderTitle = computed(() => props.order.work_kind_name || '施工订单')
const statusText = computed(() => props.order.order_status_name || '待处理')
const housingName = computed(() => props.order.housing_name || '小区未填写')
const contactPhone = computed(() => props.contactUser?.phone || '')

// 订单状态只负责控制标签颜色，展示文案直接使用接口返回的名称。
const statusType = computed(() => {
  const statusMap = {
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'danger'
  } as const

  return statusMap[props.order.order_status as keyof typeof statusMap] || 'default'
})

const isAssigned = computed(() => props.order.is_assigned || props.order.is_assigned_order)

const handleCallPhone = async () => {
  const success = await callPhone(contactPhone.value)
  if (!success) {
    showToast('暂无可拨打的电话')
  }
}

// 地址优先使用接口里的 location；没有时再拼省市区。
const address = computed(() => {
  const { location, province, city, district } = props.order
  return location || `${province || ''} ${city || ''} ${district || ''}`.trim()
})

// 概览数据集中到数组里，模板直接渲染，减少重复结构。
const statItems = computed(() => [
  { label: '户型', value: props.order.roomType || '-' },
  { label: '面积', value: props.order.area ? `${props.order.area}m²` : '-' },
  { label: '下单', value: props.order.createdAt ? formatTime(props.order.createdAt) : '-' }
])

// 地址和备注是可选信息，只有接口存在时才展示。
const detailRows = computed(() => {
  const rows: Array<{ icon: string; text: string; className?: string; label: string }> = []

  if (address.value) {
    rows.push({ icon: 'location-o', label: '地址', text: address.value, className: 'address-cell' })
  }

  if (props.order.remark) {
    rows.push({
      icon: 'description-o',
      label: '备注',
      text: props.order.remark,
      className: 'remark-cell'
    })
  }

  return rows
})
</script>

<style lang="less" scoped>
.detail-header {
  overflow: hidden;
  margin-bottom: 10px;
  border: 1px solid #edf2f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(30, 34, 34, 0.05);
}

.header-cell {
  padding: 12px;

  :deep(.van-cell__title) {
    display: flex;
    min-width: 0;
    gap: 6px;
    align-items: center;
  }

  :deep(.van-cell__label) {
    display: flex;
    min-width: 0;
    gap: 5px;
    align-items: center;
    margin-top: 5px;
    color: var(--color-text-secondary);
    font-size: 12px;
  }

  :deep(.van-cell__label span) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.van-cell__label .van-icon) {
    flex: none;
    color: var(--color-primary);
  }

  :deep(.van-cell__value) {
    flex: none;
    max-width: 120px;
    margin-left: 10px;
  }
}

.call-btn {
  max-width: 120px;
  height: 32px;
  padding: 0 10px;
  font-size: 12px;

  :deep(.van-button__text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.order-title {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-phone {
  color: var(--color-text-placeholder);
}

.stats-grid {
  margin: 0 10px 6px;
  overflow: hidden;
  border-radius: 10px;
  background: #f5f8f7;

  :deep(.van-grid-item__content) {
    padding: 9px 4px;
    background: transparent;
  }

  :deep(.van-grid-item + .van-grid-item .van-grid-item__content) {
    border-left: 1px solid #e8efec;
  }
}

.stat-label,
.stat-value {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 11px;
}

.stat-value {
  margin-top: 2px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.meta-cell {
  padding: 8px 12px 10px;
  color: var(--color-text-secondary);
  background: #fff;

  :deep(.van-cell__left-icon) {
    color: var(--color-primary);
  }

  :deep(.van-cell__title span) {
    font-size: 12px;
    font-weight: 600;
  }

  :deep(.van-cell__label) {
    overflow: hidden;
    margin-top: 3px;
    color: var(--color-text-secondary);
    font-size: 12px;
    line-height: 1.45;
    text-overflow: ellipsis;
  }
}

.remark-cell {
  color: var(--color-warning);

  :deep(.van-cell__left-icon) {
    color: var(--color-warning);
  }
}
</style>
