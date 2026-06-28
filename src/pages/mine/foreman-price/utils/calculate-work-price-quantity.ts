import { WORK_PRICE_QUANTITY_RULES } from '../constants/work-price-quantity-rules'
import type { PriceCartItem } from '../composables/usePriceCart'
import { normalizeWorkPriceCode, resolveWorkPriceCode } from './resolve-work-price-code'

export interface CalculateQuantityContext {
  area: number
  cartList: PriceCartItem[]
}

export interface CalculateQuantityResult {
  quantity: number
  missingRefName?: string
}

export interface CartRefAutoAddConfig {
  refCode: string
  refName?: string
  defaultQuantity: number
  incrementExisting?: boolean
}

/** 工价数量最小值（支持 0.1 起的一位小数） */
export const MIN_WORK_PRICE_QUANTITY = 0.1

/** 数量统一保留一位小数 */
export const normalizeQuantity = (value: number | string | undefined | null): number => {
  if (value === '') return 1

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 1

  const rounded = Math.round(parsed * 10) / 10
  if (rounded <= 0) return MIN_WORK_PRICE_QUANTITY

  return Math.max(MIN_WORK_PRICE_QUANTITY, rounded)
}

const findCartItemByCode = (cartList: PriceCartItem[], code: string) =>
  cartList.find(
    (item) => normalizeWorkPriceCode(resolveWorkPriceCode(item)) === normalizeWorkPriceCode(code)
  )

export function getCartRefAutoAddConfig(code: string | undefined): CartRefAutoAddConfig | null {
  const normalizedCode = normalizeWorkPriceCode(code)
  if (!normalizedCode) return null

  const rule = WORK_PRICE_QUANTITY_RULES.get(normalizedCode)
  if (rule?.type !== 'cartRef' || !rule.autoAddRef) return null

  return {
    refCode: rule.refCode,
    refName: rule.refName,
    defaultQuantity: rule.autoAddRef.defaultQuantity,
    incrementExisting: rule.autoAddRef.incrementExisting
  }
}

export function resolveWorkPriceQuantity(
  code: string | undefined,
  context: CalculateQuantityContext
): CalculateQuantityResult | null {
  const normalizedCode = normalizeWorkPriceCode(code)
  if (!normalizedCode) return null

  const rule = WORK_PRICE_QUANTITY_RULES.get(normalizedCode)
  if (!rule) return null

  if (rule.type === 'area') {
    const quantity = rule.multipliers.reduce((acc, multiplier) => acc * multiplier, context.area)
    return { quantity: normalizeQuantity(quantity) }
  }

  if (rule.quantityMode === 'fixed') {
    return { quantity: normalizeQuantity(rule.fixedQuantity) }
  }

  if (rule.quantityMode === 'syncRef') {
    const refItem = findCartItemByCode(context.cartList, rule.refCode)
    if (refItem) {
      return { quantity: normalizeQuantity(refItem.quantity) }
    }

    return { quantity: normalizeQuantity(rule.autoAddRef?.defaultQuantity ?? 1) }
  }

  const refItem = findCartItemByCode(context.cartList, rule.refCode)
  const refBaseQuantity = rule.autoAddRef?.defaultQuantity

  if (!refItem) {
    if (refBaseQuantity != null) {
      const rawQuantity =
        rule.operator === 'add' ? refBaseQuantity + rule.operand : refBaseQuantity * rule.operand

      return { quantity: normalizeQuantity(rawQuantity) }
    }

    return { quantity: normalizeQuantity(1), missingRefName: rule.refName ?? rule.refCode }
  }

  const refQuantity = Number(refItem.quantity) || refBaseQuantity || 0
  const rawQuantity =
    rule.operator === 'add' ? refQuantity + rule.operand : refQuantity * rule.operand

  return { quantity: normalizeQuantity(rawQuantity) }
}
