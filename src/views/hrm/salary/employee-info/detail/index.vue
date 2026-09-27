<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-page-header
        content="薪资档案详情"
        @back="close"
      />
    </el-card>
    <employee-details-header
      :employee="employee"
      :loading="loading"
      class="block-card"
    >
      <el-button
        v-hasPermi="['hrm:salary:employee-info:update']"
        :disabled="!employee.id"
        type="primary"
        icon="el-icon-edit"
        @click="openSetSalary()"
      >{{ salaryEmployee.id ? '调薪' : '定薪' }}</el-button>
    </employee-details-header>
    <div
      v-loading="loading"
      class="block-card"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="薪资档案"
          name="salaryEmployee"
        >
          <salary-employee-info-details :salary-employee="salaryEmployee" />
        </el-tab-pane>
        <el-tab-pane
          label="调薪记录"
          lazy
          name="records"
        >
          <salary-change-record-list
            ref="changeRecordList"
            :employee-id="id"
            @change="getData"
            @edit="openSetSalary"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <salary-employee-info-form
      ref="employeeInfoForm"
      @success="handleSalaryUpdated"
    />
  </div>
</template>

<script>
import { getEmployee } from '@/api/hrm/employee'
import { getSalaryEmployeeInfo } from '@/api/hrm/salary/employee-info'
import EmployeeDetailsHeader from '@/views/hrm/employee/detail/EmployeeDetailsHeader.vue'
import SalaryEmployeeInfoForm from '../SalaryEmployeeInfoForm.vue'
import SalaryChangeRecordList from './SalaryChangeRecordList.vue'
import SalaryEmployeeInfoDetails from './SalaryEmployeeInfoDetails.vue'

export default {
  name: 'HrmSalaryEmployeeInfoDetail',
  components: {
    EmployeeDetailsHeader,
    SalaryEmployeeInfoForm,
    SalaryChangeRecordList,
    SalaryEmployeeInfoDetails
  },
  data() {
    return {
      id: Number(this.$route.params.id),
      loading: false,
      employee: {},
      salaryEmployee: {},
      activeTab: 'salaryEmployee'
    }
  },
  created() { this.init() },
  methods: {
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmSalaryEmployeeInfo' })
    },
    async getData() {
      this.loading = true
      try {
        const [employeeResponse, salaryResponse] = await Promise.all([
          getEmployee(this.id),
          getSalaryEmployeeInfo(this.id)
        ])
        if (!employeeResponse.data) {
          this.$modal.msgWarning('员工档案不存在')
          this.close()
          return
        }
        this.employee = employeeResponse.data
        this.salaryEmployee = salaryResponse.data || {}
      } finally {
        this.loading = false
      }
    },
    openSetSalary(record) {
      this.$refs.employeeInfoForm.open(this.id, record && record.id)
    },
    async handleSalaryUpdated() {
      await this.getData()
      if (this.$refs.changeRecordList) await this.$refs.changeRecordList.getList()
    },
    async init() {
      if (!Number.isSafeInteger(this.id) || this.id <= 0) {
        this.$modal.msgWarning('参数错误，员工不能为空！')
        this.close()
        return
      }
      await this.getData()
    }
  }
}
</script>

<style scoped>.block-card { margin-top: 10px; }</style>
