<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="名字" prop="name">
        <el-input v-model="form.name" placeholder="请输入名字" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="Number(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="表达式" prop="expression">
        <el-input
          v-model="form.expression"
          type="textarea"
          :rows="4"
          placeholder="请输入表达式"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createProcessExpression,
  getProcessExpression,
  updateProcessExpression
} from '@/api/bpm/processExpression'
import { CommonStatusEnum } from '@/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    name: undefined,
    status: CommonStatusEnum.ENABLE,
    expression: undefined
  }
}

/** 可复用的 BPM 流程表达式表单。 */
export default {
  name: 'ProcessExpressionForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      form: createDefaultForm(),
      rules: {
        name: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        expression: [{ required: true, message: '表达式不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async open(type, id) {
      if (this.formLoading) {
        return
      }
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'create' ? '添加流程表达式' : '修改流程表达式'
      this.resetForm()
      this.dialogVisible = true
      if (id === undefined || id === null) {
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        return
      }
      this.formLoading = true
      try {
        const response = await getProcessExpression(id)
        this.form = {
          ...createDefaultForm(),
          ...((response && response.data) || {})
        }
        if (this.form.status !== undefined && this.form.status !== null) {
          this.form.status = Number(this.form.status)
        }
      } catch (e) {
        // request 拦截器已提示后端错误，保留弹窗以便取消或重试。
      } finally {
        this.formLoading = false
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
    async submitForm() {
      if (this.formLoading) {
        return
      }
      const form = this.$refs.form
      if (!form) {
        return
      }
      const valid = await new Promise(resolve => form.validate(resolve))
      if (!valid) {
        return
      }
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createProcessExpression(this.form)
          this.showSuccess('新增成功')
        } else {
          await updateProcessExpression(this.form)
          this.showSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } catch (e) {
        // request 拦截器已统一展示错误信息。
      } finally {
        this.formLoading = false
      }
    },
    showSuccess(message) {
      if (this.$modal && this.$modal.msgSuccess) {
        this.$modal.msgSuccess(message)
      } else if (this.$message) {
        this.$message.success(message)
      }
    },
    resetForm() {
      this.form = createDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    handleClosed() {
      this.formLoading = false
      this.resetForm()
    }
  }
}
</script>
