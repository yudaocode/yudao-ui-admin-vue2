<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="720px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="名称"
            prop="name"
          >
            <el-input
              v-model="form.name"
              placeholder="请输入名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="条码"
            prop="barCode"
          >
            <el-input
              v-model="form.barCode"
              placeholder="请输入条码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="分类"
            prop="categoryId"
          >
            <Treeselect
              v-model="form.categoryId"
              :options="categoryList"
              :normalizer="normalizer"
              :show-count="true"
              :default-expand-level="1"
              placeholder="请选择分类"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="单位"
            prop="unitId"
          >
            <el-select
              v-model="form.unitId"
              clearable
              placeholder="请选择单位"
              style="width: 100%"
            >
              <el-option
                v-for="unit in unitList"
                :key="unit.id"
                :label="unit.name"
                :value="unit.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusDictDatas"
                :key="dict.value"
                :label="parseInt(dict.value)"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="规格"
            prop="standard"
          >
            <el-input
              v-model="form.standard"
              placeholder="请输入规格"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="保质期天数"
            prop="expiryDay"
          >
            <el-input-number
              v-model="form.expiryDay"
              :min="0"
              :precision="0"
              controls-position="right"
              style="width: 100%"
              placeholder="请输入保质期天数"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="重量（kg）"
            prop="weight"
          >
            <el-input-number
              v-model="form.weight"
              :min="0"
              controls-position="right"
              style="width: 100%"
              placeholder="请输入重量"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="采购价格"
            prop="purchasePrice"
          >
            <el-input-number
              v-model="form.purchasePrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
              placeholder="请输入采购价格（元）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="销售价格"
            prop="salePrice"
          >
            <el-input-number
              v-model="form.salePrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
              placeholder="请输入销售价格（元）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="最低价格"
            prop="minPrice"
          >
            <el-input-number
              v-model="form.minPrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
              placeholder="请输入最低价格（元）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {
  createProduct,
  getProduct,
  updateProduct
} from '@/api/erp/product/product'
import { getProductCategorySimpleList } from '@/api/erp/product/category'
import { getProductUnitSimpleList } from '@/api/erp/product/unit'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'ProductForm',
  components: { Treeselect },
  data() {
    return {
      dialogVisible: false,
      title: '',
      formLoading: false,
      formType: '',
      categoryList: [],
      unitList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      form: this.defaultForm(),
      rules: {
        name: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
        barCode: [{ required: true, message: '产品条码不能为空', trigger: 'blur' }],
        categoryId: [{ required: true, message: '产品分类不能为空', trigger: 'change' }],
        unitId: [{ required: true, message: '单位不能为空', trigger: 'change' }],
        status: [{ required: true, message: '产品状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: undefined,
        barCode: undefined,
        categoryId: undefined,
        unitId: undefined,
        status: CommonStatusEnum.ENABLE,
        standard: undefined,
        remark: undefined,
        expiryDay: undefined,
        weight: undefined,
        purchasePrice: undefined,
        salePrice: undefined,
        minPrice: undefined
      }
    },
    open(type, id) {
      this.formType = type
      this.title = type === 'update' ? '修改产品' : '添加产品'
      this.form = this.defaultForm()
      this.categoryList = []
      this.unitList = []
      this.dialogVisible = true
      this.formLoading = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())

      const detailRequest = id !== undefined && id !== null
        ? getProduct(id)
        : Promise.resolve(null)
      return Promise.all([detailRequest, getProductCategorySimpleList(), getProductUnitSimpleList()])
        .then(([detailResponse, categoryResponse, unitResponse]) => {
          if (detailResponse) {
            this.form = { ...this.defaultForm(), ...detailResponse.data }
          }
          this.categoryList = handleTree(categoryResponse.data, 'id', 'parentId')
          this.unitList = unitResponse.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.defaultForm()
      this.categoryList = []
      this.unitList = []
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? createProduct(this.form)
          : updateProduct(this.form)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
