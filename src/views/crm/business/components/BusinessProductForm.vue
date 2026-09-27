<template>
  <div class="crm-business-products">
    <el-form
      ref="form"
      :model="formData"
      :disabled="disabled"
      :inline-message="true"
      label-width="0"
    >
      <el-table
        :data="formData"
        border
        size="small"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="60"
        />
        <el-table-column
          label="产品名称"
          min-width="180"
        >
          <template slot-scope="scope">
            <el-form-item
              :prop="scope.$index + '.productId'"
              :rules="rules.productId"
            >
              <el-select
                v-model="scope.row.productId"
                clearable
                filterable
                placeholder="请选择产品"
                @change="onChangeProduct($event, scope.row)"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
          label="条码"
          min-width="130"
        ><template slot-scope="scope"><el-input
          v-model="scope.row.productNo"
          disabled
        /></template></el-table-column>
        <el-table-column
          label="单位"
          min-width="80"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.CRM_PRODUCT_UNIT"
          :value="scope.row.productUnit"
        /></template></el-table-column>
        <el-table-column
          label="价格（元）"
          min-width="120"
        ><template slot-scope="scope"><el-input
          :value="formatPrice(scope.row.productPrice)"
          disabled
        /></template></el-table-column>
        <el-table-column
          label="售价（元）"
          min-width="130"
        ><template slot-scope="scope"><el-form-item
          :prop="scope.$index + '.businessPrice'"
          :rules="rules.businessPrice"
        ><el-input-number
          v-model="scope.row.businessPrice"
          :min="0.001"
          :precision="2"
          controls-position="right"
        /></el-form-item></template></el-table-column>
        <el-table-column
          label="数量"
          min-width="120"
        ><template slot-scope="scope"><el-form-item
          :prop="scope.$index + '.count'"
          :rules="rules.count"
        ><el-input-number
          v-model="scope.row.count"
          :min="0.001"
          :precision="3"
          controls-position="right"
        /></el-form-item></template></el-table-column>
        <el-table-column
          label="合计"
          min-width="120"
        ><template slot-scope="scope"><el-input
          :value="formatPrice(scope.row.totalPrice)"
          disabled
        /></template></el-table-column>
        <el-table-column
          v-if="!disabled"
          label="操作"
          width="70"
          align="center"
        ><template slot-scope="scope"><el-button
          type="text"
          @click="handleDelete(scope.$index)"
        >删除</el-button></template></el-table-column>
      </el-table>
    </el-form>
    <div
      v-if="!disabled"
      class="product-add"
    ><el-button
      size="small"
      @click="handleAdd"
    >+ 添加产品</el-button></div>
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/crm/product'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'CrmBusinessProductForm',
  props: {
    products: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      DICT_TYPE,
      formData: this.products,
      productList: [],
      rules: {
        productId: [{ required: true, message: '产品不能为空', trigger: 'change' }],
        businessPrice: [{ required: true, message: '售价不能为空', trigger: 'change' }],
        count: [{ required: true, message: '产品数量不能为空', trigger: 'change' }]
      }
    }
  },
  watch: {
    products: { immediate: true, handler(value) { this.formData = value || [] } },
    formData: { deep: true, handler(value) { (value || []).forEach(item => { item.totalPrice = item.businessPrice == null || item.count == null ? undefined : Number((Number(item.businessPrice) * Number(item.count)).toFixed(2)) }) } }
  },
  created() {
    getProductSimpleList().then(response => {
      const data = response.data
      this.productList = data
    })
  },
  methods: {
    formatPrice(value) { return value === undefined || value === null || value === '' ? '' : Number(value).toFixed(2) },
    handleAdd() { this.formData.push({ productId: undefined, productUnit: undefined, productNo: undefined, productPrice: undefined, businessPrice: undefined, count: 1, totalPrice: undefined }) },
    handleDelete(index) { this.formData.splice(index, 1) },
    onChangeProduct(productId, row) {
      const product = this.productList.find(item => String(item.id) === String(productId))
      if (!product) return
      row.productUnit = product.unit
      row.productNo = product.no
      row.productPrice = product.price
      row.businessPrice = product.price
    },
    validate(callback) {
      if (!this.$refs.form) return Promise.resolve(true)
      return new Promise(resolve => this.$refs.form.validate(valid => { if (callback) callback(valid); resolve(valid) }))
    }
  }
}
</script>

<style scoped>
.crm-business-products .el-form-item { margin-bottom: 0; }
.product-add { padding: 12px 0; text-align: center; }
</style>
