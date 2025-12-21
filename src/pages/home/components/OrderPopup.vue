<template>
  <van-popup
    v-model:show="visible"
    position="top"
    :style="{ height: 'auto', maxHeight: '85vh' }"
    round
    closeable
    close-icon-position="top-right"
    @close="handleClose"
    class="top-popup"
    :close-on-click-overlay="false"
  >
    <div class="order-popup">
      <!-- 顶部装饰条 -->
      <div class="popup-decoration">
        <div class="decoration-dot"></div>
        <div class="decoration-dot"></div>
        <div class="decoration-dot"></div>
      </div>

      <div class="popup-header">
        <div class="header-bg"></div>
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <van-icon name="bell" class="bell-icon" />
              <div class="icon-pulse"></div>
            </div>
            <div class="title-content">
              <h3 class="popup-title">🎉 新订单来了</h3>
              <div class="popup-subtitle">附近有新的订单需求，快来抢单吧</div>
            </div>
          </div>
          <van-tag type="warning" size="large" round class="status-tag">
            <van-icon name="fire" />
            待接单
          </van-tag>
        </div>
      </div>

      <div class="popup-content" v-if="order">
        <!-- 订单信息 -->
        <div class="section">
          <div class="section-title">
            <div class="title-icon-wrapper">
              <van-icon name="orders-o" />
            </div>
            <span>订单信息</span>
          </div>
          <div class="info-grid">
            <div class="info-item highlight">
              <div class="item-icon">
                <van-icon name="bag-o" />
              </div>
              <div class="item-content">
                <span class="label">工种</span>
                <span class="value">{{ order.work_kind_name }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="item-icon">
                <van-icon name="location-o" />
              </div>
              <div class="item-content">
                <span class="label">位置</span>
                <span class="value">{{
                  order.location || `${order.province} ${order.city} ${order.district}`
                }}</span>
              </div>
            </div>
            <div class="info-item highlight">
              <div class="item-icon">
                <van-icon name="location" />
              </div>
              <div class="item-content">
                <span class="label">距离</span>
                <span class="value distance-value">{{ distance }}km</span>
              </div>
            </div>
            <div class="info-item">
              <div class="item-icon">
                <van-icon name="home-o" />
              </div>
              <div class="item-content">
                <span class="label">房屋类型</span>
                <span class="value">{{ order.houseType === 'new' ? '新房' : '老房' }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="item-icon">
                <van-icon name="shop-o" />
              </div>
              <div class="item-content">
                <span class="label">户型</span>
                <span class="value">{{ order.roomType }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="item-icon">
                <van-icon name="expand-o" />
              </div>
              <div class="item-content">
                <span class="label">面积</span>
                <span class="value">{{ order.area }}m²</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="section" v-if="order.wechat_user">
          <div class="section-title">
            <div class="title-icon-wrapper">
              <van-icon name="user-o" />
            </div>
            <span>用户信息</span>
          </div>
          <div class="user-info">
            <div class="user-avatar-wrapper">
              <div class="avatar-ring"></div>
              <van-image
                :src="order.wechat_user.avatar || 'https://via.placeholder.com/60'"
                round
                width="64"
                height="64"
                fit="cover"
                class="user-avatar"
              />
            </div>
            <div class="user-details">
              <div class="user-name">
                <van-icon name="user-circle-o" />
                {{ order.wechat_user.nickname || '用户' }}
              </div>
              <div class="user-phone" v-if="order.wechat_user.phone">
                <van-icon name="phone-o" />
                <span>{{ encryptPhone(order.wechat_user.phone) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="popup-footer">
        <div class="footer-bg"></div>
        <van-button
          type="primary"
          size="large"
          block
          round
          @click="handleGrabOrder"
          :loading="loading"
          class="grab-btn"
        >
          <van-icon name="shopping-cart-o" />
          <span>立即抢单</span>
          <van-icon name="arrow" class="arrow-icon" />
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { encryptPhone } from '@/utils/index'

interface Order {
  id: number
  work_kind_name: string
  location: string
  province: string
  city: string
  district: string
  houseType: string
  roomType: string
  area: string
  wechat_user?: {
    id: number
    nickname: string
    avatar: string
    phone?: string
  }
}

interface Props {
  show: boolean
  order: Order | null
  distance: number
  // eslint-disable-next-line no-unused-vars
  onGrabOrder: (orderId: number) => Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const visible = ref(false)
const loading = ref(false)

watch(
  () => props.show,
  (val) => {
    visible.value = val
    if (!val && props.order) {
      // 弹窗关闭时，如果订单被接单，清空订单数据
      emit('close')
    }
  }
)

watch(visible, (val) => {
  if (!val) {
    emit('update:show', false)
  }
})

const handleClose = () => {
  visible.value = false
  emit('update:show', false)
}

const handleGrabOrder = async () => {
  if (!props.order) return

  try {
    loading.value = true
    await props.onGrabOrder(props.order.id)
    loading.value = false

    // 抢单成功后关闭弹窗
    handleClose()
  } catch (error: any) {
    loading.value = false
    if (error !== 'cancel') {
      console.error('抢单失败:', error)
    }
  }
}
</script>

<style lang="less" scoped>
.top-popup {
  margin-top: 0 !important;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.order-popup {
  display: flex;
  flex-direction: column;
  padding: 0;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.popup-decoration {
  height: 6px;
  background: linear-gradient(90deg, #00cec9 0%, #00b4d8 50%, #00cec9 100%);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 20px;

  .decoration-dot {
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    animation: dot-pulse 2s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.2s);

    &:nth-child(1) {
      --i: 0;
    }
    &:nth-child(2) {
      --i: 1;
    }
    &:nth-child(3) {
      --i: 2;
    }
  }
}

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.popup-header {
  position: relative;
  padding: 24px 20px 20px;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #e0f7fa 0%, #f0f9ff 50%, #ffffff 100%);
    z-index: 0;
  }

  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;

    .icon-wrapper {
      position: relative;
      flex-shrink: 0;

      .bell-icon {
        font-size: 32px;
        color: #00cec9;
        animation: bell-ring 2s ease-in-out infinite;
        position: relative;
        z-index: 1;
      }

      .icon-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background: rgba(0, 206, 201, 0.2);
        border-radius: 50%;
        animation: pulse-ring 2s ease-in-out infinite;
      }
    }

    .title-content {
      flex: 1;
      min-width: 0;
    }

    .popup-title {
      font-size: 22px;
      font-weight: 700;
      color: #323233;
      margin: 0 0 6px 0;
      line-height: 1.3;
      letter-spacing: -0.3px;
    }

    .popup-subtitle {
      font-size: 13px;
      color: #646566;
      margin: 0;
      line-height: 1.4;
    }
  }

  .status-tag {
    flex-shrink: 0;
    padding: 6px 14px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);

    .van-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}

@keyframes bell-ring {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30% {
    transform: rotate(-12deg);
  }
  20%,
  40% {
    transform: rotate(12deg);
  }
  50% {
    transform: rotate(0deg);
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

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-height: calc(85vh - 240px);
  background: #fff;
}

.section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
    font-weight: 700;
    color: #323233;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    .title-icon-wrapper {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 206, 201, 0.2);

      .van-icon {
        color: #fff;
        font-size: 18px;
      }
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #f0f0f0;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    &.highlight {
      background: linear-gradient(135deg, #e0f7fa 0%, #f0f9ff 100%);
      border-color: rgba(0, 206, 201, 0.2);
    }

    .item-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0, 206, 201, 0.25);

      .van-icon {
        color: #fff;
        font-size: 18px;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label {
      font-size: 12px;
      color: #969799;
      font-weight: 500;
    }

    .value {
      font-size: 15px;
      font-weight: 600;
      color: #323233;
      line-height: 1.4;
      word-break: break-all;

      &.distance-value {
        color: #00cec9;
        font-size: 16px;
      }
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .user-avatar-wrapper {
    position: relative;
    flex-shrink: 0;

    .avatar-ring {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border: 2px solid #00cec9;
      border-radius: 50%;
      opacity: 0.3;
      animation: ring-pulse 2s ease-in-out infinite;
    }

    .user-avatar {
      position: relative;
      z-index: 1;
      border: 3px solid #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .user-details {
    flex: 1;
    min-width: 0;

    .user-name {
      font-size: 17px;
      font-weight: 700;
      color: #323233;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;

      .van-icon {
        color: #00cec9;
        font-size: 18px;
      }
    }

    .user-phone {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #646566;
      padding: 6px 12px;
      background: rgba(0, 206, 201, 0.08);
      border-radius: 8px;
      width: fit-content;

      .van-icon {
        color: #00cec9;
        font-size: 16px;
      }
    }
  }
}

@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

.popup-footer {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  z-index: 10;

  .footer-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.95) 20%,
      #fff 100%
    );
    pointer-events: none;
  }

  .grab-btn {
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border: none;
    height: 56px;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 6px 20px rgba(0, 206, 201, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.5px;

    &:active {
      transform: scale(0.97);
      box-shadow: 0 3px 12px rgba(0, 206, 201, 0.3);
    }

    .van-icon {
      font-size: 22px;

      &.arrow-icon {
        font-size: 16px;
        margin-left: 4px;
        transition: transform 0.3s;
      }
    }

    &:hover .arrow-icon {
      transform: translateX(4px);
    }
  }
}
</style>
