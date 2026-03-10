<template>
  <van-popup
    v-model:show="visible"
    position="center"
    round
    :closeable="false"
    :style="{ width: '90%', maxWidth: '360px' }"
    class="center-popup"
    :close-on-click-overlay="true"
    @close="handleClose"
  >
    <div class="order-popup" v-if="order">
      <!-- 标题栏 -->
      <div class="popup-header">
        <h3 class="popup-title">🎉 新订单来了</h3>
        <div class="header-right">
          <van-tag type="warning" size="medium" round>待接单</van-tag>
          <div class="close-btn" @click="handleClose">
            <van-icon name="cross" />
          </div>
        </div>
      </div>

      <!-- 订单摘要（点击查看详情） -->
      <div class="popup-body" @click="handleViewDetail">
        <div class="order-summary">
          <div class="summary-row">
            <van-icon name="bag-o" />
            <span>{{ order.work_kind_name }}</span>
          </div>
          <div class="summary-row">
            <van-icon name="location-o" />
            <span>{{ order.location || `${order.province} ${order.city} ${order.district}` }}</span>
          </div>
          <div class="summary-row highlight">
            <van-icon name="location" />
            <span>距离 {{ distance }}km</span>
          </div>
          <div class="summary-row">
            <van-icon name="home-o" />
            <span
              >{{ order.houseType === 'new' ? '新房' : '老房' }} · {{ order.roomType }} ·
              {{ order.area }}m²</span
            >
          </div>
        </div>
        <div class="view-detail-hint">
          <van-icon name="arrow" />
          <span>点击查看详情</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="popup-footer">
        <van-button
          type="primary"
          size="large"
          block
          round
          @click.stop="handleGrabOrder"
          :loading="loading"
          class="grab-btn"
        >
          <van-icon name="shopping-cart-o" />
          <span>立即抢单</span>
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isFlutterWebView } from '@/utils/index'

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

const router = useRouter()
const visible = ref(false)
const loading = ref(false)

watch(
  () => props.show,
  (val) => {
    visible.value = val
    if (!val && props.order) {
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

const handleViewDetail = () => {
  if (!props.order) return
  handleClose()

  // 跳转订单详情
  if (isFlutterWebView() && (window as any).fitment_flutter?.openWebView) {
    ;(window as any).fitment_flutter.openWebView(
      `/fitment-h5/home/order/${props.order.id}`,
      '订单详情'
    )
  } else {
    router.push(`/home/order/${props.order.id}`)
  }
}

const handleGrabOrder = async () => {
  if (!props.order) return

  try {
    loading.value = true
    await props.onGrabOrder(props.order.id)
    loading.value = false
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
.center-popup {
  overflow: hidden;
}

.order-popup {
  background: #fff;
  padding: 20px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 10;

  .popup-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-text-secondary);
    border-radius: 50%;
    transition: all 0.2s;

    &:active {
      background: #f0f0f0;
      color: var(--color-text);
    }

    .van-icon {
      font-size: 20px;
    }
  }
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  margin: 0 -12px;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background 0.2s;

  &:active {
    background: #eef0f2;
  }
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .summary-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    color: var(--color-text);

    .van-icon {
      color: var(--color-primary);
      font-size: 16px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    span {
      flex: 1;
      word-break: break-all;
      line-height: 1.4;
    }

    &.highlight span {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
}

.view-detail-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
  font-size: 13px;
  color: var(--color-text-secondary);

  .van-icon {
    font-size: 12px;
    transition: transform 0.2s;
  }

  &:hover .van-icon {
    transform: translateX(4px);
  }
}

.popup-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;

  .grab-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border: none;

    .van-icon {
      margin-right: 6px;
      font-size: 18px;
    }
  }
}
</style>
