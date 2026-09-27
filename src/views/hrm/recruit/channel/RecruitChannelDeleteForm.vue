<template>
  <el-dialog
    title="删除招聘渠道"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
  >
    <el-alert
      :closable="false"
      class="mb20"
      show-icon
      title="删除后，相关员工和候选人的招聘渠道将同步变更"
      type="warning"
    />
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="92px"
    >
      <el-form-item label="删除渠道">
        <el-input
          :value="channelName"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="承接渠道"
        prop="transferChannelId"
      >
        <recruit-channel-select
          v-model="formData.transferChannelId"
          :exclude-ids="formData.id ? [formData.id] : []"
          placeholder="请选择承接渠道"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="danger"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deleteRecruitChannel } from '@/api/hrm/recruit/channel'
import RecruitChannelSelect from './components/RecruitChannelSelect.vue'

export default {
  name: 'HrmRecruitChannelDeleteForm',
  components: { RecruitChannelSelect },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      channelName: '',
      formData: { id: undefined, transferChannelId: undefined },
      formRules: {
        transferChannelId: [{ required: true, message: '承接渠道不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    open(channel) {
      if (!channel.id) return
      this.dialogVisible = true
      this.resetForm()
      this.formData.id = channel.id
      this.channelName = channel.name
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid || !this.formData.id || !this.formData.transferChannelId) return
      this.formLoading = true
      try {
        await deleteRecruitChannel({
          id: this.formData.id,
          transferChannelId: this.formData.transferChannelId
        })
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { id: undefined, transferChannelId: undefined }
      this.channelName = ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    }
  }
}
</script>

<style scoped>
.mb20 { margin-bottom: 20px; }
</style>
