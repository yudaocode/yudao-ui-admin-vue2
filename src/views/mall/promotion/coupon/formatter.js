import { CouponTemplateValidityTypeEnum, PromotionDiscountTypeEnum } from '@/utils/constants'
import { parseTime } from '@/utils/ruoyi'

/**
 * 格式化优惠券优惠金额或折扣。
 * 后端金额字段以分为单位；折扣百分比直接按接口返回值展示。
 */
export function discountFormat(row) {
  if (!row) return ''
  if (row.discountType === PromotionDiscountTypeEnum.PRICE.type) {
    return `￥${(Number(row.discountPrice || 0) / 100).toFixed(2)}`
  }
  if (row.discountType === PromotionDiscountTypeEnum.PERCENT.type) {
    return `${Number(row.discountPercent || 0)}%`
  }
  return `未知【${row.discountType}】`
}

/** 格式化领取上限。 */
export function takeLimitCountFormat(row) {
  if (!row || row.takeLimitCount === undefined || row.takeLimitCount === null) return ' '
  if (Number(row.takeLimitCount) === -1) return '无领取限制'
  return `${row.takeLimitCount} 张/人`
}

/** 格式化有效期限。 */
export function validityTypeFormat(row) {
  if (!row) return ''
  if (row.validityType === CouponTemplateValidityTypeEnum.DATE.type) {
    return `${parseTime(row.validStartTime) || ''} 至 ${parseTime(row.validEndTime) || ''}`
  }
  if (row.validityType === CouponTemplateValidityTypeEnum.TERM.type) {
    return `领取后第 ${row.fixedStartTerm} - ${row.fixedEndTerm} 天内可用`
  }
  return `未知【${row.validityType}】`
}

/** 格式化发放数量。 */
export function totalCountFormat(row) {
  if (!row || row.totalCount === undefined || row.totalCount === null) return ' '
  return Number(row.totalCount) === -1 ? '不限制' : String(row.totalCount)
}

/** 格式化剩余数量。 */
export function remainedCountFormat(row) {
  if (!row || row.totalCount === undefined || row.totalCount === null) return ' '
  if (Number(row.totalCount) === -1) return '不限制'
  return String(Number(row.totalCount) - Number(row.takeCount || 0))
}

/** 格式化最低消费金额。 */
export function usePriceFormat(row) {
  return `￥${(Number(row && row.usePrice || 0) / 100).toFixed(2)}`
}
