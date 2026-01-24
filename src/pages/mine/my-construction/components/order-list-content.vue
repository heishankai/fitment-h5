<template>
  <van-pull-refresh
    :model-value="refreshing"
    @update:model-value="$emit('update:refreshing', $event)"
    @refresh="$emit('refresh')"
    class="refresh"
  >
    <div class="content-wrapper">
      <van-empty
        v-if="!loading && orders.length === 0"
        description="暂无订单"
        class="empty-state fade-in-up"
      />

      <div v-else class="order-list">
        <van-card
          v-for="(order, index) in orders"
          :key="order.id"
          class="order-card fade-in-up shine-effect"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="$emit('go-to-detail', order.id)"
        >
          <template #thumb>
            <div class="work-kind-icon">
              <van-icon name="bag-o" />
            </div>
          </template>
          <template #title>
            <div class="card-title">
              <span class="title-text">{{ order.work_kind_name }}</span>
              <van-tag :type="getStatusType(order.order_status)" round class="status-tag">
                {{ order.order_status_name }}
              </van-tag>
              <!-- 显示订单类型标签 -->
              <van-tag v-if="order.is_assigned" type="warning" plain round class="order-type-tag">
                被分配
              </van-tag>
            </div>
            <div class="card-time" v-if="order.createdAt">
              {{ formatTime(order.createdAt) }}
            </div>
          </template>
          <template #desc>
            <div class="card-desc">
              <div class="desc-row">
                <div class="desc-item">
                  <div class="icon-wrapper">
                    <van-icon name="location-o" />
                  </div>
                  <span class="desc-text">{{
                    order.location ||
                    `${order.province || ''}${order.city || ''}${order.district || ''}`
                  }}</span>
                </div>
              </div>
              <div class="desc-row">
                <div class="desc-item">
                  <div class="icon-wrapper">
                    <van-icon name="home-o" />
                  </div>
                  <span class="desc-text"
                    >{{ order.houseType === 'new' ? '新房' : '老房' }} · {{ order.roomType }} ·
                    {{ order.area }}m²</span
                  >
                </div>
              </div>
              <div class="desc-row" v-if="order.wechat_user">
                <div class="desc-item">
                  <div class="icon-wrapper">
                    <van-icon name="user-o" />
                  </div>
                  <span class="desc-text">{{ order.wechat_user.nickname || '用户' }}</span>
                </div>
              </div>
            </div>
          </template>
        </van-card>
      </div>
    </div>
  </van-pull-refresh>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/index'

defineProps<{
  orders: any[]
  loading: boolean
  refreshing: boolean
}>()

defineEmits<{
  refresh: []
  'update:refreshing': [value: boolean]
  'go-to-detail': [orderId: number]
}>()

// 获取订单状态类型
const getStatusType = (
  status: number
): 'warning' | 'primary' | 'success' | 'danger' | 'default' => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'primary'
    case 3:
      return 'success'
    case 4:
      return 'danger'
    default:
      return 'default'
  }
}
</script>

<style lang="less" scoped>
.refresh {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.van-pull-refresh__track) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.order-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  :deep(.van-card) {
    border-radius: 16px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .work-kind-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 206, 201, 0.25);
    position: relative;
    overflow: hidden;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      animation: shine 3s infinite;
    }

    .van-icon {
      color: #fff;
      font-size: 24px;
      position: relative;
      z-index: 1;
      transition: transform 0.3s ease;
    }
  }

  &:hover .work-kind-icon {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 206, 201, 0.35);

    .van-icon {
      transform: rotate(5deg);
    }
  }

  .card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;

    .title-text {
      font-size: 16px;
      font-weight: 700;
      color: #323233;
      letter-spacing: -0.2px;
      flex: 1;
      min-width: 0;
    }

    .status-tag {
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
    }

    .order-type-tag {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 8px;
      margin-left: 4px;
    }
  }

  .card-time {
    font-size: 11px;
    color: #969799;
    margin-top: 2px;
  }

  .card-desc {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f5f5f5;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .desc-row {
      display: flex;
      align-items: flex-start;
    }

    .desc-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex: 1;
      min-width: 0;
      transition: transform 0.3s ease;

      .icon-wrapper {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, rgba(0, 206, 201, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
        transition:
          transform 0.3s ease,
          background 0.3s ease;

        .van-icon {
          color: #00cec9;
          font-size: 16px;
          transition: transform 0.3s ease;
        }
      }

      &:hover .icon-wrapper {
        transform: scale(1.1);
        background: linear-gradient(
          135deg,
          rgba(0, 206, 201, 0.15) 0%,
          rgba(0, 180, 216, 0.15) 100%
        );

        .van-icon {
          transform: scale(1.1);
        }
      }

      .desc-text {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        color: #646566;
        line-height: 1.6;
        word-break: break-all;
        padding-top: 6px;
      }
    }
  }
}

@keyframes shine {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
