import {
  WORK_PRICE_QUANTITY_RULES,
  WORK_PRICE_CODE_TITLE_ALIASES,
  WORK_PRICE_TITLE_CODE_MAP
} from '../constants/work-price-quantity-rules'
import type { WorkPriceSource } from '../composables/usePriceCart'

export const normalizeWorkPriceCode = (code?: string | null) =>
  code?.trim().toUpperCase() || undefined

export const KNOWN_WORK_PRICE_CODES = new Set([
  ...WORK_PRICE_QUANTITY_RULES.keys(),
  ...WORK_PRICE_TITLE_CODE_MAP.values()
])

function resolveCodeFromTitle(title: string): string | undefined {
  const exact = WORK_PRICE_TITLE_CODE_MAP.get(title)
  if (exact) return exact

  const matches = [...WORK_PRICE_TITLE_CODE_MAP.entries()]
    .filter(([key]) => title.includes(key))
    .sort((a, b) => b[0].length - a[0].length)

  return matches[0]?.[1]
}

/** 优先匹配已知 code，否则按工价名称（支持模糊匹配）兜底 */
export function resolveWorkPriceCode(
  price: Pick<WorkPriceSource, 'code' | 'work_title'>
): string | undefined {
  const title = price.work_title?.trim()
  const fromTitle = title ? resolveCodeFromTitle(title) : undefined
  const fromCode = normalizeWorkPriceCode(price.code)

  if (fromCode && KNOWN_WORK_PRICE_CODES.has(fromCode)) return fromCode
  return fromTitle ?? fromCode
}

export function getWorkPriceTitleByCode(code: string): string | undefined {
  const normalizedCode = normalizeWorkPriceCode(code)
  if (!normalizedCode) return undefined

  for (const [title, mappedCode] of WORK_PRICE_TITLE_CODE_MAP) {
    if (mappedCode === normalizedCode) return title
  }

  return WORK_PRICE_CODE_TITLE_ALIASES.get(normalizedCode)?.[0]
}

export function matchWorkPriceByCode(
  price: Pick<WorkPriceSource, 'code' | 'work_title'>,
  targetCode: string
): boolean {
  return resolveWorkPriceCode(price) === normalizeWorkPriceCode(targetCode)
}

const getTitleKeywordsByCode = (code: string) => {
  const normalizedCode = normalizeWorkPriceCode(code)
  if (!normalizedCode) return []

  const keywords = new Set<string>()
  const canonicalTitle = getWorkPriceTitleByCode(normalizedCode)
  if (canonicalTitle) keywords.add(canonicalTitle)

  WORK_PRICE_CODE_TITLE_ALIASES.get(normalizedCode)?.forEach((keyword) => keywords.add(keyword))

  return [...keywords]
}

/** 从工价列表中按 code / 名称关键词查找 */
export function findWorkPriceSourceByCode(
  code: string,
  sources: WorkPriceSource[]
): WorkPriceSource | undefined {
  const normalizedCode = normalizeWorkPriceCode(code)
  if (!normalizedCode) return undefined

  const byCode = sources.find((price) => matchWorkPriceByCode(price, normalizedCode))
  if (byCode) return byCode

  const keywords = getTitleKeywordsByCode(normalizedCode)
  for (const keyword of keywords) {
    const matched = sources.find((price) => price.work_title?.includes(keyword))
    if (matched) return matched
  }

  return undefined
}
