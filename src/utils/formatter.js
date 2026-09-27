import { floatToFixed2 } from './index'

// 格式化金额【分转元】
export const fenToYuanFormat = (_, __, cellValue, ___) => {
  return `￥${floatToFixed2(cellValue)}`
}
