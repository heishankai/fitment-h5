export type AreaQuantityRule = {
  type: 'area'
  multipliers: number[]
}

export type CartRefQuantityRule = {
  type: 'cartRef'
  refCode: string
  refName?: string
  /** 关联工价不在清单时自动添加，并设置默认数量 */
  autoAddRef?: {
    defaultQuantity: number
    /** 关联工价已存在时，在原有数量上累加 defaultQuantity */
    incrementExisting?: boolean
  }
} & (
  | {
      /** 按关联工价数量计算自身数量（默认） */
      quantityMode?: 'ref'
      operator: 'add' | 'multiply'
      operand: number
    }
  | {
      /** 自身数量固定，仅自动添加关联工价 */
      quantityMode: 'fixed'
      fixedQuantity: number
    }
  | {
      /** 自身数量与关联工价保持一致 */
      quantityMode: 'syncRef'
    }
)

export type WorkPriceQuantityRule = AreaQuantityRule | CartRefQuantityRule

/** 接口未返回 code 时，按工价名称兜底匹配 */
export const WORK_PRICE_TITLE_CODE_MAP = new Map<string, string>([
  ['全房电路全改施工服务', 'QWDLQGSGFW'],
  ['高端个性定制设计', 'GDGXXGDJSGFW'],
  ['基础个性定制设计', 'JCXGDJSGFW'],
  ['墙固滚涂服务', 'QGGPTGFW'],
  ['墙顶面腻子施工及打磨服务', 'QDMXZSJHDMGFW'],
  ['墙漆一底两面涂刷施工服务', 'QQDMTSGFW'],
  ['线槽粉整服务', 'XCFZFW'],
  ['铺贴墙砖面积', 'PTPQZBGM'],
  ['满涂背胶面积', 'MTBJMJ'],
  ['隔音棉', 'GYM'],
  ['包管数量', 'BGSL']
])

/** 工价 code 对应的名称关键词（用于接口数据匹配） */
export const WORK_PRICE_CODE_TITLE_ALIASES = new Map<string, string[]>([
  ['MTBJMJ', ['满涂背胶面积', '满涂背胶', '背胶面积']],
  ['PTPQZBGM', ['铺贴墙砖面积', '铺贴墙砖', '墙砖面积']],
  ['BGSL', ['包管数量', '包管']],
  ['GYM', ['隔音棉']]
])

/** 工价数量自动计算规则，key 为工价 code */
export const WORK_PRICE_QUANTITY_RULES = new Map<string, WorkPriceQuantityRule>([
  ['QWDLQGSGFW', { type: 'area', multipliers: [0.9] }],
  ['GDGXXGDJSGFW', { type: 'area', multipliers: [0.9] }],
  ['JCXGDJSGFW', { type: 'area', multipliers: [0.9] }],
  ['QGGPTGFW', { type: 'area', multipliers: [0.9, 2.5] }],
  ['QDMXZSJHDMGFW', { type: 'area', multipliers: [0.9, 2.5] }],
  ['QQDMTSGFW', { type: 'area', multipliers: [0.9, 2.5] }],
  ['XCFZFW', { type: 'area', multipliers: [0.9] }],
  [
    'PTPQZBGM',
    {
      type: 'cartRef',
      refCode: 'MTBJMJ',
      refName: '满涂背胶面积',
      quantityMode: 'syncRef',
      autoAddRef: { defaultQuantity: 1, incrementExisting: true }
    }
  ],
  [
    'GYM',
    {
      type: 'cartRef',
      refCode: 'BGSL',
      refName: '包管数量',
      quantityMode: 'fixed',
      fixedQuantity: 1,
      autoAddRef: { defaultQuantity: 3.5 }
    }
  ]
])
