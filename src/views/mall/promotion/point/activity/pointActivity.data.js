// 积分商城活动表单校验，与 Vue3 pointActivity.data.ts 保持字段一致。
export const rules = {
  spuId: [{ required: true, message: '活动商品不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
}

// 每个参与活动的 SKU 都必须满足这些业务规则。
export const productRuleConfig = [
  {
    name: 'productConfig.stock',
    rule: (value) => Number(value) >= 1,
    message: '商品可兑换库存必须大于等于 1 ！！！'
  },
  {
    name: 'productConfig.point',
    rule: (value) => Number(value) >= 1,
    message: '商品所需兑换积分必须大于等于 1 ！！！'
  },
  {
    name: 'productConfig.count',
    rule: (value) => Number(value) >= 1,
    message: '商品可兑换次数必须大于等于 1 ！！！'
  }
]
