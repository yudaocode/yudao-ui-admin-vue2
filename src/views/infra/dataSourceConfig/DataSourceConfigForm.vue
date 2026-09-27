<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="数据源名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据源名称" />
      </el-form-item>
      <el-form-item label="数据源连接" prop="url">
        <el-input v-model="formData.url" placeholder="请输入数据源连接" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createDataSourceConfig, getDataSourceConfig, updateDataSourceConfig } from '@/api/infra/dataSourceConfig'

export default {
  name: 'InfraDataSourceConfigForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '数据源名称不能为空', trigger: 'blur' }],
        url: [{ required: true, message: '数据源连接不能为空', trigger: 'blur' }],
        username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return { id: undefined, name: '', url: '', username: '', password: '' }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改数据源配置' : '添加数据源配置'
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        return getDataSourceConfig(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? createDataSourceConfig(this.formData)
          : updateDataSourceConfig(this.formData)
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
