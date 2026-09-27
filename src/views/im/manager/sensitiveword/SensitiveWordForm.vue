<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item
        label="敏感词"
        prop="word"
      ><el-input
        v-model="formData.word"
        placeholder="请输入敏感词"
        maxlength="64"
        show-word-limit
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.value"
      >{{ dict.label }}</el-radio></el-radio-group></el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { createManagerSensitiveWord, getManagerSensitiveWord, updateManagerSensitiveWord } from '@/api/im/manager/sensitiveword'

function defaultFormData() {
  return { id: undefined, word: '', status: CommonStatusEnum.ENABLE }
}

export default {
  name: 'ImSensitiveWordForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: defaultFormData(),
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formRules: {
        word: [{ required: true, whitespace: true, message: '敏感词不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    resetForm() {
      this.formData = defaultFormData()
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增敏感词' : '修改敏感词'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getManagerSensitiveWord(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createManagerSensitiveWord(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateManagerSensitiveWord(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
