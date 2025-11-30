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

      <!-- 用户信息 -->
      <div class="user-section" v-if="user">
        <van-image
          :src="user.avatar || 'https://via.placeholder.com/40'"
          round
          width="40"
          height="40"
          fit="cover"
          class="user-avatar"
          :alt="`${user.nickname || '用户'}的头像`"
        />
        <div class="user-info">
          <div class="user-name">{{ user.nickname || '用户' }}</div>
          <a v-if="user.phone" :href="`tel:${user.phone}`" class="user-phone">
            <van-icon name="phone-o" />
            <span>{{ encryptPhone(user.phone) }}</span>
          </a>
        </div>
      </div>

      <time class="order-time" v-if="order.createdAt" :datetime="order.createdAt">
        {{ formatTime(order.createdAt) }}
      </time>
    </div>
  </header>
</template>

<script setup lang="ts">
import { formatTime, encryptPhone } from '@/utils/index'

defineProps<{
  order: {
    work_kind_name: string
    order_status: number
    order_status_name: string
    createdAt?: string
  }
  user?: {
    avatar?: string
    nickname?: string
    phone?: string
  } | null
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
  padding: 16px 20px;
  margin-bottom: 12px;
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
        flex-shrink: 0;

        .van-icon {
          font-size: 24px;
          color: #fff;
        }
      }

      .work-kind-info {
        flex: 1;
        min-width: 0;

        .work-kind-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .status-tag {
          font-weight: 600;
        }
      }
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      margin-bottom: 12px;

      .user-avatar {
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .user-phone {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.8;
          }

          &:active {
            opacity: 0.7;
          }

          .van-icon {
            font-size: 14px;
          }
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
