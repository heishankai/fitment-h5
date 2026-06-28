<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    closeable
    close-icon-position="top-right"
    @update:show="handleUpdateShow"
  >
    <div class="cart-popup">
      <div class="cart-header">
        <h3>工价清单</h3>
        <span class="cart-count">共 {{ cartTotalCount }} 项工价</span>
      </div>
      <div class="cart-content">
        <van-empty v-if="cartList.length === 0" description="清单为空" />
        <div v-else class="cart-item-list">
          <van-cell-group
            v-for="item in cartList"
            :key="`${item.code || item.work_title}-${item.id}`"
            inset
            class="cart-item"
          >
            <van-cell :border="false">
              <template #title>
                <span class="cart-item-name">{{ item.work_title }}</span>
              </template>
              <template #label>
                <van-space wrap :size="8" class="cart-item-meta">
                  <van-tag v-if="item.work_kind?.work_kind_name" type="primary" plain>
                    {{ item.work_kind.work_kind_name }}
                  </van-tag>
                  <span class="cart-item-price">
                    ¥{{ item.work_price }}
                    <span v-if="item.labour_cost" class="cart-item-unit">
                      /{{ item.labour_cost.labour_cost_name }}
                    </span>
                  </span>
                </van-space>
              </template>
              <template #right-icon>
                <van-button
                  icon="delete-o"
                  size="small"
                  type="danger"
                  plain
                  round
                  class="delete-btn"
                  @click="handleRemoveItem(item)"
                />
              </template>
            </van-cell>

            <van-cell title="数量" center class="quantity-cell">
              <template #right-icon>
                <van-stepper
                  v-model="item.quantity"
                  class="quantity-stepper"
                  :min="MIN_WORK_PRICE_QUANTITY"
                  :step="0.1"
                  :decimal-length="1"
                  @change="handleUpdateItem(item)"
                />
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>

      <footer class="cart-footer">
        <van-cell-group v-if="showGangmasterCost" inset class="gangmaster-fee">
          <van-cell
            center
            :border="false"
            title="局改工长费"
            label="全屋装修不要操作，局改可自定义工长费"
          >
            <template #right-icon>
              <van-switch v-model="manualEnabled" size="22px" />
            </template>
          </van-cell>

          <van-field
            v-if="manualEnabled"
            v-model="manualCost"
            type="number"
            label="工长费"
            input-align="right"
            placeholder="请输入本次工长费"
          >
            <template #button>元</template>
          </van-field>
        </van-cell-group>

        <van-submit-bar
          :fixed="false"
          :price="submitBarPrice"
          button-text="提交清单"
          button-type="primary"
          safe-area-inset-bottom
          @submit="handleSubmit"
        />
      </footer>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { PriceCartItem } from '../composables/usePriceCart'
import { MIN_WORK_PRICE_QUANTITY } from '../utils/calculate-work-price-quantity'

// Props
interface Props {
  modelValue: boolean
  cartList: PriceCartItem[]
  totalPrice: number
  showGangmasterCost?: boolean
  manualGangmasterCostEnabled?: boolean
  manualGangmasterCost?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  showGangmasterCost: false,
  manualGangmasterCostEnabled: false,
  manualGangmasterCost: ''
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:manualGangmasterCostEnabled': [value: boolean]
  'update:manualGangmasterCost': [value: string | number]
  'update-item': [item: PriceCartItem]
  'remove-item': [item: PriceCartItem]
  submit: []
}>()

// 控制显示/隐藏
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const manualEnabled = computed({
  get: () => props.manualGangmasterCostEnabled,
  set: (value) => emit('update:manualGangmasterCostEnabled', value)
})

const manualCost = computed({
  get: () => props.manualGangmasterCost,
  set: (value) => emit('update:manualGangmasterCost', value)
})

const handleUpdateShow = (show: boolean) => {
  visible.value = show
}

// 计算清单项数（工价种类数，而非数量之和）
const cartTotalCount = computed(() => {
  return props.cartList.length
})

// van-submit-bar 的 price 单位为分
const submitBarPrice = computed(() => Math.round(props.totalPrice * 100))

// 更新工价数量
const handleUpdateItem = (item: PriceCartItem) => {
  emit('update-item', item)
}

// 删除工价
const handleRemoveItem = (item: PriceCartItem) => {
  emit('remove-item', item)
}

// 提交清单
const handleSubmit = () => {
  emit('submit')
}
</script>

<style lang="less" scoped>
// 清单弹出层样式
.cart-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  position: relative;

  .cart-header {
    padding: 20px 16px;
    padding-right: 48px; // 为关闭按钮留出空间
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text);
    }

    .cart-count {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .cart-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
    -webkit-overflow-scrolling: touch;

    .cart-item-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cart-item {
      overflow: hidden;

      :deep(.van-cell) {
        background: #f8f8f8;
      }

      :deep(.van-cell__title) {
        flex: 1;
        min-width: 0;
      }

      .cart-item-name {
        display: block;
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text);
        line-height: 1.5;
        word-break: break-word;
        white-space: normal;
      }

      .cart-item-meta {
        margin-top: 6px;
      }

      .cart-item-price {
        font-size: 15px;
        color: var(--color-primary);
        font-weight: 700;
        white-space: nowrap;
      }

      .cart-item-unit {
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-secondary);
      }

      .delete-btn {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        padding: 0;
        border: none;
      }

      .quantity-cell {
        :deep(.van-cell__title) {
          flex: 1;
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        :deep(.van-cell__right-icon) {
          flex-shrink: 0;
          margin-left: auto;
        }
      }

      .quantity-stepper {
        :deep(.van-stepper__minus),
        :deep(.van-stepper__plus) {
          width: 36px;
          height: 36px;
          background: #fff;
        }

        :deep(.van-stepper__input) {
          width: 56px;
          height: 36px;
          font-size: 16px;
          font-weight: 600;
          background: #fff;
        }
      }
    }
  }

  .cart-footer {
    flex-shrink: 0;
    background: #fff;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);

    :deep(.van-submit-bar) {
      position: relative;
    }

    :deep(.van-submit-bar__price) {
      font-size: 22px;
      font-weight: 700;
    }
  }

  .gangmaster-fee {
    margin: 12px 16px 0;

    :deep(.van-cell) {
      padding: 12px 16px;
      background: rgba(var(--color-primary-rgb), 0.06);
    }

    :deep(.van-cell__title) {
      font-size: 15px;
      font-weight: 600;
    }

    :deep(.van-cell__label) {
      margin-top: 4px;
      line-height: 1.5;
      word-break: break-word;
    }

    :deep(.van-field) {
      margin-top: 0;
      background: #fff;
    }
  }
}

// 确保关闭按钮在最上层
:deep(.van-popup__close-icon) {
  z-index: 1000;
  top: 16px;
  right: 16px;
}
</style>
