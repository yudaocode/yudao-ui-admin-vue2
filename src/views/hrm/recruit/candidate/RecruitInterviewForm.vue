<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="760px"
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
        v-if="formType === 'batch'"
        label="候选人数"
      ><el-input
        :value="`${candidateIds.length} 人`"
        disabled
      /></el-form-item>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="面试方式"
          prop="type"
        ><el-select
          v-model="formData.type"
          class="full-width"
          placeholder="请选择面试方式"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_INTERVIEW_TYPE)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="面试时间"
          prop="interviewTime"
        ><el-date-picker
          v-model="formData.interviewTime"
          class="full-width"
          placeholder="请选择面试时间"
          type="datetime"
          value-format="timestamp"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="主面试官"
          prop="interviewEmployeeId"
        ><hrm-employee-select
          v-model="formData.interviewEmployeeId"
          class="full-width"
          :entry-status="HrmEmployeeEntryStatus.ACTIVE"
          placeholder="请选择主面试官"
          title="选择主面试官"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="其他面试官"
          prop="otherInterviewEmployeeIds"
        ><hrm-employee-select
          v-model="formData.otherInterviewEmployeeIds"
          class="full-width"
          :entry-status="HrmEmployeeEntryStatus.ACTIVE"
          multiple
          placeholder="请选择其他面试官"
          title="选择其他面试官"
        /></el-form-item></el-col>
      </el-row>
      <el-form-item
        label="面试地址"
        prop="address"
      ><el-input
        v-model="formData.address"
        maxlength="255"
        placeholder="请输入面试地址"
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
      type="primary"
      @click="submitForm"
    >保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { createRecruitInterview, updateRecruitInterview } from '@/api/hrm/recruit/interview'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import { HrmEmployeeEntryStatus, HrmRecruitInterviewType } from '@/views/hrm/utils/constants'
import { executeHrmBatch } from '@/views/hrm/utils/batch'

export default {
  name: 'HrmRecruitInterviewForm',
  components: { HrmEmployeeSelect },
  data() {
    return {
      DICT_TYPE,
      HrmEmployeeEntryStatus,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      candidateIds: [],
      formData: this.createDefaultFormData(0),
      formRules: {
        type: [{ required: true, message: '面试方式不能为空', trigger: 'change' }],
        interviewEmployeeId: [{ required: true, message: '主面试官不能为空', trigger: 'change' }],
        interviewTime: [{ required: true, message: '面试时间不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getIntDictOptions,
    createDefaultFormData(candidateId) { return { id: undefined, candidateId, type: HrmRecruitInterviewType.VIDEO, interviewEmployeeId: undefined, otherInterviewEmployeeIds: [], interviewTime: undefined, address: '', remark: '' } },
    open(type, candidateIdOrIds, interview, createTitle = '安排面试') {
      const batch = Array.isArray(candidateIdOrIds)
      this.formType = type
      this.candidateIds = batch ? [...candidateIdOrIds] : [candidateIdOrIds]
      this.dialogTitle = type === 'update' ? '更改面试安排' : type === 'batch' ? '批量安排面试' : createTitle
      this.dialogVisible = true
      this.resetForm(this.candidateIds[0])
      if (interview) this.formData = { ...interview, otherInterviewEmployeeIds: interview.otherInterviewEmployeeIds || [] }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'update') {
          await updateRecruitInterview(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        } else if (this.formType === 'batch') {
          const success = await executeHrmBatch(this, this.candidateIds.map(candidateId => createRecruitInterview({ ...this.formData, candidateId })))
          if (!success) return
        } else {
          await createRecruitInterview({ ...this.formData, candidateId: this.candidateIds[0] })
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm(candidateId) {
      this.formData = this.createDefaultFormData(candidateId)
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
