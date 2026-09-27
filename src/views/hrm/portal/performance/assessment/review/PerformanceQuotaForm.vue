<template>
  <el-drawer
    title="制定绩效指标"
    :visible.sync="drawerVisible"
    size="960px"
    destroy-on-close
    append-to-body
  >
    <div
      v-loading="loading"
      class="quota-body"
    >
      <div class="quota-head">
        <div><div class="employee-name">{{ detail.employeeName || '-' }}</div><div class="assessment-name">{{ detail.name || '-' }}</div></div>
        <dict-tag
          :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
          :value="detail.stageType == null ? 0 : detail.stageType"
        />
      </div>
      <el-alert
        v-if="detail.targetConfirmationResult === 0"
        class="return-alert"
        :closable="false"
        type="warning"
        show-icon
        :title="'目标已退回：' + (detail.targetConfirmationComment || '请调整后重新提交')"
      />
      <section
        v-for="group in dimensionGroups"
        :key="group.key"
        class="dimension-group"
      >
        <div class="dimension-head">
          <div class="dimension-name"><span>{{ group.name }}</span><span>维度权重 {{ group.weight }}%</span></div>
          <div class="dimension-actions">
            <span :class="weightTotal(group) === 100 ? 'weight-valid' : 'weight-invalid'">指标权重 {{ weightTotal(group) }}%</span>
            <el-button
              v-if="group.allowEdit"
              :disabled="detail.stageType !== StageType.FILL_QUOTA"
              plain
              type="primary"
              icon="el-icon-plus"
              @click="addQuota(group)"
            >新增指标</el-button>
          </div>
        </div>
        <el-table
          :data="group.quotas"
          border
        >
          <el-table-column
            label="指标名称"
            min-width="170"
          >
            <template slot-scope="scope"><div
              v-if="scope.row.preset"
              class="preset-cell"
            ><span>{{ scope.row.name || '-' }}</span><el-tag
              size="mini"
              type="info"
              effect="plain"
            >预置</el-tag></div><el-input
              v-else
              v-model="scope.row.name"
              maxlength="255"
              placeholder="请输入指标名称"
            /></template>
          </el-table-column>
          <el-table-column
            label="指标说明"
            min-width="180"
          ><template slot-scope="scope"><span v-if="scope.row.preset">{{ scope.row.description || '-' }}</span><el-input
            v-else
            v-model="scope.row.description"
            maxlength="1000"
            placeholder="请输入指标说明"
          /></template></el-table-column>
          <el-table-column
            label="考核标准"
            min-width="210"
          ><template slot-scope="scope"><span v-if="scope.row.preset">{{ scope.row.standard || '-' }}</span><el-input
            v-else
            v-model="scope.row.standard"
            maxlength="1000"
            placeholder="请输入考核标准"
          /></template></el-table-column>
          <el-table-column
            label="指标权重"
            width="125"
          ><template slot-scope="scope"><span v-if="scope.row.preset">{{ scope.row.weight || 0 }}%</span><el-input-number
            v-else
            v-model="scope.row.weight"
            :min="0.01"
            :max="100"
            :precision="2"
            :controls="false"
            aria-label="指标权重"
            style="width: 100%"
          /></template></el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="72"
          ><template slot-scope="scope"><el-button
            v-if="!scope.row.preset"
            type="text"
            class="delete-button"
            title="删除指标"
            icon="el-icon-delete"
            @click="removeQuota(scope.row)"
          /></template></el-table-column>
        </el-table>
      </section>
      <el-empty
        v-if="!dimensionGroups.length"
        description="暂无可填写指标"
      />
    </div>
    <div class="drawer-footer">
      <el-button @click="drawerVisible = false">取 消</el-button>
      <el-button
        :disabled="detail.stageType !== StageType.FILL_QUOTA"
        :loading="submitting"
        type="primary"
        @click="submitQuota"
      >提交指标</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { fillPerformanceAssessmentQuota, getPerformanceAssessment } from '@/api/hrm/portal/performance/assessment'
import { HrmPerformanceStageType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmPortalPerformanceQuotaForm',
  data() {
    return {
      DICT_TYPE,
      StageType: HrmPerformanceStageType,
      drawerVisible: false,
      loading: false,
      submitting: false,
      detail: {}
    }
  },
  computed: {
    dimensionGroups() {
      const groups = new Map()
      for (const dimension of this.detail.dimensions || []) {
        const key = dimension.id !== undefined ? String(dimension.id) : dimension.name || 'default'
        groups.set(key, { key, dimensionId: dimension.id, name: dimension.name || '未命名维度', weight: Number(dimension.weight || 0), allowEdit: dimension.allowEdit, quotas: [] })
      }
      for (const quota of this.detail.quotas || []) {
        const key = quota.dimensionId ? String(quota.dimensionId) : quota.dimensionName || 'default'
        if (!groups.has(key)) groups.set(key, { key, dimensionId: quota.dimensionId, name: quota.dimensionName || '未命名维度', weight: Number(quota.dimensionWeight || 0), allowEdit: quota.allowEdit, quotas: [] })
        groups.get(key).quotas.push(quota)
      }
      return Array.from(groups.values())
    }
  },
  methods: {
    async open(assessmentId) {
      if (!assessmentId) return
      this.drawerVisible = true
      this.loading = true
      try {
        const response = await getPerformanceAssessment(assessmentId)
        this.detail = response.data
      } finally {
        this.loading = false
      }
    },
    weightTotal(group) { return Number(group.quotas.reduce((total, quota) => total + Number(quota.weight || 0), 0).toFixed(2)) },
    addQuota(group) {
      const remainingWeight = Math.max(0, Number((100 - this.weightTotal(group)).toFixed(2)))
      if (!this.detail.quotas) this.$set(this.detail, 'quotas', [])
      this.detail.quotas.push({
        dimensionId: group.dimensionId,
        preset: false,
        name: '',
        description: '',
        standard: '',
        weight: remainingWeight || undefined,
        scoreType: 1
      })
    },
    removeQuota(quota) {
      const index = this.detail.quotas ? this.detail.quotas.indexOf(quota) : -1
      if (index >= 0) this.detail.quotas.splice(index, 1)
    },
    validateQuota() {
      for (const group of this.dimensionGroups) {
        if (this.weightTotal(group) !== 100) {
          this.$modal.msgError(`${group.name}的指标权重合计必须等于 100%`)
          return false
        }
        const customQuotas = group.quotas.filter(quota => !quota.preset)
        if (customQuotas.some(quota => !quota.name || !quota.name.trim() || !quota.standard || !quota.standard.trim() || !quota.weight || quota.weight <= 0)) {
          this.$modal.msgError(`请完整填写${group.name}的新增指标`)
          return false
        }
        const names = group.quotas.map(quota => quota.name && quota.name.trim()).filter(Boolean)
        if (new Set(names).size !== names.length) {
          this.$modal.msgError(`${group.name}存在重复指标名称`)
          return false
        }
      }
      return this.dimensionGroups.length > 0
    },
    async submitQuota() {
      if (!this.detail.id || !this.validateQuota()) return
      this.submitting = true
      try {
        const fields = ['id', 'dimensionId', 'name', 'description', 'standard', 'weight', 'scoreType', 'targetValue', 'actualValue', 'selfScore', 'reviewerScore', 'finalScore', 'comment', 'sort']
        const quotas = (this.detail.quotas || []).map(quota => fields.reduce((result, field) => {
          result[field] = quota[field]
          return result
        }, {}))
        await fillPerformanceAssessmentQuota({ assessmentId: this.detail.id, quotas })
        this.$modal.msgSuccess('绩效指标已提交')
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
.quota-body { padding: 0 20px 72px; }
.quota-head, .dimension-head, .dimension-actions, .preset-cell { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.quota-head { margin-bottom: 18px; }
.employee-name { font-size: 20px; font-weight: 600; }
.assessment-name, .dimension-name span:last-child { margin-top: 4px; color: #909399; font-size: 13px; }
.return-alert { margin-bottom: 16px; }
.dimension-group { margin-bottom: 20px; }
.dimension-head { min-height: 42px; gap: 12px; }
.dimension-name { display: flex; flex-direction: column; align-items: flex-start; font-weight: 600; }
.dimension-actions { gap: 12px; }
.dimension-actions > span { font-size: 13px; }
.weight-valid { color: #67c23a; }.weight-invalid, .delete-button { color: #f56c6c; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; border-top: 1px solid #ebeef5; background: #fff; text-align: right; }
</style>
