<template>
  <el-dialog
    title="批量流转候选人"
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
        label="目标状态"
        prop="status"
      ><el-select
        v-model="formData.status"
        class="full-width"
        placeholder="请选择目标状态"
      ><el-option
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { updateRecruitCandidateStatus } from '@/api/hrm/recruit/candidate'
import { HrmRecruitCandidateStatus } from '@/views/hrm/utils/constants'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
export default {
  name: 'HrmRecruitCandidateStatusListForm',
  data() { return { dialogVisible: false, formLoading: false, candidateIds: [], sourceStatus: undefined, formData: { status: undefined }, formRules: { status: [{ required: true, message: '目标状态不能为空', trigger: 'change' }] }, statusTransitionMap: { [HrmRecruitCandidateStatus.NEW]: [HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW_PASS], [HrmRecruitCandidateStatus.PRIMARY_PASS]: [HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.INTERVIEW_PASS], [HrmRecruitCandidateStatus.INTERVIEW_PASS]: [HrmRecruitCandidateStatus.OFFER_SENT, HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS], [HrmRecruitCandidateStatus.ELIMINATED]: [HrmRecruitCandidateStatus.NEW] }} },
  computed: { statusOptions() { const values = this.sourceStatus ? this.statusTransitionMap[this.sourceStatus] || [] : []; return getIntDictOptions(DICT_TYPE.HRM_RECRUIT_CANDIDATE_STATUS).filter(item => values.includes(item.value)) } },
  methods: {
    open(ids, status) { this.candidateIds = [...ids]; this.sourceStatus = status; this.resetForm(); this.dialogVisible = true },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const success = await executeHrmBatch(this, this.candidateIds.map(id => updateRecruitCandidateStatus({ id, status: this.formData.status }))); if (!success) return; this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm() { this.formData.status = undefined; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
