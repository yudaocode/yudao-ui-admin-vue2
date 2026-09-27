<template>
  <el-drawer
    title="员工月度社保详情"
    :visible.sync="drawerVisible"
    :with-header="true"
    destroy-on-close
    size="980px"
  >
    <div
      v-loading="loading"
      class="detail-body"
    >
      <div class="detail-header">
        <div class="employee-heading">
          <div class="employee-title">
            <span>{{ detail ? detail.employeeName || '--' : '--' }}</span>
            <dict-tag
              v-if="detail"
              :type="DICT_TYPE.HRM_INSURANCE_EMP_STATUS"
              :value="detail.status == null ? '' : detail.status"
            />
          </div>
          <div class="employee-subtitle">
            {{ detail ? detail.postName || '--' : '--' }} ·
            {{ detail ? detail.year || '--' : '--' }} 年
            {{ detail ? detail.month || '--' : '--' }} 月
          </div>
        </div>
        <el-button
          v-if="editable && detail"
          v-hasPermi="['hrm:insurance:month-record:update']"
          plain
          type="primary"
          icon="el-icon-edit"
          @click="handleEdit"
        >编辑</el-button>
      </div>

      <el-descriptions
        :column="3"
        border
        class="base-info"
      >
        <el-descriptions-item label="性别">
          <dict-tag
            v-if="detail && detail.sex != null"
            :type="DICT_TYPE.SYSTEM_USER_SEX"
            :value="detail.sex"
          />
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="年龄">{{ detail && detail.age != null ? detail.age : '--' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ detail ? detail.jobNumber || '--' : '--' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ detail ? detail.deptName || '--' : '--' }}</el-descriptions-item>
        <el-descriptions-item label="员工状态">
          <dict-tag
            v-if="detail && detail.employeeStatus != null"
            :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
            :value="detail.employeeStatus"
          />
          <span v-else>--</span>
        </el-descriptions-item>
        <el-descriptions-item label="入职日期">{{ formatHrmDate(detail && detail.entryTime) }}</el-descriptions-item>
        <el-descriptions-item label="参保城市">{{ detail ? detail.areaName || '--' : '--' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail ? detail.idNumber || '--' : '--' }}</el-descriptions-item>
        <el-descriptions-item label="个人社保号">{{ detail ? detail.socialSecurityNumber || '--' : '--' }}</el-descriptions-item>
        <el-descriptions-item label="个人公积金号">{{ detail ? detail.accumulationFundNumber || '--' : '--' }}</el-descriptions-item>
        <el-descriptions-item label="参保方案">{{ detail ? detail.schemeName || '--' : '--' }}</el-descriptions-item>
      </el-descriptions>

      <div class="project-title">缴费项目</div>
      <el-table
        :data="projects"
        :summary-method="projectSummary"
        border
        show-summary
      >
        <el-table-column
          label="缴纳项目"
          min-width="130"
        >
          <template slot-scope="scope">{{ formatHrmInsuranceProjectName(scope.row) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="缴纳基数"
          min-width="100"
          prop="baseAmount"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.baseAmount) }}</template>
        </el-table-column>
        <el-table-column
          v-if="detail && detail.schemeType === HrmInsuranceSchemeType.PROPORTION"
          align="right"
          label="企业比例"
          min-width="90"
          prop="corporateRate"
        >
          <template slot-scope="scope">{{ formatHrmRate(scope.row.corporateRate) }}</template>
        </el-table-column>
        <el-table-column
          v-if="detail && detail.schemeType === HrmInsuranceSchemeType.PROPORTION"
          align="right"
          label="个人比例"
          min-width="90"
          prop="personalRate"
        >
          <template slot-scope="scope">{{ formatHrmRate(scope.row.personalRate) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="个人缴纳"
          min-width="100"
          prop="personalAmount"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="企业缴纳"
          min-width="100"
          prop="corporateAmount"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="合计缴费"
          min-width="100"
          prop="totalAmount"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.totalAmount) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getInsuranceMonthEmployeeRecord } from '@/api/hrm/insurance/month-record/employee'
import { HrmInsuranceSchemeType } from '@/views/hrm/utils/constants'
import {
  formatHrmDate,
  formatHrmInsuranceProjectName,
  formatHrmMoney,
  formatHrmRate
} from '@/views/hrm/utils/format'

export default {
  name: 'HrmInsuranceMonthEmployeeDetail',
  props: { editable: { type: Boolean, default: false }},
  data() {
    return {
      DICT_TYPE,
      HrmInsuranceSchemeType,
      drawerVisible: false,
      loading: false,
      detail: undefined
    }
  },
  computed: {
    projects() {
      if (!this.detail) return []
      return [...this.detail.socialSecurityProjectList, ...this.detail.providentFundProjectList]
        .map(project => ({
          ...project,
          totalAmount: Number(project.personalAmount || 0) + Number(project.corporateAmount || 0)
        }))
    }
  },
  methods: {
    formatHrmDate,
    formatHrmInsuranceProjectName,
    formatHrmMoney,
    formatHrmRate,
    async open(id) {
      if (!id) return
      this.drawerVisible = true
      this.loading = true
      try {
        const response = await getInsuranceMonthEmployeeRecord(id)
        this.detail = response.data
      } finally {
        this.loading = false
      }
    },
    handleEdit() {
      if (this.detail) this.$emit('edit', this.detail)
    },
    projectSummary({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '缴费总价'
        if (!['corporateAmount', 'personalAmount', 'totalAmount'].includes(String(column.property))) return ''
        return formatHrmMoney(data.reduce((total, project) =>
          total + Number(project[column.property] || 0), 0))
      })
    }
  }
}
</script>

<style scoped>
.detail-body { min-height: 320px; padding: 0 20px 20px; }
.detail-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.employee-heading { min-width: 0; }
.employee-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 600; }
.employee-subtitle { margin-top: 6px; color: #909399; font-size: 13px; }
.base-info { margin-bottom: 20px; }
.project-title { margin-bottom: 10px; font-size: 15px; font-weight: 600; }
</style>
