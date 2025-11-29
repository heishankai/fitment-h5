<template>
  <header class="detail-header">
    <div class="header-content">
      <div class="work-kind-section">
        <div class="work-kind-icon" aria-hidden="true">
          <van-icon name="bag-o" />
        </div>
        <div class="work-kind-info">
          <h1 class="work-kind-name">{{ order.work_kind_name }}</h1>
          <van-tag :type="getStatusType(order.order_status)" round class="status-tag">
            {{ order.order_status_name }}
          </van-tag>
        </div>
      </div>
      <time class="order-time" v-if="order.createdAt" :datetime="order.createdAt">
        {{ formatTime(order.createdAt) }}
      </time>
    </div>
  </header>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/index'

defineProps<{
  order: {
    work_kind_name: string
    order_status: number
    order_status_name: string
    createdAt?: string
  }
}>()

// 获取订单状态类型
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning' // 待接单
    case 2:
      return 'primary' // 已接单
    case 3:
      return 'success' // 已完成
    case 4:
      return 'danger' // 已取消
    default:
      return 'default'
  }
}
</script>

<style lang="less" scoped>
.detail-header {
  background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  color: #fff;

  .header-content {
    .work-kind-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .work-kind-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .van-icon {
          font-size: 24px;
          color: #fff;
        }
      }

      .work-kind-info {
        flex: 1;

        .work-kind-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .status-tag {
          font-weight: 600;
        }
      }
    }

    .order-time {
      display: block;
      font-size: 12px;
      opacity: 0.9;
    }
  }
}
</style>
