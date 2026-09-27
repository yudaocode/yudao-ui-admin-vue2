<template>
  <el-dialog
    :title="batchMode ? '批量淘汰候选人' : '淘汰候选人'"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item label="候选人"><el-input
        :value="batchMode ? `已选择 ${candidateIds.length} 人` : candidateName"
        disabled
      /></el-form-item>
      <el-form-item
        label="淘汰原因"
        prop="eliminate"
      ><recruit-eliminate-reason-select
        v-model="formData.eliminate"
        class="full-width"
      /></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        :rows="3"
        maxlength="255"
        placeholder="请输入备注"
        show-word-limit
        type="textarea"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="danger"
      @click="submitForm"
    >确认淘汰</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { eliminateRecruitCandidate } from '@/api/hrm/recruit/candidate'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
import RecruitEliminateReasonSelect from '@/views/hrm/recruit/setting/eliminate/components/RecruitEliminateReasonSelect.vue'
export default {
  name: 'HrmRecruitCandidateEliminateForm', components: { RecruitEliminateReasonSelect },
  data() { return { dialogVisible: false, formLoading: false, batchMode: false, candidateIds: [], candidateName: '', formData: { eliminate: '', remark: '' }, formRules: { eliminate: [{ required: true, message: '淘汰原因不能为空', trigger: 'change' }, { max: 255, message: '淘汰原因不能超过 255 个字符', trigger: 'change' }], remark: [{ max: 255, message: '备注不能超过 255 个字符', trigger: 'blur' }] }} },
  methods: {
    open(ids, name) { this.batchMode = Array.isArray(ids); this.candidateIds = this.batchMode ? [...ids] : [ids]; this.candidateName = name || ''; this.resetForm(); this.dialogVisible = true },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { if (!this.batchMode) { await eliminateRecruitCandidate({ id: this.candidateIds[0], eliminate: this.formData.eliminate, remark: this.formData.remark }); this.$modal.msgSuccess(this.$t('common.updateSuccess')) } else { const success = await executeHrmBatch(this, this.candidateIds.map(id => eliminateRecruitCandidate({ id, eliminate: this.formData.eliminate, remark: this.formData.remark }))); if (!success) return } this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm() { this.formData = { eliminate: '', remark: '' }; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
