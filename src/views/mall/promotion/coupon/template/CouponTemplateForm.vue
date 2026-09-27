<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="140px"
    >
      <el-form-item
        label="优惠券名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入优惠券名称"
        />
      </el-form-item>
      <el-form-item
        label="优惠券描述"
        prop="description"
      >
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          maxlength="512"
          show-word-limit
          clearable
          placeholder="请输入优惠券描述"
        />
      </el-form-item>
      <el-form-item
        label="优惠券类型"
        prop="productScope"
      >
        <el-radio-group v-model="form.productScope">
          <el-radio
            v-for="dict in productScopeDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="form.productScope === PromotionProductScopeEnum.SPU.scope"
        label="商品"
        prop="productSpuIds"
      >
        <SpuShowcase v-model="form.productSpuIds" />
      </el-form-item>
      <el-form-item
        v-if="form.productScope === PromotionProductScopeEnum.CATEGORY.scope"
        label="分类"
        prop="productCategoryIds"
      >
        <ProductCategorySelect v-model="form.productCategoryIds" />
      </el-form-item>
      <el-form-item
        label="优惠类型"
        prop="discountType"
      >
        <el-radio-group v-model="form.discountType">
          <el-radio
            v-for="dict in discountTypeDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="form.discountType === PromotionDiscountTypeEnum.PRICE.type"
        label="优惠券面额"
        prop="discountPrice"
      >
        <el-input-number
          v-model="form.discountPrice"
          :min="0"
          :precision="2"
          controls-position="right"
          style="width: 400px"
          placeholder="请输入优惠金额，单位：元"
        />
        元
      </el-form-item>
      <el-form-item
        v-if="form.discountType === PromotionDiscountTypeEnum.PERCENT.type"
        label="优惠券折扣"
        prop="discountPercent"
      >
        <el-input-number
          v-model="form.discountPercent"
          :min="1"
          :max="9.9"
          :precision="1"
          controls-position="right"
          style="width: 400px"
          placeholder="优惠券折扣不能小于 1 折，且不可大于 9.9 折"
        />
        折
      </el-form-item>
      <el-form-item
        v-if="form.discountType === PromotionDiscountTypeEnum.PERCENT.type"
        label="最多优惠"
        prop="discountLimitPrice"
      >
        <el-input-number
          v-model="form.discountLimitPrice"
          :min="0"
          :precision="2"
          controls-position="right"
          style="width: 400px"
          placeholder="请输入最多优惠"
        />
        元
      </el-form-item>
      <el-form-item
        label="满多少元可以使用"
        prop="usePrice"
      >
        <el-input-number
          v-model="form.usePrice"
          :min="0"
          :precision="2"
          controls-position="right"
          style="width: 400px"
          placeholder="无门槛请设为 0"
        />
        元
      </el-form-item>
      <el-form-item
        label="领取方式"
        prop="takeType"
      >
        <el-radio-group v-model="form.takeType">
          <el-radio
            v-for="dict in takeTypeDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="form.takeType === CouponTemplateTakeTypeEnum.USER.type"
        label="发放数量"
        prop="totalCount"
      >
        <el-input-number
          v-model="form.totalCount"
          :min="-1"
          :precision="0"
          controls-position="right"
          style="width: 400px"
          placeholder="发放数量，-1 为不限制"
        />
        张
      </el-form-item>
      <el-form-item
        v-if="form.takeType === CouponTemplateTakeTypeEnum.USER.type"
        label="每人限领个数"
        prop="takeLimitCount"
      >
        <el-input-number
          v-model="form.takeLimitCount"
          :min="-1"
          :precision="0"
          controls-position="right"
          style="width: 400px"
          placeholder="设置为 -1 时，可无限领取"
        />
        张
      </el-form-item>
      <el-form-item
        label="有效期类型"
        prop="validityType"
      >
        <el-radio-group v-model="form.validityType">
          <el-radio
            v-for="dict in validityTypeDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="form.validityType === CouponTemplateValidityTypeEnum.DATE.type"
        label="固定日期"
        prop="validTimes"
      >
        <el-date-picker
          v-model="form.validTimes"
          type="datetimerange"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 400px"
        />
      </el-form-item>
      <el-form-item
        v-if="form.validityType === CouponTemplateValidityTypeEnum.TERM.type"
        label="领取日期"
        prop="fixedStartTerm"
      >
        第
        <el-input-number
          v-model="form.fixedStartTerm"
          :min="0"
          :precision="0"
          class="term-input"
        />
        至
        <el-input-number
          v-model="form.fixedEndTerm"
          :min="0"
          :precision="0"
          class="term-input"
        />
        天有效
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ProductCategorySelect from '@/views/mall/product/category/components/ProductCategorySelect.vue'
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import SpuShowcase from '@/views/mall/product/spu/components/SpuShowcase.vue'
import {
  CouponTemplateTakeTypeEnum,
  CouponTemplateValidityTypeEnum,
  PromotionDiscountTypeEnum,
  PromotionProductScopeEnum
} from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'CouponTemplateForm',
  components: { Dialog, ProductCategorySelect, SpuShowcase },
  data() {
    return {
      DICT_TYPE,
      CouponTemplateTakeTypeEnum,
      CouponTemplateValidityTypeEnum,
      PromotionDiscountTypeEnum,
      PromotionProductScopeEnum,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      productScopeDictDatas: getDictDatas(DICT_TYPE.PROMOTION_PRODUCT_SCOPE),
      discountTypeDictDatas: getDictDatas(DICT_TYPE.PROMOTION_DISCOUNT_TYPE),
      takeTypeDictDatas: getDictDatas(DICT_TYPE.PROMOTION_COUPON_TAKE_TYPE),
      validityTypeDictDatas: getDictDatas(DICT_TYPE.PROMOTION_COUPON_TEMPLATE_VALIDITY_TYPE),
      form: this.defaultForm(),
      rules: {
        name: [{ required: true, message: '优惠券名称不能为空', trigger: 'blur' }],
        discountType: [{ required: true, message: '优惠券类型不能为空', trigger: 'change' }],
        discountPrice: [{ required: true, message: '优惠券面额不能为空', trigger: 'blur' }],
        discountPercent: [{ required: true, message: '优惠券折扣不能为空', trigger: 'blur' }],
        discountLimitPrice: [{ required: true, message: '最多优惠不能为空', trigger: 'blur' }],
        usePrice: [{ required: true, message: '满多少元可以使用不能为空', trigger: 'blur' }],
        takeType: [{ required: true, message: '领取方式不能为空', trigger: 'change' }],
        totalCount: [{ required: true, message: '发放数量不能为空', trigger: 'blur' }],
        takeLimitCount: [{ required: true, message: '每人限领个数不能为空', trigger: 'blur' }],
        validityType: [{ required: true, message: '有效期类型不能为空', trigger: 'change' }],
        validTimes: [{ required: true, message: '固定日期不能为空', trigger: 'change' }],
        fixedStartTerm: [{ required: true, message: '开始领取天数不能为空', trigger: 'blur' }],
        fixedEndTerm: [{ required: true, message: '开始领取天数不能为空', trigger: 'blur' }],
        productScope: [{ required: true, message: '商品范围不能为空', trigger: 'blur' }],
        productSpuIds: [{ required: true, message: '商品不能为空', trigger: 'blur' }],
        productCategoryIds: [{ required: true, message: '分类不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: undefined,
        description: undefined,
        discountType: PromotionDiscountTypeEnum.PRICE.type,
        discountPrice: undefined,
        discountPercent: undefined,
        discountLimitPrice: undefined,
        usePrice: undefined,
        takeType: CouponTemplateTakeTypeEnum.USER.type,
        totalCount: undefined,
        takeLimitCount: undefined,
        validityType: CouponTemplateValidityTypeEnum.DATE.type,
        validTimes: [],
        validStartTime: undefined,
        validEndTime: undefined,
        fixedStartTerm: undefined,
        fixedEndTerm: undefined,
        productScope: PromotionProductScopeEnum.ALL.scope,
        productScopeValues: [],
        productSpuIds: [],
        productCategoryIds: undefined
      }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改优惠劵' : '添加优惠劵'
      this.form = this.defaultForm()
      this.dialogVisible = true
      this.formLoading = false
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        return CouponTemplateApi.getCouponTemplate(id)
          .then((response) => {
            const data = response.data
            const values = Array.isArray(data.productScopeValues) ? data.productScopeValues : []
            this.form = Object.assign(this.defaultForm(), data, {
              discountPrice: data.discountPrice !== undefined ? Number(data.discountPrice) / 100 : undefined,
              discountPercent: data.discountPercent !== undefined ? Number(data.discountPercent) / 10 : undefined,
              discountLimitPrice: data.discountLimitPrice !== undefined ? Number(data.discountLimitPrice) / 100 : undefined,
              usePrice: data.usePrice !== undefined ? Number(data.usePrice) / 100 : undefined,
              validTimes: data.validStartTime && data.validEndTime ? [data.validStartTime, data.validEndTime] : [],
              productScopeValues: values,
              productSpuIds: data.productScope === PromotionProductScopeEnum.SPU.scope ? values : [],
              productCategoryIds: data.productScope === PromotionProductScopeEnum.CATEGORY.scope ? values[0] : undefined
            })
          })
          .finally(() => {
            this.formLoading = false
          })
      }
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const data = Object.assign({}, this.form, {
          discountPrice: this.form.discountPrice !== undefined ? Math.round(Number(this.form.discountPrice) * 100) : undefined,
          discountPercent: this.form.discountPercent !== undefined ? Math.round(Number(this.form.discountPercent) * 10) : undefined,
          discountLimitPrice: this.form.discountLimitPrice !== undefined ? Math.round(Number(this.form.discountLimitPrice) * 100) : undefined,
          usePrice: this.form.usePrice !== undefined ? Math.round(Number(this.form.usePrice) * 100) : undefined,
          validStartTime: this.form.validTimes && this.form.validTimes.length === 2 ? this.form.validTimes[0] : undefined,
          validEndTime: this.form.validTimes && this.form.validTimes.length === 2 ? this.form.validTimes[1] : undefined,
          totalCount: this.form.takeType === CouponTemplateTakeTypeEnum.USER.type ? this.form.totalCount : -1,
          takeLimitCount: this.form.takeType === CouponTemplateTakeTypeEnum.USER.type ? this.form.takeLimitCount : -1,
          productScopeValues: this.getProductScopeValues()
        })
        delete data.validTimes
        delete data.productSpuIds
        delete data.productCategoryIds
        const saveRequest = this.formType === 'update'
          ? CouponTemplateApi.updateCouponTemplate(data)
          : CouponTemplateApi.createCouponTemplate(data)
        saveRequest
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },
    getProductScopeValues() {
      if (this.form.productScope === PromotionProductScopeEnum.SPU.scope) return this.form.productSpuIds || []
      if (this.form.productScope === PromotionProductScopeEnum.CATEGORY.scope) {
        return this.form.productCategoryIds ? [this.form.productCategoryIds] : []
      }
      return []
    }
  }
}
</script>

<style scoped>
.term-input {
  width: 150px;
  margin: 0 8px;
}
</style>
