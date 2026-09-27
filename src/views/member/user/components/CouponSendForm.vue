<template>
  <CanonicalCouponSendForm
    ref="canonicalForm"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import CanonicalCouponSendForm from '@/views/mall/promotion/coupon/components/CouponSendForm.vue'

export default {
  name: 'PromotionCouponSendForm',
  components: { CanonicalCouponSendForm },
  inheritAttrs: false,
  methods: {
    open(ids) {
      return this.$refs.canonicalForm.open(ids)
    }
  }
}
</script>
