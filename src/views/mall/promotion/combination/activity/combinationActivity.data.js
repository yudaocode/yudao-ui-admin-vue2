// 拼团活动表单校验，与 Vue3 combinationActivity.data.ts 的必填项保持一致。
export const rules = {
  name: [{ required: true, message: '拼团名称不能为空', trigger: 'blur' }],
  totalLimitCount: [{ required: true, message: '总限购数量不能为空', trigger: 'change' }],
  singleLimitCount: [{ required: true, message: '单次限购数量不能为空', trigger: 'change' }],
  startTime: [{ required: true, message: '活动开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '活动结束时间不能为空', trigger: 'change' }],
  userSize: [{ required: true, message: '参与人数不能为空', trigger: 'change' }],
  limitDuration: [{ required: true, message: '限制时长不能为空', trigger: 'change' }],
  virtualGroup: [{ required: true, message: '虚拟成团不能为空', trigger: 'change' }]
}

export const productRuleConfig = [
  {
    name: 'productConfig.combinationPrice',
    rule: (value) => Number(value) >= 0.01,
    message: '商品拼团价格不能小于0.01 ！！！'
  }
]
