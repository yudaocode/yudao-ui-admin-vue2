<template>
  <div>
    <el-alert
      v-if="readiness && readiness.noSalaryGroupEmployeeCount"
      class="readiness-alert"
      show-icon
      type="warning"
    >
      <template slot="title">
        有 {{ readiness.noSalaryGroupEmployeeCount }} 名员工未加入任何薪资组，无法参与工资核算。
        <el-button
          type="text"
          @click="noSalaryGroupDialogVisible = true"
        >查看员工</el-button>
      </template>
    </el-alert>
    <el-alert
      v-if="readiness && readiness.noSalaryEmployeeCount"
      class="readiness-alert"
      show-icon
      type="warning"
    >
      <template slot="title">
        有 {{ readiness.noSalaryEmployeeCount }}
        名员工没有生效薪资档案，将优先继承上月工资；无上月工资时按 0 核算。
        <el-button
          type="text"
          @click="noSalaryDialogVisible = true"
        >查看员工</el-button>
      </template>
    </el-alert>

    <el-dialog
      title="未加入薪资组的员工"
      :visible.sync="noSalaryGroupDialogVisible"
      width="860px"
      append-to-body
    >
      <salary-payroll-readiness-employee-list
        :list="readiness && readiness.noSalaryGroupEmployees"
      />
    </el-dialog>
    <el-dialog
      title="未设置薪资档案的员工"
      :visible.sync="noSalaryDialogVisible"
      width="860px"
      append-to-body
    >
      <salary-payroll-readiness-employee-list
        :list="readiness && readiness.noSalaryEmployees"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getSalaryPayrollReadiness } from '@/api/hrm/salary/month-record'
import SalaryPayrollReadinessEmployeeList from './SalaryPayrollReadinessEmployeeList.vue'

export default {
  name: 'HrmSalaryPayrollReadinessAlert',
  components: { SalaryPayrollReadinessEmployeeList },
  props: { monthRecordId: { type: Number, default: undefined }},
  data() {
    return {
      readiness: undefined,
      noSalaryGroupDialogVisible: false,
      noSalaryDialogVisible: false
    }
  },
  methods: {
    async refresh() {
      if (!this.monthRecordId) {
        this.readiness = undefined
        return
      }
      const response = await getSalaryPayrollReadiness(this.monthRecordId)
      this.readiness = response.data
    }
  }
}
</script>

<style scoped>.readiness-alert { margin-top: 8px; }</style>
