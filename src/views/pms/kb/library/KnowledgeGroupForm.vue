<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="分组名称" prop="name">
        <el-input v-model.trim="formData.name" maxlength="100" placeholder="请输入分组名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeGroupApi from '@/api/pms/kb/library/group'
import { PmsKnowledgeGroupType } from '@/views/pms/kb/utils/constants'

function getDefaultFormData() {
  return {
    id: undefined,
    name: '',
    sort: 0,
    type: PmsKnowledgeGroupType.CUSTOM
  }
}

export default {
  name: 'PmsKnowledgeGroupForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      this.resetForm()
      if (!id) return Promise.resolve()
      this.formLoading = true
      return KnowledgeGroupApi.getKnowledgeGroup(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? KnowledgeGroupApi.createKnowledgeGroup(this.formData)
          : KnowledgeGroupApi.updateKnowledgeGroup(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create'
            ? this.$t('common.createSuccess')
            : this.$t('common.updateSuccess'))
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
