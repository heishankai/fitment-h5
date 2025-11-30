import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

// 购物车商品类型
export interface CartItem {
  id: number
  commodity_name: string
  commodity_price: number
  commodity_unit: string
  commodity_cover: string
  quantity: number
}

export function useCart(orderId?: string | number) {
  const route = useRoute()
  const cartList = ref<CartItem[]>([])

  // 获取订单ID（从参数或路由中获取）
  const getOrderId = () => {
    return orderId || route.params.id || route.query.orderId || 'default'
  }

  // localStorage key（根据订单ID动态生成）
  const getCartStorageKey = () => {
    return `material_order_cart_${getOrderId()}`
  }

  // 从本地存储加载购物车
  const loadCartFromStorage = () => {
    try {
      const key = getCartStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        cartList.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载购物车失败:', error)
      cartList.value = []
    }
  }

  // 保存购物车到本地存储
  const saveCartToStorage = () => {
    try {
      const key = getCartStorageKey()
      localStorage.setItem(key, JSON.stringify(cartList.value))
    } catch (error) {
      console.error('保存购物车失败:', error)
    }
  }

  // 清空购物车
  const clearCart = () => {
    cartList.value = []
    saveCartToStorage()
  }

  // 计算购物车总数量
  const cartTotalCount = computed(() => {
    return cartList.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 计算总价格
  const totalPrice = computed(() => {
    return cartList.value.reduce((total, item) => total + item.commodity_price * item.quantity, 0)
  })

  // 加入清单
  const addToCart = (product: any) => {
    const existingItem = cartList.value.find((item) => item.id === product.id)

    if (existingItem) {
      // 如果已存在，增加数量
      existingItem.quantity += 1
      showToast('已添加到清单')
    } else {
      // 如果不存在，添加新商品
      cartList.value.push({
        id: product.id,
        commodity_name: product.commodity_name,
        commodity_price: product.commodity_price,
        commodity_unit: product.commodity_unit || '',
        commodity_cover: product.commodity_cover,
        quantity: 1
      })
      showToast('已加入清单')
    }

    saveCartToStorage()
  }

  // 更新购物车商品数量
  const updateCartItem = () => {
    saveCartToStorage()
  }

  // 删除购物车商品
  const removeCartItem = (id: number) => {
    const index = cartList.value.findIndex((item) => item.id === id)
    if (index > -1) {
      cartList.value.splice(index, 1)
      saveCartToStorage()
      showToast('已删除')
    }
  }

  // 初始化时加载购物车
  loadCartFromStorage()

  return {
    cartList,
    cartTotalCount,
    totalPrice,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    loadCartFromStorage,
    saveCartToStorage
  }
}
