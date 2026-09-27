<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="640px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item
        v-if="!cancelMode"
        label="面试结果"
        prop="result"
      ><el-select
        v-model="formData.result"
        class="full-width"
        placeholder="请选择面试结果"
      ><el-option
        v-for="dict in resultOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        v-if="formData.result === HrmRecruitInterviewResult.CANCELED"
        key="cancelReason"
        label="取消原因"
        prop="cancelReason"
      ><el-input
        v-model="formData.cancelReason"
        :rows="3"
        maxlength="255"
        placeholder="请输入取消原因"
        show-word-limit
        type="textarea"
      /></el-form-item>
      <el-form-item
        v-else
        key="evaluate"
        label="面试评价"
        prop="evaluate"
      ><el-input
        v-model="formData.evaluate"
        :rows="4"
        maxlength="255"
        placeholder="请输入面试评价"
        show-word-limit
        type="textarea"
      /></el-form-item>
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
import { updateRecruitInterviewResult } from '@/api/hrm/recruit/interview'
import { HrmRecruitInterviewResult } from '@/views/hrm/utils/constants'
export default {
  name: 'HrmRecruitInterviewResultForm',
  data() { return { HrmRecruitInterviewResult, dialogVisible: false, dialogTitle: '', formLoading: false, cancelMode: false, formData: { id: 0, result: HrmRecruitInterviewResult.PASS, evaluate: '', cancelReason: '' }, formRules: { result: [{ required: true, message: '面试结果不能为空', trigger: 'change' }], cancelReason: [{ validator: this.validateCancelReason, trigger: 'blur' }] }} },
  computed: { resultOptions() { return getIntDictOptions(DICT_TYPE.HRM_RECRUIT_INTERVIEW_RESULT).filter(item => item.value === HrmRecruitInterviewResult.PASS || item.value === HrmRecruitInterviewResult.NOT_PASS) } },
  methods: {
    validateCancelReason(rule, value, callback) { if (this.formData.result === HrmRecruitInterviewResult.CANCELED && !(value || '').trim()) { callback(new Error('取消原因不能为空')); return } callback() },
    open(interview, result = HrmRecruitInterviewResult.PASS) { this.cancelMode = result === HrmRecruitInterviewResult.CANCELED; this.dialogTitle = this.cancelMode ? '取消面试' : '登记面试结果'; this.dialogVisible = true; this.resetForm(interview, result) },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const canceled = this.formData.result === HrmRecruitInterviewResult.CANCELED; await updateRecruitInterviewResult({ id: this.formData.id, result: this.formData.result, evaluate: canceled ? '' : this.formData.evaluate, cancelReason: canceled ? this.formData.cancelReason : '' }); this.$modal.msgSuccess(this.$t('common.updateSuccess')); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm(interview, result) { this.formData = { id: interview.id, result, evaluate: interview.evaluate || '', cancelReason: interview.cancelReason || '' }; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
