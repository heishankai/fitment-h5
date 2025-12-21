import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

// 工价清单项类型
export interface PriceCartItem {
  id?: number
  work_kind_id: number
  work_title: string
  work_price: string
  pricing_description?: string
  service_scope?: string
  display_images?: string[]
  service_details?: any[]
  labour_cost_id?: number
  labour_cost?: any
  work_kind?: any
  is_set_minimum_price?: string
  minimum_price?: string
  quantity?: number
}

export function usePriceCart(orderId?: string | number) {
  const route = useRoute()
  const cartList = ref<PriceCartItem[]>([])

  // 获取订单ID（从参数或路由中获取）
  const getOrderId = () => {
    return orderId || route.params.id || route.query.orderId || 'default'
  }

  // localStorage key（根据订单ID动态生成）
  const getCartStorageKey = () => {
    return `foreman_price_cart_${getOrderId()}`
  }

  // 从本地存储加载清单
  const loadCartFromStorage = () => {
    try {
      const key = getCartStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        // 确保每个项都有 quantity 字段，如果没有则设置为 1，并确保是整数
        cartList.value = parsed.map((item: PriceCartItem) => ({
          ...item,
          quantity: Math.floor(Number(item.quantity) || 1)
        }))
      }
    } catch (error) {
      console.error('加载工价清单失败:', error)
      cartList.value = []
    }
  }

  // 保存清单到本地存储
  const saveCartToStorage = () => {
    try {
      const key = getCartStorageKey()
      localStorage.setItem(key, JSON.stringify(cartList.value))
    } catch (error) {
      console.error('保存工价清单失败:', error)
    }
  }

  // 清空清单
  const clearCart = () => {
    cartList.value = []
    saveCartToStorage()
  }

  // 计算清单总数量（所有项的 quantity 之和）
  const cartTotalCount = computed(() => {
    return cartList.value.reduce((total, item) => total + (item.quantity || 1), 0)
  })

  // 计算总价格（考虑数量和最低价格）
  const totalPrice = computed(() => {
    return cartList.value.reduce((total, item) => {
      const price = parseFloat(String(item.work_price)) || 0
      const quantity = item.quantity || 1
      const itemTotal = price * quantity

      // 检查是否设置了最低价格（兼容字符串 '1' 和数字 1）
      const hasMinimumPrice =
        String(item.is_set_minimum_price) === '1' || Number(item.is_set_minimum_price) === 1

      if (hasMinimumPrice && item.minimum_price) {
        const minimumPrice = parseFloat(String(item.minimum_price)) || 0

        // 如果总价超过了最低价格，使用正常价格；否则使用最低价格
        const finalPrice = itemTotal >= minimumPrice ? itemTotal : minimumPrice

        console.log('工价项计算（应用最低价格规则）:', {
          work_title: item.work_title,
          price,
          quantity,
          itemTotal,
          minimumPrice,
          finalPrice,
          rule: itemTotal >= minimumPrice ? '使用正常价格' : '使用最低价格',
          is_set_minimum_price: item.is_set_minimum_price,
          minimum_price: item.minimum_price
        })

        return total + finalPrice
      }

      console.log('工价项计算（正常价格）:', {
        work_title: item.work_title,
        price,
        quantity,
        itemTotal,
        is_set_minimum_price: item.is_set_minimum_price,
        minimum_price: item.minimum_price
      })

      return total + itemTotal
    }, 0)
  })

  // 加入清单
  const addToCart = (price: any) => {
    console.log('添加工价到清单:', {
      price,
      is_set_minimum_price: price.is_set_minimum_price,
      minimum_price: price.minimum_price
    })

    // 检查是否已存在相同工价id的项（使用工价项的唯一id，而不是work_kind_id）
    const existingIndex = cartList.value.findIndex((item) => item.id === price.id)

    if (existingIndex !== -1) {
      // 如果已存在，增加数量（确保是整数）
      const existingItem = cartList.value[existingIndex]
      existingItem.quantity = Math.floor((existingItem.quantity || 1) + 1)
      showToast('已添加到清单')
    } else {
      // 如果不存在，添加新工价
      const newItem = {
        id: price.id,
        work_kind_id: price.work_kind?.id || price.work_kind_id,
        work_title: price.work_title,
        work_price: price.work_price,
        pricing_description: price.pricing_description,
        service_scope: price.service_scope,
        display_images: price.display_images || [],
        service_details: price.service_details || [],
        labour_cost_id: price.labour_cost?.id || price.labour_cost_id,
        labour_cost: price.labour_cost,
        work_kind: price.work_kind,
        is_set_minimum_price: price.is_set_minimum_price,
        minimum_price: price.minimum_price,
        quantity: 1
      }
      console.log('添加新工价项:', newItem)
      cartList.value.push(newItem)
      showToast('已加入清单')
    }

    saveCartToStorage()
  }

  // 更新清单项
  const updateCartItem = (item: PriceCartItem) => {
    const index = cartList.value.findIndex((i) => i.id === item.id)
    if (index !== -1) {
      // 确保 quantity 是整数
      const updatedItem = {
        ...cartList.value[index],
        ...item,
        quantity:
          item.quantity !== undefined
            ? Math.floor(Number(item.quantity))
            : cartList.value[index].quantity
      }
      cartList.value[index] = updatedItem
      saveCartToStorage()
    }
  }

  // 删除清单项
  const removeCartItem = (id: number) => {
    const index = cartList.value.findIndex((item) => item.id === id)
    if (index > -1) {
      cartList.value.splice(index, 1)
      saveCartToStorage()
      showToast('已删除')
    }
  }

  // 初始化时加载清单
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
