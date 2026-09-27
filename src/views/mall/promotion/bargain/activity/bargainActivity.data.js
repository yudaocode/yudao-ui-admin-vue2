function required(message, trigger) {
  return { required: true, message, trigger }
}

// 字段与后端 BargainActivityBaseVO 保持一致。
export const rules = {
  name: [required('砍价活动名称不能为空', 'blur')],
  startTime: [required('活动开始时间不能为空', 'change')],
  endTime: [required('活动结束时间不能为空', 'change')],
  helpMaxCount: [required('砍价人数不能为空', 'change')],
  bargainCount: [required('最大帮砍次数不能为空', 'change')],
  totalLimitCount: [required('总限购数量不能为空', 'change')],
  randomMinPrice: [required('每次砍价最小金额不能为空', 'change')],
  randomMaxPrice: [required('每次砍价最大金额不能为空', 'change')]
}

export const productRuleConfig = [
  {
    name: 'productConfig.bargainFirstPrice',
    rule: value => Number(value) > 0,
    message: '商品砍价起始价格必须大于 0 ！！！'
  },
  {
    name: 'productConfig.bargainMinPrice',
    rule: value => Number(value) >= 0,
    message: '商品砍价底价不能小于 0 ！！！'
  },
  {
    name: 'productConfig.stock',
    rule: value => Number.isInteger(Number(value)) && Number(value) >= 1,
    message: '商品活动库存不能小于 1 ！！！'
  }
]
