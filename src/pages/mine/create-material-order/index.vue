<template>
  <div class="page-container">
    <custom-van-navbar />
    <!-- 搜索栏 -->
    <SearchBar class="fade-in-up" />
    <main>
      <div class="tree-select-wrapper">
        <van-tree-select
          v-model:main-active-index="activeIndex"
          height="100%"
          :items="categories"
          @click-nav="onClickNav"
          class="fade-in-up"
          :style="{ animationDelay: '0.1s' }"
        >
          <template #content>
            <div v-if="commodityList?.length" class="product-list">
              <van-card
                v-for="(product, index) in commodityList"
                :key="product?.id"
                :title="product?.commodity_name"
                :desc="product?.commodity_description"
                :thumb="product?.commodity_cover"
                class="product-card fade-in-up shine-effect"
                :style="{ animationDelay: `${0.2 + index * 0.05}s` }"
                @click="navigateToDetail(product)"
              >
                <template #price>
                  <div class="product-price-wrapper">
                    <span class="product-price">¥{{ product?.commodity_price }}</span>
                    <span class="product-unit">/{{ product?.commodity_unit }}</span>
                  </div>
                </template>
                <template #footer>
                  <van-button
                    size="mini"
                    type="primary"
                    class="add-btn"
                    @click.stop="handleAddToCart(product)"
                    icon="shopping-cart-o"
                  >
                    加入清单
                  </van-button>
                </template>
              </van-card>
            </div>
            <van-empty v-else description="暂无商品" />
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
    <CartPopup
      v-model="showCartList"
      :cart-list="cartList"
      @update-item="updateCartItem"
      @remove-item="removeCartItem"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import SearchBar from './components/search-bar.vue'
import CartPopup from './components/cart-popup.vue'
import {
  getCategoryListService,
  getCommodityConfigListService,
  addMaterialService
} from './service'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useCart } from './composables/useCart'

const router = useRouter()
const route = useRoute()

const activeIndex = ref(0)
const showCartList = ref(false)

const categories = ref<any[]>([])
const commodityList = ref<any[]>([])

// 使用购物车功能
const {
  cartList,
  cartTotalCount,
  totalPrice,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = useCart()

// 加入清单
const handleAddToCart = (product: any) => {
  addToCart(product)
}

// 提交辅料单
const handleSubmit = async () => {
  if (cartList.value.length === 0) {
    showToast('清单为空，请先添加商品')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认提交',
      message: `共 ${cartTotalCount.value} 件商品，总计 ¥${totalPrice.value.toFixed(2)}，确认提交吗？`
    })

    const { success } = await addMaterialService({
      orderId: Number(route.params.id),
      commodity_list: (cartList.value || []).map((item) => {
        return {
          commodity_id: item?.id,
          ...item
        }
      })
    })

    if (success) {
      showToast('提交成功')
      clearCart()
      router.back()
      showCartList.value = false
    }
  } catch {
    console.log('用户取消')
  }
}

// 点击导航
const onClickNav = (index: number) => getCommodityConfig(categories.value[index].value)

// 获取分类列表
const getCategoryList = async () => {
  const { success, data } = await getCategoryListService()
  if (!success || !data) return

  categories.value = data.map((item: any) => ({
    text: item.category_name,
    value: item.id
  }))

  onClickNav(0)
}

// 获取商品列表
const getCommodityConfig = async (category_id: number) => {
  const { success, data } = await getCommodityConfigListService({ category_id })
  if (!success || !data) return
  commodityList.value = data
}

// 跳转商品详情
const navigateToDetail = (product: any) => {
  router.push({
    path: `/mine/create-material-order/detail/${product.id}`
  })
}

onMounted(getCategoryList)
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

.product-list {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0; // 确保 flex 子元素可以正确收缩
  width: 100%;
  box-sizing: border-box;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
  opacity: 0;
  flex-shrink: 0; // 防止卡片被压缩
  width: 100%;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  :deep(.van-card) {
    border-radius: 16px;
    overflow: hidden;
    padding: 16px;
    background: #fff;
  }

  :deep(.van-card__thumb) {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  &:active :deep(.van-card__thumb img) {
    transform: scale(1.05);
  }

  :deep(.van-card__content) {
    flex: 1;
    min-width: 0;
  }

  :deep(.van-card__title) {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 1.4;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  :deep(.van-card__desc) {
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  :deep(.van-card__tags) {
    margin-top: 8px;
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .van-tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: linear-gradient(135deg, rgba(0, 206, 201, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%);
      border-color: rgba(0, 206, 201, 0.3);
      color: #00cec9;
    }
  }

  :deep(.van-card__price) {
    margin-top: 8px;
  }

  .product-price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .product-price {
    font-size: 20px;
    font-weight: 700;
    color: #00cec9;
  }

  .product-unit {
    font-size: 12px;
    color: #969799;
    font-weight: 400;
  }

  :deep(.van-card__footer) {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
  }

  .add-btn {
    width: 100%;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border: none;
    border-radius: 20px;
    padding: 16px 16px;
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
</style>
