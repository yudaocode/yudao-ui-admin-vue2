<template>
  <div>
    <ComponentContainerProperty v-model="formData.style">
      <el-form label-width="80px" :model="formData">
        <el-card header="优惠券列表" class="property-group" shadow="never">
          <div
            v-for="(coupon, index) in couponList"
            :key="index"
            class="coupon-summary"
          >
            <span class="coupon-name">{{ coupon.name }}</span>
            <span class="coupon-desc">
              <span v-if="coupon.usePrice > 0">满{{ floatToFixed2(coupon.usePrice) }}元，</span>
              <span v-if="coupon.discountType === PromotionDiscountTypeEnum.PRICE.type">
                减{{ floatToFixed2(coupon.discountPrice) }}元
              </span>
              <span v-else>打{{ coupon.discountPercent }}折</span>
            </span>
          </div>
          <el-form-item label-width="0">
            <el-button class="add-button" type="primary" plain @click="handleAddCoupon">
              <i class="el-icon-plus" /> 添加
            </el-button>
          </el-form-item>
        </el-card>
        <el-card header="优惠券样式" class="property-group" shadow="never">
          <el-form-item label="列数" prop="type">
            <el-radio-group v-model="formData.columns">
              <el-tooltip class="item" content="一列" placement="bottom">
                <el-radio-button :label="1">
                  <svg-icon icon-class="fluent:text-column-one-24-filled" />
                </el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" content="二列" placement="bottom">
                <el-radio-button :label="2">
                  <svg-icon icon-class="fluent:text-column-two-24-filled" />
                </el-radio-button>
              </el-tooltip>
              <el-tooltip class="item" content="三列" placement="bottom">
                <el-radio-button :label="3">
                  <svg-icon icon-class="fluent:text-column-three-24-filled" />
                </el-radio-button>
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="背景图片" prop="bgImg">
            <UploadImg v-model="formData.bgImg" height="80px" width="100%" class="background-upload" />
          </el-form-item>
          <el-form-item label="文字颜色" prop="textColor">
            <ColorInput v-model="formData.textColor" />
          </el-form-item>
          <el-form-item label="按钮背景" prop="button.bgColor">
            <ColorInput v-model="formData.button.bgColor" />
          </el-form-item>
          <el-form-item label="按钮文字" prop="button.color">
            <ColorInput v-model="formData.button.color" />
          </el-form-item>
          <el-form-item label="间隔" prop="space">
            <el-slider
              v-model="formData.space"
              :max="100"
              :min="0"
              show-input
              input-size="small"
              :show-input-controls="false"
            />
          </el-form-item>
        </el-card>
      </el-form>
    </ComponentContainerProperty>
    <CouponSelect
      ref="couponSelectDialog"
      :multiple-selection.sync="couponList"
      :take-type="CouponTemplateTakeTypeEnum.USER.type"
      @change="handleCouponSelect"
    />
  </div>
</template>

<script>
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import ColorInput from '@/components/ColorInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import { CouponTemplateTakeTypeEnum, PromotionDiscountTypeEnum } from '@/utils/constants'
import { floatToFixed2 } from '@/utils'
import CouponSelect from '@/views/mall/promotion/coupon/components/CouponSelect.vue'

export default {
  name: 'CouponCardProperty',
  components: { ColorInput, ComponentContainerProperty, CouponSelect, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      couponList: [],
      CouponTemplateTakeTypeEnum,
      PromotionDiscountTypeEnum
    }
  },
  computed: {
    formData() {
      return this.value
    }
  },
  watch: {
    'formData.couponIds': {
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
    }
  },
  methods: {
    floatToFixed2,
    handleAddCoupon() {
      return this.$refs.couponSelectDialog.open()
    },
    handleCouponSelect() {
      this.formData.couponIds = this.couponList.map(coupon => coupon.id)
    }
  }
}
</script>

<style scoped lang="scss">
.coupon-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.coupon-name,
.coupon-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.coupon-name {
  font-size: 16px;
}
.coupon-desc {
  color: #909399;
}
.add-button {
  width: 100%;
  margin-top: 8px;
}
.background-upload {
  min-width: 160px;
}
</style>
