<template>
  <el-dialog
    :title="(record ? record.month : '') + ' 月社保表'"
    :visible.sync="dialogVisible"
    width="1060px"
    append-to-body
  >
    <div v-loading="loading">
      <el-descriptions
        :column="2"
        border
        class="record-summary"
      >
        <el-descriptions-item label="参保方案">{{ record && record.schemeName ? record.schemeName : '-' }}</el-descriptions-item>
        <el-descriptions-item label="方案类型">
          <dict-tag
            v-if="record && record.schemeType"
            :type="DICT_TYPE.HRM_INSURANCE_SCHEME_TYPE"
            :value="record.schemeType"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="个人缴纳">¥ {{ formatHrmMoney(personalTotal) }}</el-descriptions-item>
        <el-descriptions-item label="公司缴纳">¥ {{ formatHrmMoney(corporateTotal) }}</el-descriptions-item>
        <el-descriptions-item
          label="本月合计"
          :span="2"
        >
          <b class="total-value">¥ {{ formatHrmMoney(personalTotal + corporateTotal) }}</b>
        </el-descriptions-item>
      </el-descriptions>
      <el-table
        :data="record && record.projects ? record.projects : []"
        border
        show-summary
        :summary-method="projectSummary"
      >
        <el-table-column
          label="缴纳项目"
          prop="name"
          min-width="150"
        />
        <el-table-column
          label="缴纳基数"
          align="right"
          width="130"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.baseAmount) }}</template>
        </el-table-column>
        <el-table-column
          v-if="isProportion"
          label="个人比例"
          align="right"
          width="110"
        >
          <template slot-scope="scope">{{ formatHrmRate(scope.row.personalRate) }}</template>
        </el-table-column>
        <el-table-column
          label="个人金额"
          prop="personalAmount"
          align="right"
          width="130"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.personalAmount) }}</template>
        </el-table-column>
        <el-table-column
          v-if="isProportion"
          label="公司比例"
          align="right"
          width="110"
        >
          <template slot-scope="scope">{{ formatHrmRate(scope.row.corporateRate) }}</template>
        </el-table-column>
        <el-table-column
          label="公司金额"
          prop="corporateAmount"
          align="right"
          width="130"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.corporateAmount) }}</template>
        </el-table-column>
        <el-table-column
          label="合计"
          prop="totalAmount"
          align="right"
          width="130"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(Number(scope.row.personalAmount || 0) + Number(scope.row.corporateAmount || 0)) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getInsuranceRecord } from '@/api/hrm/portal/insurance/record'
import { HrmInsuranceSchemeType } from '@/views/hrm/utils/constants'
import { formatHrmMoney, formatHrmRate } from '@/views/hrm/utils/format'

export default {
  name: 'HrmPortalInsuranceRecordDetail',
  data() {
    return { DICT_TYPE, dialogVisible: false, loading: false, record: undefined }
  },
  computed: {
    personalTotal() {
      return this.record ? Number(this.record.personalInsuranceAmount || 0) + Number(this.record.personalProvidentFundAmount || 0) : 0
    },
    corporateTotal() {
      return this.record ? Number(this.record.corporateInsuranceAmount || 0) + Number(this.record.corporateProvidentFundAmount || 0) : 0
    },
    isProportion() {
      return Boolean(this.record && this.record.schemeType === HrmInsuranceSchemeType.PROPORTION)
    }
  },
  methods: {
    formatHrmMoney,
    formatHrmRate,
    async open(summary) {
      this.record = { ...summary, projects: [] }
      this.dialogVisible = true
      this.loading = true
      try {
        const response = await getInsuranceRecord(summary.id)
        this.record = response.data
      } finally {
        this.loading = false
      }
    },
    projectSummary({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        const property = String(column.property || '')
        if (!['personalAmount', 'corporateAmount'].includes(property) && index !== columns.length - 1) return ''
        const total = data.reduce((sum, item) => {
          if (property === 'personalAmount') return sum + Number(item.personalAmount || 0)
          if (property === 'corporateAmount') return sum + Number(item.corporateAmount || 0)
          return sum + Number(item.personalAmount || 0) + Number(item.corporateAmount || 0)
        }, 0)
        return `¥ ${formatHrmMoney(total)}`
      })
    }
  }
}
</script>

<style scoped>
.record-summary { margin-bottom: 16px; }
.total-value { color: #409eff; font-size: 16px; }
</style>
