<template>
  <el-dialog
    title="批量修改招聘渠道"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item label="候选人数"><el-input
        :value="`${candidateIds.length} 人`"
        disabled
      /></el-form-item>
      <el-form-item
        label="招聘渠道"
        prop="channelId"
      >
        <recruit-channel-select
          v-model="formData.channelId"
          :clearable="false"
          class="full-width"
          placeholder="请选择招聘渠道"
        />
      </el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { updateRecruitCandidateChannel } from '@/api/hrm/recruit/candidate'
import RecruitChannelSelect from '@/views/hrm/recruit/channel/components/RecruitChannelSelect.vue'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
export default {
  name: 'HrmRecruitCandidateChannelListForm', components: { RecruitChannelSelect },
  data() { return { dialogVisible: false, formLoading: false, candidateIds: [], formData: { channelId: undefined }, formRules: { channelId: [{ required: true, message: '招聘渠道不能为空', trigger: 'change' }] }} },
  methods: {
    open(ids) { this.candidateIds = [...ids]; this.resetForm(); this.dialogVisible = true },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const success = await executeHrmBatch(this, this.candidateIds.map(id => updateRecruitCandidateChannel({ id, channelId: this.formData.channelId }))); if (!success) return; this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm() { this.formData.channelId = undefined; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
