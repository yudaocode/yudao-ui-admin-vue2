<template>
  <el-scrollbar
    ref="container"
    class="coupon-scrollbar"
    wrap-class="coupon-scroll-wrap"
  >
    <div
      class="coupon-list"
      :style="{
        gap: property.space + 'px',
        width: scrollbarWidth
      }"
    >
      <div
        v-for="(coupon, index) in couponList"
        :key="index"
        class="coupon-item"
        :style="{
          background: property.bgImg
            ? 'url(' + property.bgImg + ') 100% center / 100% 100% no-repeat'
            : '#fff',
          width: couponWidth + 'px',
          color: property.textColor
        }"
      >
        <div v-if="property.columns === 1" class="coupon-one-column">
          <div class="coupon-main">
            <CouponDiscount :coupon="coupon" />
            <CouponDiscountDesc :coupon="coupon" />
            <CouponValidTerm :coupon="coupon" />
          </div>
          <div class="coupon-action">
            <div
              class="receive-button"
              :style="{
                color: property.button.color,
                background: property.button.bgColor
              }"
            >
              立即领取
            </div>
          </div>
        </div>
        <div v-else-if="property.columns === 2" class="coupon-two-column">
          <div class="coupon-main">
            <CouponDiscount :coupon="coupon" />
            <CouponDiscountDesc :coupon="coupon" />
            <div v-if="coupon.totalCount >= 0">
              仅剩：{{ coupon.totalCount - coupon.takeCount }}张
            </div>
            <div v-else-if="coupon.totalCount === -1">仅剩：不限制</div>
          </div>
          <div class="coupon-action coupon-action-vertical">
            <div
              class="receive-button-vertical"
              :style="{
                color: property.button.color,
                background: property.button.bgColor
              }"
            >
              立即领取
            </div>
          </div>
        </div>
        <div v-else class="coupon-three-column">
          <CouponDiscount :coupon="coupon" />
          <CouponDiscountDesc :coupon="coupon" />
          <div
            class="receive-button"
            :style="{
              color: property.button.color,
              background: property.button.bgColor
            }"
          >
            立即领取
          </div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import { CouponDiscount, CouponDiscountDesc, CouponValidTerm } from './component'

export default {
  name: 'CouponCard',
  components: { CouponDiscount, CouponDiscountDesc, CouponValidTerm },
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return {
      couponList: [],
      phoneWidth: 375,
      scrollbarWidth: '100%',
      couponWidth: 375
    }
  },
  watch: {
    'property.couponIds': {
      immediate: true,
      deep: true,
      handler(couponIds) {
        if (couponIds && couponIds.length > 0) {
          return CouponTemplateApi.getCouponTemplateList(couponIds).then(response => {
            this.couponList = response.data
            return this.couponList
          })
        }
      }
    },
    property: {
      immediate: true,
      deep: true,
      handler() {
        this.calculateLayout()
      }
    },
    'couponList.length': {
      immediate: true,
      handler() {
        this.calculateLayout()
      }
    }
  },
  mounted() {
    this.phoneWidth =
      (this.$refs.container && this.$refs.container.wrap
        ? this.$refs.container.wrap.offsetWidth
        : 0) || 375
    this.calculateLayout()
  },
  methods: {
    calculateLayout() {
      this.couponWidth =
        (this.phoneWidth - this.property.space * (this.property.columns - 1)) /
        this.property.columns
      this.scrollbarWidth =
        this.couponWidth * this.couponList.length +
        this.property.space * (this.couponList.length - 1) +
        'px'
    }
  }
}
</script>

<style scoped lang="scss">
.coupon-scrollbar {
  z-index: 1;
  min-height: 30px;
}
::v-deep .coupon-scroll-wrap {
  width: 100%;
}
.coupon-list {
  display: flex;
  flex-direction: row;
  font-size: 12px;
}
.coupon-item {
  box-sizing: content-box;
}
.coupon-one-column,
.coupon-two-column {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px;
  margin-left: 16px;
}
.coupon-main {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 4px;
}
.coupon-action {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.coupon-action-vertical {
  justify-content: flex-start;
}
.receive-button {
  padding: 2px 8px;
  border-radius: 20px;
}
.receive-button-vertical {
  width: 20px;
  height: 100%;
  padding: 8px 2px;
  text-align: center;
  border-radius: 20px;
  box-sizing: border-box;
}
.coupon-three-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 4px;
  gap: 4px;
}
::v-deep .coupon-discount-value {
  font-size: 20px;
  font-weight: bold;
}
</style>
