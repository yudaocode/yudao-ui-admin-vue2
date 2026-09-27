<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入名称"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="loading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createProperty,
  getProperty,
  updateProperty
} from '@/api/mall/product/property'

export default {
  name: 'ProductPropertyForm',
  data() {
    return {
      dialogVisible: false,
      title: '',
      loading: false,
      formType: '',
      form: this.createDefaultFormData(),
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    createDefaultFormData() {
      return {
        id: undefined,
        name: '',
        remark: ''
      }
    },
    /** 打开弹窗 */
    open(type, id) {
      this.reset()
      this.formType = type
      this.title = type === 'create' ? '新增商品属性' : '编辑商品属性'
      this.dialogVisible = true
      if (!id) {
        return
      }
      this.loading = true
      getProperty(id).then(response => {
        this.form = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        const request = this.formType === 'create'
          ? createProperty(this.form)
          : updateProperty(this.form)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.loading = false
        })
      })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>
