<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
    round
    closeable
    close-icon-position="top-right"
    @update:show="handleUpdateShow"
  >
    <div class="cart-popup">
      <div class="cart-header">
        <h3>辅料清单</h3>
        <span class="cart-count">共 {{ cartTotalCount }} 件商品</span>
      </div>
      <div class="cart-content">
        <van-empty v-if="cartList.length === 0" description="清单为空" />
        <div v-else class="cart-item-list">
          <div v-for="item in cartList" :key="item.id" class="cart-item">
            <img :src="item.commodity_cover" class="cart-item-image" />
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.commodity_name }}</div>
              <div class="cart-item-price">
                ¥{{ item.commodity_price }} /{{ item.commodity_unit }}
              </div>
            </div>
            <div class="cart-item-actions">
              <van-stepper
                v-model="item.quantity"
                :min="1"
                :max="999"
                integer
                @change="handleUpdateItem(item)"
              />
              <van-button
                size="mini"
                type="danger"
                plain
                class="delete-btn"
                @click="handleRemoveItem(item.id)"
              >
                删除
              </van-button>
            </div>
          </div>
        </div>
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span class="total-label">总计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <van-button type="primary" size="large" round @click="handleSubmit" class="submit-btn">
          提交清单
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// 购物车商品类型
export interface CartItem {
  id: number
  commodity_name: string
  commodity_price: number
  commodity_unit: string
  commodity_cover: string
  quantity: number
}

// Props
interface Props {
  modelValue: boolean
  cartList: CartItem[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update-item': [item: CartItem]
  'remove-item': [id: number]
  submit: []
}>()

// 控制显示/隐藏
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 处理弹出层显示状态变化
const handleUpdateShow = (show: boolean) => {
  visible.value = show
}

// 计算购物车总数量
const cartTotalCount = computed(() => {
  return props.cartList.reduce((total, item) => total + item.quantity, 0)
})

// 计算总价格
const totalPrice = computed(() => {
  return props.cartList.reduce((total, item) => total + item.commodity_price * item.quantity, 0)
})

// 更新商品数量
const handleUpdateItem = (item: CartItem) => {
  emit('update-item', item)
}

// 删除商品
const handleRemoveItem = (id: number) => {
  emit('remove-item', id)
}

// 提交清单
const handleSubmit = () => {
  emit('submit')
}
</script>

<style lang="less" scoped>
// 购物车弹出层样式
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
      color: #323233;
    }

    .cart-count {
      font-size: 14px;
      color: #969799;
    }
  }

  .cart-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    -webkit-overflow-scrolling: touch;

    .cart-item-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f8f8;
      border-radius: 12px;

      .cart-item-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .cart-item-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .cart-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #323233;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cart-item-price {
          font-size: 14px;
          color: #00cec9;
          font-weight: 600;
        }
      }

      .cart-item-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;

        .delete-btn {
          font-size: 12px;
        }
      }
    }
  }

  .cart-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    background: #fff;

    .cart-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 12px 0;

      .total-label {
        font-size: 16px;
        color: #323233;
        font-weight: 500;
      }

      .total-price {
        font-size: 24px;
        color: #00cec9;
        font-weight: 700;
      }
    }

    .submit-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 600;
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
