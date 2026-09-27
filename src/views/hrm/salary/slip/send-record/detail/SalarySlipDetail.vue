<template>
  <el-dialog
    title="工资条明细"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <div
      v-loading="loading"
      class="detail-body"
    >
      <div class="amount-header">
        <div class="amount">{{ formatHrmMoney(detail.realPaySalary) }}</div>
        <div class="amount-label">实发金额（元）</div>
      </div>
      <el-table
        :data="detail.options || []"
        :row-key="getOptionRowKey"
        border
        default-expand-all
      >
        <el-table-column
          label="项目"
          prop="name"
          min-width="180"
        />
        <el-table-column
          label="金额"
          align="right"
          prop="value"
          width="150"
        >
          <template slot-scope="scope">
            {{ scope.row.children && scope.row.children.length ? '-' : formatHrmMoney(scope.row.value) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span slot="footer"><el-button @click="dialogVisible = false">关 闭</el-button></span>
  </el-dialog>
</template>

<script>
import { getSalarySlip } from '@/api/hrm/salary/slip'
import { formatHrmMoney } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalarySlipDetail',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      detail: {}
    }
  },
  methods: {
    formatHrmMoney,
    getOptionRowKey(option) {
      return option.code !== undefined ? 'option-' + option.code : 'category-' + option.sort
    },
    async open(id) {
      if (!id) return
      this.dialogVisible = true
      this.loading = true
      try {
        const response = await getSalarySlip(id)
        this.detail = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.detail-body { min-height: 320px; }
.amount-header { margin-bottom: 20px; text-align: center; }
.amount { font-size: 24px; font-weight: 600; }
.amount-label { margin-top: 8px; color: #909399; font-size: 14px; }
</style>
