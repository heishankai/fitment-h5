<template>
  <div class="header-content">
    <div class="header-top">
      <div class="title-wrapper">
        <div class="icon-circle">
          <van-icon name="orders-o" class="title-icon" />
        </div>
        <div class="title-group">
          <div class="title">抢单中心</div>
          <div class="subtitle">实时接收订单</div>
        </div>
      </div>
      <van-badge
        v-if="newOrderCount > 0"
        :content="newOrderCount"
        class="badge fade-in-up"
        :style="{ animationDelay: '0.1s' }"
      >
        <div class="new-order-badge bounce" @click="$emit('clear-new-order-count')">
          <van-icon name="bell" />
          <span>新订单</span>
        </div>
      </van-badge>
    </div>

    <!-- 当前位置信息 -->
    <div
      v-if="location?.address"
      class="location-wrapper fade-in-up"
      :style="{ animationDelay: '0.2s' }"
      @click.stop="$emit('open-map-picker')"
    >
      <div class="location-card shine-effect">
        <div class="location-icon-wrapper">
          <van-icon name="location-o" class="location-icon" />
          <div class="location-pulse"></div>
        </div>
        <div class="location-content">
          <div class="location-text">{{ location.address }}</div>
          <div class="location-detail" v-if="location.formattedAddress">
            {{ location.formattedAddress }}
          </div>
        </div>
        <div class="location-status">
          <van-icon name="arrow" class="arrow-icon" />
        </div>
      </div>
    </div>
    <div
      v-else-if="currentLocation"
      class="location-loading fade-in-up"
      :style="{ animationDelay: '0.2s' }"
    >
      <div class="location-card">
        <van-loading size="16px" color="#00cec9" />
        <span class="loading-text">定位中...</span>
      </div>
    </div>
    <div
      v-else
      class="location-empty fade-in-up"
      :style="{ animationDelay: '0.2s' }"
      @click.stop="$emit('open-map-picker')"
    >
      <div class="location-card">
        <van-icon name="location-o" class="location-icon-empty" />
        <span class="empty-text">点击选择位置</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  newOrderCount: number
  location?: any
  currentLocation?: any
}>()

defineEmits<{
  'clear-new-order-count': []
  'load-current-location': []
  'open-map-picker': []
}>()
</script>

<style lang="less" scoped>
.header-content {
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;

      .icon-circle {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          animation: shine 3s infinite;
          z-index: 0;
        }

        .title-icon {
          font-size: 28px;
          color: #fff;
          transition: transform 0.3s ease;
          position: relative;
          z-index: 1;
        }
      }

      .title-wrapper:hover .icon-circle {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);

        .title-icon {
          transform: rotate(5deg);
        }
      }

      .title-group {
        flex: 1;
        min-width: 0;

        .title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 400;
          line-height: 1.4;
        }
      }
    }

    .badge {
      flex-shrink: 0;

      .new-order-badge {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        padding: 8px 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;

        &:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  .location-wrapper {
    position: relative;
    z-index: 1;
    margin-top: 12px;

    .location-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: scale(0.98);
      }

      .location-icon-wrapper {
        position: relative;
        flex-shrink: 0;

        .location-icon {
          color: #00cec9;
          font-size: 22px;
          position: relative;
          z-index: 1;
        }

        .location-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          background: rgba(0, 206, 201, 0.2);
          border-radius: 50%;
          animation: pulse-ring 2s ease-in-out infinite;
        }
      }

      .location-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .location-text {
          font-weight: 600;
          color: #323233;
          font-size: 15px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .location-detail {
          color: #969799;
          font-size: 12px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      }

      .location-status {
        flex-shrink: 0;

        .arrow-icon {
          color: #969799;
          font-size: 16px;
        }
      }
    }
  }

  .location-loading {
    position: relative;
    z-index: 1;
    margin-top: 12px;

    .location-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      .loading-text {
        font-size: 14px;
        color: #969799;
      }
    }
  }

  .location-empty {
    position: relative;
    z-index: 1;
    margin-top: 12px;

    .location-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: scale(0.98);
      }

      .location-icon-empty {
        color: #00cec9;
        font-size: 20px;
      }

      .empty-text {
        font-size: 14px;
        color: #646566;
        font-weight: 500;
      }
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.4);
      opacity: 0;
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
}
</style>
