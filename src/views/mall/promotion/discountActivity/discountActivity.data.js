// 限时折扣活动表单校验，与 Vue3 discountActivity.data.ts 的必填项保持一致。
export const rules = {
  name: [{ required: true, message: '活动名称不能为空', trigger: 'blur' }],
  startTime: [{ required: true, message: '活动开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '活动结束时间不能为空', trigger: 'change' }],
  discountType: [{ required: true, message: '优惠类型不能为空', trigger: 'change' }]
}

// Vue3 SkuList 的 ruleConfig 在 Vue2 表单中由 validateProducts 执行。
export const productRuleConfig = [
  {
    name: 'productConfig.discountPrice',
    rule: (value) => Number(value) > 0,
    message: '商品优惠金额不能为 0 ！！！'
  }
]
