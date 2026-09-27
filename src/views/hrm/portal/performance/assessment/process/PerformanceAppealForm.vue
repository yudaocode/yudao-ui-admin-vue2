<template>
  <el-dialog
    title="提交绩效申诉"
    :visible.sync="dialogVisible"
    width="680px"
    append-to-body
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item
        label="退回评分节点"
        prop="reviewStageIds"
      >
        <el-checkbox-group v-model="formData.reviewStageIds">
          <el-checkbox
            v-for="stage in completedReviewStages"
            :key="stage.id"
            :label="stage.id"
          >
            {{ stage.name || '评分阶段' }}<span v-if="stage.handlerName">（{{ stage.handlerName }}）</span>
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        label="申诉原因"
        prop="appealReason"
      >
        <el-input
          v-model="formData.appealReason"
          :rows="4"
          maxlength="500"
          placeholder="请输入申诉原因"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item
        label="申诉附件"
        prop="appealFileUrls"
      >
        <UploadFile
          v-model="formData.appealFileUrls"
          :file-size="20"
          :limit="1"
          directory="hrm/performance/appeal"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getPerformanceAssessment, submitPerformanceAssessmentAppeal } from '@/api/hrm/portal/performance/assessment'
import { HrmPerformanceAssessmentStageStatus } from '@/views/hrm/utils/constants'

function defaultFormData() {
  return { assessmentId: undefined, appealReason: '', appealFileUrls: [], reviewStageIds: [] }
}

export default {
  name: 'HrmPortalPerformanceAppealForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      completedReviewStages: [],
      formData: defaultFormData(),
      formRules: {
        reviewStageIds: [{ type: 'array', required: true, min: 1, message: '请选择需要退回的评分节点', trigger: 'change' }],
        appealReason: [{ required: true, message: '申诉原因不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async open(assessmentId) {
      this.dialogVisible = true
      this.formLoading = true
      this.resetForm()
      this.formData.assessmentId = assessmentId
      try {
        const response = await getPerformanceAssessment(assessmentId)
        const completed = (response.data.reviewStages || []).filter(stage => stage.id != null && stage.status === HrmPerformanceAssessmentStageStatus.PROCESSED)
        this.completedReviewStages = completed
        const latestStage = completed[completed.length - 1]
        this.formData.reviewStageIds = latestStage && latestStage.id ? [latestStage.id] : []
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid || !this.formData.assessmentId) return
      this.formLoading = true
      try {
        await submitPerformanceAssessmentAppeal({
          assessmentId: this.formData.assessmentId,
          appealReason: this.formData.appealReason,
          appealFileUrls: this.formData.appealFileUrls,
          reviewStageIds: this.formData.reviewStageIds
        })
        this.$modal.msgSuccess('绩效申诉已提交')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = defaultFormData()
      this.completedReviewStages = []
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.resetFields())
    }
  }
}
</script>
