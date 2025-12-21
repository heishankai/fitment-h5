<template>
  <div class="page-container">
    <custom-van-navbar />

    <div v-if="order" class="order-detail">
      <!-- 订单头部 -->
      <div class="detail-header">
        <div class="header-content">
          <div class="work-kind-section">
            <div class="work-kind-icon">
              <van-icon name="bag-o" />
            </div>
            <div class="work-kind-info">
              <div class="work-kind-name">{{ order.work_kind_name }}</div>
              <van-tag :type="getStatusType(order.order_status)" round class="status-tag">
                {{ order.order_status_name }}
              </van-tag>
            </div>
          </div>
          <div class="order-time" v-if="order.createdAt">
            {{ formatTime(order.createdAt) }}
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="detail-content">
        <div class="section">
          <div class="section-title">
            <div class="title-icon-wrapper">
              <van-icon name="orders-o" />
            </div>
            <span>订单信息</span>
          </div>
          <div class="info-grid">
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
              <van-image
                :src="order.wechat_user.avatar || 'https://via.placeholder.com/60'"
                round
                width="60"
                height="60"
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
      <div class="detail-footer">
        <van-button
          v-if="order.order_status === 1"
          type="primary"
          size="large"
          block
          round
          @click="handleAcceptOrder"
          :loading="accepting"
          class="accept-btn"
        >
          <van-icon name="shopping-cart-o" />
          <span>立即接单</span>
        </van-button>
      </div>
    </div>

    <van-empty v-else description="订单不存在" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { formatTime, encryptPhone } from '@/utils/index'
import { getOrderDetail, acceptOrder } from '../service'

const route = useRoute()
const router = useRouter()

const order = ref<any>(null)
const loading = ref(true)
const accepting = ref(false)

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

// 加载订单详情
const loadOrderDetail = async () => {
  const orderId = Number(route.params.id)
  if (!orderId) {
    showToast('订单ID无效')
    router.back()
    return
  }

  try {
    loading.value = true
    const res = await getOrderDetail(orderId)
    if (res?.success && res.data) {
      order.value = res.data
    } else {
      showToast(res?.message || '获取订单详情失败')
      router.back()
    }
  } catch (error: any) {
    console.error('获取订单详情失败:', error)
    showToast('获取订单详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 接单
const handleAcceptOrder = async () => {
  if (!order.value || order.value.order_status !== 1) {
    showToast('订单状态不正确，无法接单')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认接单',
      message: `确定要接这个${order.value.work_kind_name}订单吗？`
    })

    accepting.value = true
    const res = await acceptOrder(order.value.id)
    accepting.value = false

    if (res?.success) {
      showToast('接单成功')
      // 更新订单状态
      order.value.order_status = 2
      order.value.order_status_name = '已接单'
      order.value.craftsman_user_id = res.data?.craftsman_user_id
      // 跳转到我的工地订单页面
      setTimeout(() => {
        router.push('/mine/my-construction')
      }, 1000)
    } else {
      showToast(res?.message || '接单失败')
    }
  } catch (error: any) {
    accepting.value = false
    if (error !== 'cancel') {
      console.error('接单失败:', error)
      showToast('接单失败')
    }
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="less" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%);
  padding-bottom: env(safe-area-inset-bottom, 80px);
}

.order-detail {
  padding: 16px;
}

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
          margin-bottom: 8px;
        }

        .status-tag {
          font-weight: 600;
        }
      }
    }

    .order-time {
      font-size: 12px;
      opacity: 0.9;
    }
  }
}

.detail-content {
  .section {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
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

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;

        .item-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #e0f7fa 0%, #f0f9ff 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .van-icon {
            color: #00cec9;
            font-size: 16px;
          }
        }

        .item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .label {
            font-size: 11px;
            color: #969799;
            font-weight: 500;
          }

          .value {
            font-size: 13px;
            color: #323233;
            font-weight: 600;
            line-height: 1.4;
            word-break: break-all;
          }
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .user-avatar-wrapper {
        flex-shrink: 0;

        .user-avatar {
          border: 2px solid #00cec9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .user-details {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 16px;
          font-weight: 700;
          color: #323233;
          margin-bottom: 8px;
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
          gap: 6px;
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
  }
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);

  .accept-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    .van-icon {
      font-size: 18px;
    }
  }
}
</style>
