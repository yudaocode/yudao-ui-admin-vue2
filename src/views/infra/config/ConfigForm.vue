<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="参数分类" prop="category">
        <el-input v-model="formData.category" placeholder="请输入参数分类" />
      </el-form-item>
      <el-form-item label="参数名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入参数名称" />
      </el-form-item>
      <el-form-item label="参数键名" prop="key">
        <el-input v-model="formData.key" placeholder="请输入参数键名" />
      </el-form-item>
      <el-form-item label="参数键值" prop="value">
        <el-input v-model="formData.value" placeholder="请输入参数键值" />
      </el-form-item>
      <el-form-item label="是否可见" prop="visible">
        <el-radio-group v-model="formData.visible">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createConfig, getConfig, updateConfig } from '@/api/infra/config'

export default {
  name: 'InfraConfigForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: '',
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        category: [{ required: true, message: '参数分类不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
        key: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }],
        visible: [{ required: true, message: '是否可见不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return { id: undefined, category: '', name: '', key: '', value: '', visible: true, remark: '' }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改参数' : '添加参数'
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        return getConfig(id).then(response => {
          this.formData = response.data
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
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const saveRequest = this.formType === 'create' ? createConfig(this.formData) : updateConfig(this.formData)
        saveRequest.then(() => {
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
.dialog-footer { text-align: right; }
</style>
