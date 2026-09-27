<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="90px"
    >
      <el-form-item
        label="上级分类"
        prop="parentId"
      >
        <Treeselect
          v-model="form.parentId"
          :options="parentCategoryOptions"
          :normalizer="normalizer"
          :show-count="true"
          :default-expand-level="1"
          placeholder="请选择上级分类"
        />
      </el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称"
        />
      </el-form-item>
      <el-form-item
        label="分类编码"
        prop="code"
      >
        <el-input
          v-model="form.code"
          placeholder="请输入分类编码"
        />
      </el-form-item>
      <el-form-item
        label="分类排序"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          controls-position="right"
          :min="0"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="开启状态"
        prop="status"
      >
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
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
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {
  createProductCategory,
  getProductCategory,
  getProductCategoryList,
  updateProductCategory
} from '@/api/erp/product/category'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'ProductCategoryForm',
  components: { Treeselect },
  data() {
    return {
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      dialogVisible: false,
      title: '',
      formLoading: false,
      formType: '',
      parentCategoryOptions: [],
      form: this.defaultForm(),
      rules: {
        parentId: [{ required: true, message: '请选择上级分类', trigger: 'change' }],
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '分类编码不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '分类排序不能为空', trigger: 'change' }],
        status: [{ required: true, message: '开启状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        parentId: 0,
        name: undefined,
        code: undefined,
        sort: 0,
        status: CommonStatusEnum.ENABLE
      }
    },
    open(type, id) {
      this.formType = type
      this.title = type === 'update' ? '修改产品分类' : '添加产品分类'
      this.form = this.defaultForm()
      this.parentCategoryOptions = []
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        getProductCategory(id).then((response) => {
          this.form = { ...this.defaultForm(), ...response.data }
        }).finally(() => {
          this.formLoading = false
        })
      }
      this.getParentCategoryOptions()
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.defaultForm()
      this.parentCategoryOptions = []
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    getParentCategoryOptions() {
      return getProductCategoryList().then((response) => {
        const root = { id: 0, name: '顶级产品分类', children: [] }
        root.children = handleTree(response.data, 'id', 'parentId')
        this.parentCategoryOptions = [root]
      })
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
          ? createProductCategory(this.form)
          : updateProductCategory(this.form)
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
