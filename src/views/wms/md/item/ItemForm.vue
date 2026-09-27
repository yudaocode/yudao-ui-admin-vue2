<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="1200px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="88px"
    >
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="商品名称"
          prop="name"
        ><el-input
          v-model="formData.name"
          maxlength="60"
          placeholder="请输入商品名称"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="商品分类"
          prop="categoryId"
        ><item-category-select
          v-model="formData.categoryId"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="商品编号"
          prop="code"
        ><el-input
          v-model="formData.code"
          maxlength="20"
          placeholder="请输入商品编号"
        ><el-button
          slot="append"
          @click="formData.code = generateWmsCode('I')"
        >生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="商品单位"
          prop="unit"
        ><el-input
          v-model="formData.unit"
          maxlength="20"
          placeholder="请输入单位"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="商品品牌"
          prop="brandId"
        ><item-brand-select v-model="formData.brandId" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          maxlength="255"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>

      <div class="sku-head">
        <strong>规格</strong><el-button
          type="primary"
          plain
          size="mini"
          icon="el-icon-plus"
          @click="handleAddSku"
        >新增规格</el-button>
      </div>
      <el-table
        :data="formData.skus"
        border
        size="small"
      >
        <el-table-column
          label="规格名称"
          min-width="150"
        ><template #default="scope"><el-form-item
          :prop="'skus.' + scope.$index + '.name'"
          :rules="skuNameRules"
          label-width="0"
          class="sku-form-item"
        ><el-input
          v-model="scope.row.name"
          maxlength="255"
          placeholder="请输入规格名称"
        /></el-form-item></template></el-table-column>
        <el-table-column
          label="编号/条码"
          width="260"
        ><template #default="scope"><el-input
          v-model="scope.row.code"
          maxlength="64"
          placeholder="编号"
        ><el-button
          slot="append"
          @click="scope.row.code = generateWmsCode('S')"
        >生成</el-button></el-input><el-input
          v-model="scope.row.barCode"
          maxlength="64"
          class="sku-sub-input"
          placeholder="条码"
        ><el-button
          slot="append"
          @click="scope.row.barCode = generateWmsCode()"
        >生成</el-button></el-input></template></el-table-column>
        <el-table-column
          label="长/宽/高(cm)"
          width="220"
        ><template #default="scope"><div class="dimension-row">
          <el-input-number
            v-model="scope.row.length"
            :controls="false"
            :min="0"
            :precision="DIMENSION_PRECISION"
            placeholder="长"
          /><el-input-number
            v-model="scope.row.width"
            :controls="false"
            :min="0"
            :precision="DIMENSION_PRECISION"
            placeholder="宽"
          /><el-input-number
            v-model="scope.row.height"
            :controls="false"
            :min="0"
            :precision="DIMENSION_PRECISION"
            placeholder="高"
          /></div></template></el-table-column>
        <el-table-column
          label="净重/毛重(kg)"
          width="180"
        ><template #default="scope"><el-input-number
          v-model="scope.row.netWeight"
          :controls="false"
          :min="0"
          :precision="WEIGHT_PRECISION"
          class="number-full"
          placeholder="净重"
        /><el-input-number
          v-model="scope.row.grossWeight"
          :controls="false"
          :min="0"
          :precision="WEIGHT_PRECISION"
          class="number-full sku-sub-input"
          placeholder="毛重"
        /></template></el-table-column>
        <el-table-column
          label="成本价/销售价"
          width="180"
        ><template #default="scope"><el-input-number
          v-model="scope.row.costPrice"
          :controls="false"
          :min="0"
          :precision="PRICE_PRECISION"
          class="number-full"
          placeholder="成本价"
        /><el-input-number
          v-model="scope.row.sellingPrice"
          :controls="false"
          :min="0"
          :precision="PRICE_PRECISION"
          class="number-full sku-sub-input"
          placeholder="销售价"
        /></template></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="80"
        ><template #default="scope"><el-button
          type="text"
          size="mini"
          class="danger-text"
          @click="handleDeleteSku(scope.$index)"
        >删除</el-button></template></el-table-column>
      </el-table>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :loading="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { ItemApi } from '@/api/wms/md/item'
import { generateWmsCode } from '@/views/wms/utils/constants'
import {
  DIMENSION_PRECISION,
  PRICE_PRECISION,
  WEIGHT_PRECISION
} from '@/views/wms/utils/format'
import ItemBrandSelect from './brand/components/ItemBrandSelect.vue'
import ItemCategorySelect from './category/components/ItemCategorySelect.vue'

export default {
  name: 'WmsItemForm',
  components: { ItemBrandSelect, ItemCategorySelect },
  data() {
    return {
      DIMENSION_PRECISION,
      PRICE_PRECISION,
      WEIGHT_PRECISION,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: this.getDefaultForm(),
      skuNameRules: [
        { required: true, message: '规格名称不能为空', trigger: 'blur' }
      ],
      rules: {
        code: [
          { required: true, message: '商品编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '商品分类不能为空', trigger: 'change' }
        ],
        skus: [
          {
            required: true,
            message: '至少包含一个商品规格',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    generateWmsCode,
    getDefaultSku() {
      return {
        id: undefined,
        name: undefined,
        barCode: undefined,
        code: undefined,
        length: undefined,
        width: undefined,
        height: undefined,
        grossWeight: undefined,
        netWeight: undefined,
        costPrice: undefined,
        sellingPrice: undefined
      }
    },
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        categoryId: undefined,
        unit: undefined,
        brandId: undefined,
        remark: undefined,
        skus: [this.getDefaultSku()]
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改商品' : '新增商品'
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id === undefined || id === null) return
      this.loading = true
      ItemApi.getItem(id)
        .then((response) => {
          const data = response.data
          data.skus =
            Array.isArray(data.skus) && data.skus.length
              ? data.skus
              : [this.getDefaultSku()]
          this.formData = data
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleAddSku() {
      this.formData.skus.push(this.getDefaultSku())
    },
    handleDeleteSku(index) {
      if (this.formData.skus.length <= 1) {
        this.$modal.msgError('至少包含一个商品规格')
        return
      }
      this.formData.skus.splice(index, 1)
    },
    submitForm() {
      if (!this.formData.skus.length) {
        this.$modal.msgError('至少包含一个商品规格')
        return
      }
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action =
          this.formType === 'create' ? ItemApi.createItem : ItemApi.updateItem
        action(this.formData)
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === 'create' ? '新增成功' : '修改成功'
            )
            this.visible = false
            this.$emit('success')
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>

<style scoped>
.sku-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 12px;
}
.sku-form-item {
  margin-bottom: 0;
}
.sku-sub-input {
  margin-top: 5px;
}
.dimension-row {
  display: flex;
  gap: 4px;
}
.dimension-row .el-input-number {
  width: 33.333%;
}
.number-full {
  width: 100%;
}
.danger-text {
  color: #f56c6c;
}
</style>
