<template>
  <div class="page-container">
    <custom-van-navbar />
    <main>
      <div class="tree-select-wrapper">
        <van-tree-select
          v-model:main-active-index="activeIndex"
          height="100%"
          :items="workKinds"
          @click-nav="onClickNav"
          class="fade-in-up"
          :style="{ animationDelay: '0.1s' }"
        >
          <template #content>
            <div v-if="priceList?.length" class="price-list">
              <div
                v-for="(price, index) in priceList"
                :key="price?.id"
                class="price-card fade-in-up shine-effect"
                :style="{ animationDelay: `${0.2 + index * 0.05}s` }"
                @click="navigateToDetail(price)"
              >
                <div class="price-card-header">
                  <div class="price-title-section">
                    <div class="work-kind-icon">
                      <van-icon name="bag-o" />
                    </div>
                    <div class="price-title-info">
                      <div class="price-title">{{ price?.work_title || '未设置标题' }}</div>
                      <div class="work-kind-name">{{ price?.work_kind?.work_kind_name || '' }}</div>
                    </div>
                  </div>
                </div>

                <div
                  class="price-card-content"
                  :class="{
                    'has-minimum-price': price?.is_set_minimum_price === '1' && price?.minimum_price
                  }"
                >
                  <div class="price-info-row" v-if="price?.work_price">
                    <van-icon name="gold-coin-o" class="info-icon" />
                    <span class="info-label">工价：</span>
                    <span class="price-value">¥{{ price.work_price }}</span>
                    <span class="price-unit" v-if="price?.labour_cost"
                      >/{{ price.labour_cost.labour_cost_name }}</span
                    >
                  </div>
                  <div class="price-info-row" v-if="price?.pricing_description">
                    <van-icon name="description" class="info-icon" />
                    <span class="info-text">{{ price.pricing_description }}</span>
                  </div>
                  <div class="price-info-row" v-if="price?.service_scope">
                    <van-icon name="service-o" class="info-icon" />
                    <span class="info-text">服务范围：{{ price.service_scope }}</span>
                  </div>
                  <div
                    class="price-info-row"
                    v-if="price?.is_set_minimum_price === '1' && price?.minimum_price"
                  >
                    <van-icon name="info-o" class="info-icon" />
                    <span class="info-text">最低价格：¥{{ price.minimum_price }}</span>
                  </div>
                </div>

                <div class="price-card-footer">
                  <van-button
                    size="small"
                    type="primary"
                    class="add-btn"
                    @click.stop="handleAddToCart(price)"
                    icon="shopping-cart-o"
                  >
                    加入清单
                  </van-button>
                </div>
              </div>
            </div>
            <van-empty v-else description="暂无工价信息，点击右上角添加" />
          </template>
        </van-tree-select>
      </div>
    </main>

    <footer>
      <van-button
        icon="shopping-cart-o"
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="showCartList = true"
      >
        查看清单
        <van-badge v-if="cartTotalCount > 0" :content="cartTotalCount" />
      </van-button>
    </footer>

    <!-- 清单弹出层 -->
    <PriceCartPopup
      v-model="showCartList"
      :cart-list="cartList"
      :total-price="totalPrice"
      @update-item="updateCartItem"
      @remove-item="removeCartItem"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import PriceCartPopup from './components/price-cart-popup.vue'
import {
  getWorkKindListService,
  getWorkKindPriceService,
  submitWorkPriceService,
  getUserInfoService
} from './service'
import { showToast, showConfirmDialog } from 'vant'
import { usePriceCart } from './composables/usePriceCart'

const router = useRouter()
const route = useRoute()

const activeIndex = ref(0)
const showCartList = ref(false)

const workKinds = ref<any[]>([])
const priceList = ref<any[]>([])
const currentUserWorkKindName = ref<string | undefined>(undefined)

// 使用工价清单功能（传入订单ID）
const orderId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
// 从查询参数中获取 area
const { area } = route.query ?? {}

const {
  cartList,
  cartTotalCount,
  totalPrice,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = usePriceCart(orderId)

// 加入清单
const handleAddToCart = (price: any) => {
  addToCart(price)
}

// 跳转工价详情
const navigateToDetail = (price: any) => {
  const orderId = route.params.id || route.query.orderId
  router.push({
    path: `/mine/foreman-price/detail/${price.id}`,
    query: orderId ? { orderId: String(orderId) } : undefined
  })
}

// 提交工价清单
const handleSubmit = async () => {
  if (!cartList.value?.length) {
    showToast('清单为空，请先添加工价')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认提交',
      message: `共 ${cartTotalCount.value} 项工价，确认提交吗？`
    })

    const { success } = await submitWorkPriceService({
      order_id: Number(route.params.id), // 订单id
      area, // 平米数
      total_price: totalPrice.value, // 施工总费用
      work_price_list: (cartList.value || [])?.map((item) => {
        const {
          quantity,
          id,
          work_kind,
          work_price,
          work_title,
          labour_cost,
          minimum_price,
          is_set_minimum_price
        } = item ?? {}
        return {
          work_price_id: id, // 工价id
          work_price, // 工价
          work_title, // 工价标题
          quantity, // 数量
          work_kind_name: work_kind?.work_kind_name, // 工种名称
          work_kind_id: work_kind?.id, // 工种id
          labour_cost_name: labour_cost?.labour_cost_name, // 单位名称
          minimum_price, // 最低价格,
          is_set_minimum_price // 是否设置最低价格
        }
      })
    })

    if (success) {
      showToast('提交成功')
      clearCart()
      showCartList.value = false
      router.back()
    }
  } catch {
    console.log('用户取消')
  }
}

// 点击导航
const onClickNav = (index: number) => {
  if (workKinds.value[index]) {
    getWorkKindPrice(workKinds.value[index].value)
  }
}

// 获取工种列表
const getWorkKindList = async () => {
  // 获取用户信息
  const { success: userSuccess, data: userData } = await getUserInfoService()
  if (!userSuccess || !userData) return

  // 保存当前用户的工种名称
  currentUserWorkKindName.value = userData?.skillInfo?.workKindName

  // 获取所有工种
  const { success, data } = await getWorkKindListService()
  if (!success || !data) return

  // 根据用户工种过滤
  let filteredData = data
  const workKindName = userData?.skillInfo?.workKindName

  if (workKindName === '工长') {
    // 如果是工长，展示全部工种
    filteredData = data
  } else {
    // 否则，只展示对应工种的
    filteredData = data.filter((item: any) => item.work_kind_name === workKindName)
  }

  workKinds.value = filteredData.map((item: any) => ({
    text: item.work_kind_name,
    value: item.id
  }))

  // 默认选中第一个
  if (workKinds.value.length > 0) {
    onClickNav(0)
  }
}

// 获取工价列表
const getWorkKindPrice = async (workKindId: number) => {
  const { success, data } = await getWorkKindPriceService(workKindId)
  if (!success || !data) return

  // 根据用户工种过滤工价
  if (currentUserWorkKindName.value === '工长') {
    // 如果是工长，展示全部工价
    priceList.value = data
  } else {
    // 否则，只展示对应工种的工价
    priceList.value = data.filter(
      (item: any) => item?.work_kind?.work_kind_name === currentUserWorkKindName.value
    )
  }
}

onMounted(() => {
  getWorkKindList()
})
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  min-height: 0;
}

.tree-select-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.5s ease-out both;
  animation-delay: 0.3s;

  display: flex;
  gap: 10px;

  .action-btn {
    flex: 1;
    height: 44px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:active {
      transform: scale(0.96);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }

    .van-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    &:active .van-icon {
      transform: scale(1.1);
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

::v-deep(.van-tree-select) {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
  height: 100%;
}

::v-deep(.van-tree-select__nav) {
  flex: none;
  width: 100px;
  overflow-y: auto;
  font-size: 28px;
  font-weight: 400;
  line-height: 40px;
  letter-spacing: 0.58px;
  transition: background 0.3s ease;

  .van-sidebar-item {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 206, 201, 0.05);
    }

    &--active {
      background: rgba(0, 206, 201, 0.1);
    }
  }
}

::v-deep(.van-tree-select__content) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: #f5f5f5;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.price-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.price-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
  opacity: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  .price-card-header {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;

    .price-title-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .work-kind-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 206, 201, 0.25);

        .van-icon {
          color: #fff;
          font-size: 18px;
        }
      }

      .price-title-info {
        flex: 1;
        min-width: 0;

        .price-title {
          font-size: 16px;
          font-weight: 600;
          color: #323233;
          line-height: 1.4;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .work-kind-name {
          font-size: 12px;
          color: #969799;
        }
      }
    }
  }

  .price-card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    .price-info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #646566;
      line-height: 1.4;

      .info-icon {
        color: #00cec9;
        font-size: 14px;
        flex-shrink: 0;
      }

      .info-label {
        color: #646566;
      }

      .price-value {
        font-size: 18px;
        font-weight: 700;
        color: #00cec9;
      }

      .price-unit {
        font-size: 12px;
        color: #969799;
      }

      .info-text {
        flex: 1;
        min-width: 0;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .price-card-footer {
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    margin-top: auto;

    .add-btn {
      background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
      border: none;
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 206, 201, 0.3);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
        box-shadow: 0 1px 4px rgba(0, 206, 201, 0.4);
      }
    }
  }
}
</style>
