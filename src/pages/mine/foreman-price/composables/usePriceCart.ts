import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import {
  getCartRefAutoAddConfig,
  normalizeQuantity,
  resolveWorkPriceQuantity
} from '../utils/calculate-work-price-quantity'
import { normalizeWorkPriceCode, resolveWorkPriceCode } from '../utils/resolve-work-price-code'

export interface WorkPriceSource {
  id?: number
  code?: string
  work_kind_id?: number
  work_title?: string
  work_price?: string
  pricing_description?: string
  service_scope?: string
  display_images?: string[]
  service_details?: unknown[]
  labour_cost_id?: number
  labour_cost?: PriceCartItem['labour_cost']
  work_kind?: PriceCartItem['work_kind']
  is_set_minimum_price?: string
  minimum_price?: string
}

// 工价清单项类型
export interface PriceCartItem {
  id?: number
  code?: string
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
  quantity?: number | string
}

export function usePriceCart(
  orderId?: string | number,
  area?: unknown,
  findWorkPriceByCode?: (
    code: string,
    nearPrices?: WorkPriceSource[]
  ) => WorkPriceSource | undefined
) {
  const route = useRoute()
  const cartList = ref<PriceCartItem[]>([])

  const getArea = () => {
    const rawArea = area ?? route.query.area
    const parsed = Number(rawArea)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const resolveQuantity = (price: WorkPriceSource, excludeCode?: string) => {
    const normalizedExcludeCode = normalizeWorkPriceCode(excludeCode)
    const contextCartList = normalizedExcludeCode
      ? cartList.value.filter(
          (item) => normalizeWorkPriceCode(resolveWorkPriceCode(item)) !== normalizedExcludeCode
        )
      : cartList.value

    return resolveWorkPriceQuantity(resolveWorkPriceCode(price), {
      area: getArea(),
      cartList: contextCartList
    })
  }

  const findCartItemIndexByCode = (code?: string) => {
    const normalizedCode = normalizeWorkPriceCode(code)
    if (!normalizedCode) return -1

    return cartList.value.findIndex(
      (item) => normalizeWorkPriceCode(resolveWorkPriceCode(item)) === normalizedCode
    )
  }

  const buildCartItem = (price: WorkPriceSource, quantity: number): PriceCartItem => ({
    id: price.id,
    code: resolveWorkPriceCode(price),
    work_kind_id: price.work_kind?.id || price.work_kind_id || 0,
    work_title: price.work_title || '',
    work_price: price.work_price || '',
    pricing_description: price.pricing_description,
    service_scope: price.service_scope,
    display_images: price.display_images || [],
    service_details: price.service_details || [],
    labour_cost_id: price.labour_cost?.id || price.labour_cost_id,
    labour_cost: price.labour_cost,
    work_kind: price.work_kind,
    is_set_minimum_price: price.is_set_minimum_price,
    minimum_price: price.minimum_price,
    quantity: normalizeQuantity(quantity)
  })

  const ensureRefWorkPriceInCart = (price: WorkPriceSource, nearPrices?: WorkPriceSource[]) => {
    const autoAddConfig = getCartRefAutoAddConfig(resolveWorkPriceCode(price))
    if (!autoAddConfig) return

    const refQuantity = normalizeQuantity(autoAddConfig.defaultQuantity)
    const existingRefIndex = findCartItemIndexByCode(autoAddConfig.refCode)

    if (existingRefIndex !== -1) {
      if (autoAddConfig.incrementExisting) {
        const refItem = cartList.value[existingRefIndex]
        refItem.quantity = normalizeQuantity(
          (Number(refItem.quantity) || 0) + autoAddConfig.defaultQuantity
        )
      }
      return
    }

    const refPrice = findWorkPriceByCode?.(autoAddConfig.refCode, nearPrices)
    if (!refPrice) {
      showToast(`未找到「${autoAddConfig.refName ?? autoAddConfig.refCode}」工价，请手动添加`)
      return
    }

    cartList.value.push(buildCartItem(refPrice, refQuantity))
  }

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
        // 确保每个项都有 quantity 字段，如果没有则设置为 1（支持一位小数）
        cartList.value = parsed.map((item: PriceCartItem) => ({
          ...item,
          code: resolveWorkPriceCode(item) ?? item.code,
          quantity: normalizeQuantity(item.quantity)
        }))

        console.log('从 localStorage 加载工价清单:', cartList.value)
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

  // 计算清单项数（工价种类数，而非数量之和）
  const cartTotalCount = computed(() => {
    return cartList.value.length
  })

  // 计算总价格（考虑数量和最低价格）
  const totalPrice = computed(() => {
    console.log('=== 开始计算总价 ===')
    console.log('清单项数:', cartList.value.length)

    const result = cartList.value.reduce((total, item) => {
      const price = parseFloat(String(item.work_price)) || 0
      const quantity =
        item.quantity === '' || item.quantity == null ? 0 : Number(item.quantity) || 0
      const itemTotal = price * quantity

      // 检查是否设置了最低价格（兼容字符串 '1' 和数字 1）
      const hasMinimumPrice =
        String(item.is_set_minimum_price) === '1' || Number(item.is_set_minimum_price) === 1
      const hasValidMinimumPrice = hasMinimumPrice && item.minimum_price

      console.log(`计算项目: ${item.work_title}`)
      console.log(`  - 工价: ${price}, 数量: ${quantity}, 小计: ${itemTotal}`)
      console.log(
        `  - is_set_minimum_price: ${item.is_set_minimum_price} (hasMinimumPrice: ${hasMinimumPrice})`
      )
      console.log(
        `  - minimum_price: ${item.minimum_price} (hasValidMinimumPrice: ${hasValidMinimumPrice})`
      )

      if (hasValidMinimumPrice) {
        const minimumPrice = parseFloat(String(item.minimum_price)) || 0

        // 如果总价超过了最低价格，使用正常价格；否则使用最低价格
        const finalPrice = itemTotal >= minimumPrice ? itemTotal : minimumPrice

        console.log(
          `  - 应用最低价格规则: 使用${itemTotal >= minimumPrice ? '正常价格' : '最低价格'} = ${finalPrice}`
        )

        return total + finalPrice
      }

      // 没有最低价格或最低价格数据不完整，使用正常价格
      console.log(`  - 不应用最低价格规则，使用正常价格 = ${itemTotal}`)

      return total + itemTotal
    }, 0)

    console.log('=== 总价计算结果:', result, '===')
    return result
  })

  // 加入清单
  const addToCart = (price: WorkPriceSource, nearPrices?: WorkPriceSource[]) => {
    console.log('添加工价到清单:', {
      price,
      is_set_minimum_price: price.is_set_minimum_price,
      minimum_price: price.minimum_price
    })

    ensureRefWorkPriceInCart(price, nearPrices)

    const workPriceCode = resolveWorkPriceCode(price)
    const existingIndex = findCartItemIndexByCode(workPriceCode)
    const quantityResult = resolveQuantity(price, existingIndex !== -1 ? workPriceCode : undefined)

    if (quantityResult?.missingRefName) {
      showToast(`请先添加「${quantityResult.missingRefName}」工价`)
    }

    const quantity = normalizeQuantity(quantityResult?.quantity ?? 1)

    if (existingIndex !== -1) {
      const existingItem = cartList.value[existingIndex]
      existingItem.quantity = quantityResult
        ? quantity
        : normalizeQuantity((Number(existingItem.quantity) || 1) + 1)
      showToast('已添加到清单')
    } else {
      const newItem = buildCartItem(price, quantity)
      console.log('添加新工价项:', newItem)
      cartList.value.push(newItem)
      showToast('已加入清单')
    }

    saveCartToStorage()
  }

  // 更新清单项（v-model 已直接修改 item，此处规范化数量并持久化）
  const updateCartItem = (item?: PriceCartItem) => {
    if (item) {
      item.quantity = normalizeQuantity(item.quantity)
    }
    saveCartToStorage()
  }

  // 删除清单项
  const removeCartItem = (item: PriceCartItem) => {
    let index = findCartItemIndexByCode(resolveWorkPriceCode(item))
    if (index === -1) {
      index = cartList.value.findIndex((cartItem) => cartItem.id === item.id)
    }

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
