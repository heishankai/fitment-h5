<template>
  <van-cell-group :border="false" class="detail-header">
    <div class="top-row">
      <div class="title-block">
        <div class="title-line">
          <h1>{{ order.work_kind_name || '施工订单' }}</h1>
          <van-tag :type="statusType" round>{{ order.order_status_name }}</van-tag>
          <van-tag v-if="isAssigned" type="warning" plain round>被分配</van-tag>
        </div>

        <div class="sub-line">
          <van-icon name="wap-home-o" />
          <span>{{ order.housing_name || '小区未填写' }}</span>
        </div>
      </div>

      <van-button
        v-if="user?.phone"
        :url="phoneHref"
        type="primary"
        size="small"
        round
        icon="phone"
        class="call-btn"
      >
        {{ user.phone }}
      </van-button>
      <van-tag v-else plain round class="empty-phone">暂无电话</van-tag>
    </div>

    <div class="stats">
      <div v-for="item in statItems" :key="item.label" class="stat-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <van-cell
      v-for="row in detailRows"
      :key="row.icon"
      :icon="row.icon"
      :title="`${row.label}：${row.text}`"
      :border="false"
      :class="['meta-cell', row.className]"
    />
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTime } from '@/utils/index'

const props = defineProps<{
  order: any
  user?: { phone?: string } | null
}>()

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

const phoneHref = computed(() =>
  props.user?.phone ? `tel:${props.user.phone.replace(/[^\d+]/g, '')}` : ''
)

const address = computed(() => {
  const { location, province, city, district } = props.order
  return location || `${province || ''} ${city || ''} ${district || ''}`.trim()
})

const statItems = computed(() => [
  { label: '户型', value: props.order.roomType || '-' },
  { label: '面积', value: props.order.area ? `${props.order.area}m²` : '-' },
  { label: '下单', value: props.order.createdAt ? formatTime(props.order.createdAt) : '-' }
])

const detailRows = computed(() => {
  const rows: Array<{ icon: string; text: string; className?: string; label: string }> = []

  if (address.value) {
    rows.push({ icon: 'location-o', label: '地址', text: address.value })
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

.top-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px 8px;
}

.title-block {
  flex: 1;
  min-width: 0;
}

.title-line,
.sub-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.title-line h1,
.sub-line span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-line h1 {
  flex: 1;
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.sub-line {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 12px;

  .van-icon {
    color: var(--color-primary);
  }
}

.call-btn {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;

  :deep(.van-button__text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.empty-phone {
  color: var(--color-text-placeholder);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 10px 6px;
  overflow: hidden;
  border-radius: 10px;
  background: #f5f8f7;
}

.stat-item {
  min-width: 0;
  padding: 8px 6px;
  text-align: center;

  & + & {
    border-left: 1px solid #e8efec;
  }

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--color-text-secondary);
    font-size: 11px;
  }

  strong {
    margin-top: 2px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 650;
  }
}

.meta-cell {
  padding: 6px 12px 9px;
  color: var(--color-text-secondary);
  background: #fff;

  :deep(.van-cell__left-icon) {
    color: var(--color-primary);
  }

  :deep(.van-cell__title span) {
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.remark-cell {
  color: var(--color-warning);

  :deep(.van-cell__left-icon) {
    color: var(--color-warning);
  }
}
</style>
