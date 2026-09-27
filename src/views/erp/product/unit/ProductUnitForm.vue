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
        label="单位名字"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入单位名字"
        />
      </el-form-item>
      <el-form-item
        label="单位状态"
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
import {
  createProductUnit,
  getProductUnit,
  updateProductUnit
} from '@/api/erp/product/unit'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: 'ProductUnitForm',
  data() {
    return {
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      dialogVisible: false,
      title: '',
      formLoading: false,
      formType: '',
      form: this.defaultForm(),
      rules: {
        name: [{ required: true, message: '单位名字不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '单位状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: undefined,
        status: CommonStatusEnum.ENABLE
      }
    },
    open(type, id) {
      this.formType = type
      this.title = type === 'update' ? '修改产品单位' : '添加产品单位'
      this.form = this.defaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        getProductUnit(id).then((response) => {
          this.form = { ...this.defaultForm(), ...response.data }
        }).finally(() => {
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
        const request = this.formType === 'create'
          ? createProductUnit(this.form)
          : updateProductUnit(this.form)
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
