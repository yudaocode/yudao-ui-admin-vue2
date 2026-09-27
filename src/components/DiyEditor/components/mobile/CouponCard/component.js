import { CouponTemplateValidityTypeEnum, PromotionDiscountTypeEnum } from '@/utils/constants'
import { floatToFixed2 } from '@/utils'
import { parseTime } from '@/utils/ruoyi'

export const CouponDiscount = {
  name: 'CouponDiscount',
  props: {
    coupon: { type: Object, required: true }
  },
  render(h) {
    let value = this.coupon.discountPercent / 10 + ''
    let suffix = ' 折'
    if (this.coupon.discountType === PromotionDiscountTypeEnum.PRICE.type) {
      value = floatToFixed2(this.coupon.discountPrice)
      suffix = ' 元'
    }
    return h('div', [
      h('span', { class: 'coupon-discount-value' }, value),
      h('span', suffix)
    ])
  }
}

export const CouponDiscountDesc = {
  name: 'CouponDiscountDesc',
  props: {
    coupon: { type: Object, required: true }
  },
  render(h) {
    const useCondition =
      this.coupon.usePrice > 0 ? '满' + floatToFixed2(this.coupon.usePrice) + '元，' : ''
    const discountDesc =
      this.coupon.discountType === PromotionDiscountTypeEnum.PRICE.type
        ? '减' + floatToFixed2(this.coupon.discountPrice) + '元'
        : '打' + this.coupon.discountPercent / 10.0 + '折'
    return h('div', [h('span', useCondition), h('span', discountDesc)])
  }
}

export const CouponValidTerm = {
  name: 'CouponValidTerm',
  props: {
    coupon: { type: Object, required: true }
  },
  render(h) {
    const text =
      this.coupon.validityType === CouponTemplateValidityTypeEnum.DATE.type
        ? '有效期：' +
          parseTime(this.coupon.validStartTime, '{y}-{m}-{d}') +
          ' 至 ' +
          parseTime(this.coupon.validEndTime, '{y}-{m}-{d}')
        : '领取后第 ' +
          this.coupon.fixedStartTerm +
          ' - ' +
          this.coupon.fixedEndTerm +
          ' 天内可用'
    return h('div', text)
  }
}

