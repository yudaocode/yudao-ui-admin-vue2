<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="65%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
      <el-form-item
        label="活动名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入活动名称"
        />
      </el-form-item>
      <el-form-item
        label="活动时间"
        prop="startAndEndTime"
      >
        <el-date-picker
          v-model="formData.startAndEndTime"
          type="datetimerange"
          value-format="timestamp"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="条件类型"
        prop="conditionType"
      >
        <el-radio-group v-model="formData.conditionType">
          <el-radio
            v-for="dict in conditionTypeOptions"
            :key="dict.value"
            :label="Number(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="优惠设置">
        <RewardRule
          ref="rewardRule"
          v-model="formData"
        />
      </el-form-item>
      <el-form-item
        label="活动范围"
        prop="productScope"
      >
        <el-radio-group v-model="formData.productScope">
          <el-radio
            v-for="dict in productScopeOptions"
            :key="dict.value"
            :label="Number(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="formData.productScope === PromotionProductScopeEnum.SPU.scope"
        label="商品"
        prop="productSpuIds"
      >
        <el-select
          v-model="formData.productSpuIds"
          multiple
          filterable
          clearable
          placeholder="请选择活动商品"
          style="width: 100%"
        >
          <el-option
            v-for="item in productSpus"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span class="spu-name">{{ item.name }}</span>
            <span class="spu-price">￥{{ formatSpuPrice(item) }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="formData.productScope === PromotionProductScopeEnum.CATEGORY.scope"
        label="分类"
        prop="productCategoryIds"
      >
        <ProductCategorySelect
          v-model="formData.productCategoryIds"
          :multiple="true"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
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
  </el-dialog>
</template>

<script>
import * as RewardActivityApi from '@/api/mall/promotion/reward/rewardActivity'
import { getSpuSimpleList } from '@/api/mall/product/spu'
import { deepClone } from '@/utils'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { PromotionConditionTypeEnum, PromotionProductScopeEnum } from '@/utils/constants'
import ProductCategorySelect from '@/views/mall/product/category/components/ProductCategorySelect.vue'
import RewardRule from './components/RewardRule.vue'

export default {
  name: 'PromotionRewardActivityForm',
  components: { ProductCategorySelect, RewardRule },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: this.getDefaultFormData(),
      productSpus: [],
      conditionTypeOptions: getDictDatas(DICT_TYPE.PROMOTION_CONDITION_TYPE),
      productScopeOptions: getDictDatas(DICT_TYPE.PROMOTION_PRODUCT_SCOPE),
      PromotionProductScopeEnum,
      rules: {
        name: [{ required: true, message: '活动名称不能为空', trigger: 'blur' }],
        startAndEndTime: [{ required: true, message: '活动时间不能为空', trigger: 'change' }],
        conditionType: [{ required: true, message: '条件类型不能为空', trigger: 'change' }],
        productScope: [{ required: true, message: '商品范围不能为空', trigger: 'change' }],
        productSpuIds: [{ required: true, message: '商品不能为空', trigger: 'change' }],
        productCategoryIds: [{ required: true, message: '商品分类不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        startTime: undefined,
        endTime: undefined,
        startAndEndTime: [],
        remark: undefined,
        conditionType: PromotionConditionTypeEnum.PRICE.type,
        productScope: PromotionProductScopeEnum.ALL.scope,
        productScopeValues: [],
        productCategoryIds: [],
        productSpuIds: [],
        rules: []
      }
    },
    /** 打开新增或修改弹窗。 */
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改满减送活动' : '新增满减送活动'
      this.resetForm()
      this.dialogVisible = true
      this.loadProductSpus()
      if (id === undefined || id === null) return Promise.resolve()

      this.formLoading = true
      return RewardActivityApi.getReward(id)
        .then((response) => {
          const data = response.data
          this.formData = this.normalizeFormData(data)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 将后端的分单位规则和商品范围转换为表单数据。 */
    normalizeFormData(data) {
      const productScopeValues = Array.isArray(data.productScopeValues)
        ? data.productScopeValues.slice()
        : []
      const conditionType = Number(data.conditionType)
      const rules = Array.isArray(data.rules)
        ? data.rules.map((rule) => Object.assign({}, rule, {
          limit: conditionType === PromotionConditionTypeEnum.PRICE.type
            ? this.fenToYuan(rule.limit)
            : Number(rule.limit || 0),
          discountPrice: this.fenToYuan(rule.discountPrice),
          point: Number(rule.point || 0),
          freeDelivery: Boolean(rule.freeDelivery),
          giveCouponTemplateCounts: Object.assign({}, rule.giveCouponTemplateCounts || {})
        }))
        : []
      return Object.assign(this.getDefaultFormData(), data, {
        startAndEndTime: data.startTime && data.endTime ? [data.startTime, data.endTime] : [],
        productScopeValues,
        productSpuIds: data.productScope === PromotionProductScopeEnum.SPU.scope
          ? productScopeValues.slice()
          : [],
        productCategoryIds: data.productScope === PromotionProductScopeEnum.CATEGORY.scope
          ? productScopeValues.slice()
          : [],
        rules
      })
    },
    loadProductSpus() {
      return getSpuSimpleList()
        .then((response) => {
          const data = response.data
          this.productSpus = data
        })
    },
    /** 提交表单。 */
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          if (!valid || !this.validateProductScope()) {
            resolve(false)
            return
          }
          if (!this.$refs.rewardRule || !this.$refs.rewardRule.validateRules()) {
            resolve(false)
            return
          }
          this.$refs.rewardRule.setRuleCoupon()
          const data = this.buildSubmitData()
          this.formLoading = true
          const request = this.formType === 'create'
            ? RewardActivityApi.createRewardActivity(data)
            : RewardActivityApi.updateRewardActivity(data)
          request
            .then(() => {
              this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
              this.dialogVisible = false
              this.$emit('success')
              return true
            })
            .catch(() => false)
            .finally(() => {
              this.formLoading = false
            })
            .then(resolve)
        })
      })
    },
    /** 构建与后端 RewardActivitySaveReqVO 对齐的提交结构。 */
    buildSubmitData() {
      const data = deepClone(this.formData)
      const period = Array.isArray(data.startAndEndTime) ? data.startAndEndTime : []
      data.startTime = period[0]
      data.endTime = period[1]
      data.productScopeValues = this.getProductScopeValues(data)
      data.rules = (Array.isArray(data.rules) ? data.rules : []).map((rule) => ({
        limit: data.conditionType === PromotionConditionTypeEnum.PRICE.type
          ? this.yuanToFen(rule.limit)
          : Math.round(Number(rule.limit || 0)),
        discountPrice: this.yuanToFen(rule.discountPrice),
        freeDelivery: Boolean(rule.freeDelivery),
        point: Math.round(Number(rule.point || 0)),
        giveCouponTemplateCounts: this.normalizeCouponCounts(rule.giveCouponTemplateCounts)
      }))
      delete data.startAndEndTime
      delete data.productCategoryIds
      delete data.productSpuIds
      return data
    },
    getProductScopeValues(data) {
      if (data.productScope === PromotionProductScopeEnum.SPU.scope) {
        return Array.isArray(data.productSpuIds) ? data.productSpuIds.slice() : []
      }
      if (data.productScope === PromotionProductScopeEnum.CATEGORY.scope) {
        return Array.isArray(data.productCategoryIds) ? data.productCategoryIds.slice() : []
      }
      return []
    },
    validateProductScope() {
      if (
        this.formData.productScope === PromotionProductScopeEnum.SPU.scope &&
        (!Array.isArray(this.formData.productSpuIds) || this.formData.productSpuIds.length === 0)
      ) {
        this.$modal.msgWarning('请选择活动商品')
        return false
      }
      if (
        this.formData.productScope === PromotionProductScopeEnum.CATEGORY.scope &&
        (!Array.isArray(this.formData.productCategoryIds) || this.formData.productCategoryIds.length === 0)
      ) {
        this.$modal.msgWarning('请选择商品分类')
        return false
      }
      return true
    },
    normalizeCouponCounts(counts) {
      return Object.keys(counts || {}).reduce((result, id) => {
        result[id] = Math.round(Number(counts[id] || 0))
        return result
      }, {})
    },
    fenToYuan(value) {
      const amount = Number(value || 0)
      return Number((amount / 100).toFixed(2))
    },
    yuanToFen(value) {
      return Math.round(Number(value || 0) * 100)
    },
    formatSpuPrice(spu) {
      const price = spu && spu.price !== undefined ? spu.price : spu && spu.minPrice
      return (Number(price || 0) / 100).toFixed(2)
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.formLoading = false
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.spu-name {
  float: left;
}

.spu-price {
  float: right;
  color: #8492a6;
  font-size: 13px;
}
</style>
