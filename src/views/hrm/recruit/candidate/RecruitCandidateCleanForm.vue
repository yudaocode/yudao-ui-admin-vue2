<template>
  <el-dialog
    title="一键清理候选人"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="112px"
    >
      <el-form-item
        label="候选人状态"
        prop="statuses"
      ><el-select
        v-model="formData.statuses"
        class="full-width"
        multiple
        placeholder="请选择候选人状态"
      ><el-option
        v-for="dict in cleanStatusOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="状态持续天数"
        prop="days"
      ><el-select
        v-model="formData.days"
        class="full-width"
        placeholder="请选择持续天数"
      ><el-option
        v-for="days in dayOptions"
        :key="days"
        :label="`${days} 天`"
        :value="days"
      /></el-select></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="danger"
      @click="submitForm"
    >确认清理</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { eliminateRecruitCandidate, getCleanRecruitCandidateIdList } from '@/api/hrm/recruit/candidate'
import { HrmRecruitCandidateStatus } from '@/views/hrm/utils/constants'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
const cleanStatuses = [HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW, HrmRecruitCandidateStatus.INTERVIEW_PASS]
export default {
  name: 'HrmRecruitCandidateCleanForm',
  data() { return { dialogVisible: false, formLoading: false, cleanStatuses, dayOptions: [3, 5, 7, 15, 30, 45], formData: { statuses: [...cleanStatuses], days: 30 }, formRules: { statuses: [{ required: true, message: '候选人状态不能为空', trigger: 'change' }], days: [{ required: true, message: '状态持续天数不能为空', trigger: 'change' }] }} },
  computed: { cleanStatusOptions() { return getIntDictOptions(DICT_TYPE.HRM_RECRUIT_CANDIDATE_STATUS).filter(item => this.cleanStatuses.includes(item.value)) } },
  methods: {
    open() { this.dialogVisible = true; this.resetForm() },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const response = await getCleanRecruitCandidateIdList(this.formData.statuses, this.formData.days); const ids = response.data; if (!ids.length) { this.$modal.msgWarning('暂无可清理候选人'); return } await this.$modal.confirm(`确认将 ${ids.length} 位候选人移至已淘汰状态吗？`); const success = await executeHrmBatch(this, ids.map(id => eliminateRecruitCandidate({ id, eliminate: '长期未跟进', remark: `状态持续 ${this.formData.days} 天，由一键清理操作淘汰` }))); if (!success) return; this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm() { this.formData = { statuses: [...this.cleanStatuses], days: 30 }; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
