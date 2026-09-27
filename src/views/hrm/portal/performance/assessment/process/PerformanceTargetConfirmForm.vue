<template>
  <el-drawer
    title="确认绩效指标"
    :visible.sync="drawerVisible"
    size="920px"
    destroy-on-close
    append-to-body
  >
    <div
      v-loading="loading"
      class="drawer-body"
    >
      <div class="target-head">
        <div><div class="employee-name">{{ detail.employeeName || '-' }}</div><div class="assessment-name">{{ detail.name || '-' }}</div></div>
        <el-tag
          type="warning"
          effect="plain"
        >待指标确认</el-tag>
      </div>
      <el-descriptions
        :column="3"
        border
        class="target-summary"
      >
        <el-descriptions-item label="工号">{{ detail.jobNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="确认人">{{ detail.targetConfirmationEmployeeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="指标数">{{ detail.quotas ? detail.quotas.length : 0 }}</el-descriptions-item>
      </el-descriptions>
      <el-table
        :data="detail.quotas || []"
        border
      >
        <el-table-column
          label="维度"
          prop="dimensionName"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="指标"
          prop="name"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          label="指标说明"
          prop="description"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          label="考核标准"
          prop="standard"
          min-width="210"
          show-overflow-tooltip
        />
        <el-table-column
          label="权重"
          width="130"
          align="center"
        ><template slot-scope="scope">{{ scope.row.dimensionWeight || 0 }}% / {{ scope.row.weight || 0 }}%</template></el-table-column>
      </el-table>
      <el-input
        v-model="comment"
        class="confirm-comment"
        type="textarea"
        :rows="3"
        maxlength="1000"
        show-word-limit
        placeholder="填写确认意见；退回时必填"
      />
    </div>
    <div class="drawer-footer">
      <el-button @click="drawerVisible = false">取 消</el-button>
      <el-button
        :loading="submitting"
        plain
        type="danger"
        @click="submitConfirm(0)"
      >退回指标</el-button>
      <el-button
        :loading="submitting"
        type="primary"
        @click="submitConfirm(1)"
      >确认通过</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { confirmPerformanceAssessmentTarget, getPerformanceAssessment } from '@/api/hrm/portal/performance/assessment'

export default {
  name: 'HrmPortalPerformanceTargetConfirmForm',
  data() { return { drawerVisible: false, loading: false, submitting: false, detail: {}, comment: '' } },
  methods: {
    async open(assessmentId, stageId) {
      if (!assessmentId || !stageId) return
      this.drawerVisible = true
      this.loading = true
      this.comment = ''
      try {
        const response = await getPerformanceAssessment(assessmentId, stageId)
        this.detail = response.data
      } finally {
        this.loading = false
      }
    },
    async submitConfirm(pass) {
      if (!this.detail.id) return
      if (pass === 0 && !this.comment.trim()) {
        this.$modal.msgError('退回指标时请填写原因')
        return
      }
      this.submitting = true
      try {
        await confirmPerformanceAssessmentTarget({
          assessmentId: this.detail.id,
          pass,
          comment: this.comment.trim() || (pass === 1 ? '指标确认通过' : undefined)
        })
        this.$modal.msgSuccess(pass === 1 ? '指标已确认' : '指标已退回')
        this.drawerVisible = false
        this.$emit('success')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.drawer-body { padding: 0 20px 72px; }
.target-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.employee-name { font-size: 20px; font-weight: 600; }
.assessment-name { margin-top: 4px; color: #909399; font-size: 13px; }
.target-summary { margin-bottom: 16px; }
.confirm-comment { margin-top: 16px; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; border-top: 1px solid #ebeef5; background: #fff; text-align: right; }
</style>
