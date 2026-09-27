<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="620px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="92px"
    >
      <el-form-item
        label="渠道名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          :disabled="formData.systemFlag"
          maxlength="255"
          placeholder="请输入渠道名称"
        />
      </el-form-item>
      <el-form-item
        label="显示顺序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          :controls="false"
          :min="0"
          class="full-width"
          placeholder="请输入显示顺序"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          :rows="3"
          maxlength="500"
          placeholder="请输入备注"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createRecruitChannel, getRecruitChannel, updateRecruitChannel } from '@/api/hrm/recruit/channel'

export default {
  name: 'HrmRecruitChannelForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '渠道名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    createDefaultFormData() {
      return { id: undefined, name: '', sort: 0, remark: '' }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      this.resetForm()
      if (!id) return
      this.formLoading = true
      try {
        const response = await getRecruitChannel(id)
        this.formData = response.data
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        const data = { ...this.formData }
        delete data.systemFlag
        delete data.status
        delete data.createTime
        if (this.formType === 'create') {
          await createRecruitChannel(data)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateRecruitChannel(data)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.createDefaultFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
