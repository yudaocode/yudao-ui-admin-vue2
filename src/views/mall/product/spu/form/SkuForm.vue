<template>
  <el-form
    ref="form"
    v-loading="formLoading"
    :disabled="isDetail"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item
      label="分销类型"
      prop="subCommissionType"
    >
      <el-radio-group
        v-model="formData.subCommissionType"
        @change="changeSubCommissionType"
      >
        <el-radio :label="false">默认设置</el-radio>
        <el-radio :label="true">单独设置</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      label="商品规格"
      prop="specType"
    >
      <el-radio-group
        v-model="formData.specType"
        @change="onChangeSpec"
      >
        <el-radio :label="false">单规格</el-radio>
        <el-radio :label="true">多规格</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="!formData.specType">
      <SkuList
        ref="skuList"
        :prop-form-data="formData"
        :property-list="propertyList"
        :rule-config="ruleConfig"
      />
    </el-form-item>
    <el-form-item
      v-if="formData.specType"
      label="商品属性"
    >
      <el-button @click="openPropertyForm">添加属性</el-button>
      <ProductAttributes
        :is-detail="isDetail"
        :property-list="propertyList"
        @success="generateSkus"
      />
    </el-form-item>
    <template v-if="formData.specType && propertyList.length > 0">
      <el-form-item
        v-if="!isDetail"
        label="批量设置"
      >
        <SkuList
          :is-batch="true"
          :prop-form-data="formData"
          :property-list="propertyList"
        />
      </el-form-item>
      <el-form-item label="规格列表">
        <SkuList
          ref="skuList"
          :is-detail="isDetail"
          :prop-form-data="formData"
          :property-list="propertyList"
          :rule-config="ruleConfig"
        />
      </el-form-item>
    </template>

    <ProductPropertyAddForm
      ref="propertyForm"
      :property-list="propertyList"
    />
  </el-form>
</template>

<script>
import { getPropertyList, SkuList } from '@/views/mall/product/spu/components'
import ProductAttributes from './ProductAttributes.vue'
import ProductPropertyAddForm from './ProductPropertyAddForm.vue'

const emptySku = () => ({
  name: '',
  properties: [],
  price: 0,
  marketPrice: 0,
  costPrice: 0,
  barCode: '',
  picUrl: '',
  stock: 0,
  weight: 0,
  volume: 0,
  firstBrokeragePrice: 0,
  secondBrokeragePrice: 0
})

export default {
  name: 'ProductSpuSkuForm',
  components: { SkuList, ProductAttributes, ProductPropertyAddForm },
  props: {
    propFormData: {
      type: Object,
      default: () => ({})
    },
    isDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formLoading: false,
      formData: this.defaultForm(),
      propertyList: [],
      ruleConfig: [
        { name: 'stock', rule: value => value >= 0, message: '商品库存必须大于等于 1 ！！！' },
        { name: 'price', rule: value => value >= 0.01, message: '商品销售价格必须大于等于 0.01 元！！！' },
        { name: 'marketPrice', rule: value => value >= 0.01, message: '商品市场价格必须大于等于 0.01 元！！！' },
        { name: 'costPrice', rule: value => value >= 0.01, message: '商品成本价格必须大于等于 0.00 元！！！' }
      ],
      rules: {
        specType: [{ required: true, message: '商品规格类型不能为空', trigger: 'change' }],
        subCommissionType: [{ required: true, message: '分销类型不能为空', trigger: 'change' }]
      }
    }
  },
  watch: {
    propFormData: {
      deep: true,
      immediate: true,
      handler(value) {
        if (!value) return
        this.formData = Object.assign(this.defaultForm(), value)
        if (!Array.isArray(this.formData.skus) || !this.formData.skus.length) this.formData.skus = [emptySku()]
        this.propertyList = getPropertyList(value)
      }
    }
  },
  methods: {
    defaultForm() {
      return { specType: false, subCommissionType: false, skus: [emptySku()] }
    },
    openPropertyForm() {
      this.$refs.propertyForm.open()
    },
    generateSkus(propertyList) {
      this.$refs.skuList.generateTableData(propertyList)
    },
    onChangeSpec() {
      this.propertyList = []
      this.formData.skus = [emptySku()]
    },
    changeSubCommissionType() {
      (this.formData.skus || []).forEach(sku => {
        this.$set(sku, 'firstBrokeragePrice', 0)
        this.$set(sku, 'secondBrokeragePrice', 0)
      })
    },
    async validate() {
      try {
        this.$refs.skuList.validateSku()
        const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
        if (!valid) throw new Error('库存价格设置不完整')
        Object.assign(this.propFormData, this.formData)
      } catch (error) {
        this.$message.error('【库存价格】不完善，请填写相关信息')
        this.$emit('update:activeName', 'sku')
        throw error
      }
    }
  }
}
</script>

<style scoped>
.attributes-panel { margin-top: 12px; width: 100%; }
</style>
