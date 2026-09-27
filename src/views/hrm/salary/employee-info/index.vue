<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
      >
        <el-form-item
          label="员工"
          prop="search"
        >
          <el-input
            v-model="queryParams.search"
            class="search-input"
            clearable
            placeholder="请输入姓名或工号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="部门"
          prop="deptId"
        >
          <dept-select
            v-model="queryParams.deptId"
            class="dept-select"
          />
        </el-form-item>
        <el-form-item
          label="岗位"
          prop="postName"
        >
          <el-input
            v-model="queryParams.postName"
            class="post-input"
            clearable
            placeholder="请输入岗位名称"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="changeType"
        >
          <el-select
            v-model="queryParams.changeType"
            class="status-select"
            clearable
            placeholder="请选择档案状态"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_SALARY_CHANGE_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            v-hasPermi="['hrm:salary:employee-info:update']"
            plain
            type="primary"
            icon="el-icon-operation"
            @click="$refs.employeeInfoBatchForm.open(selectedEmployeeIds)"
          >批量调薪</el-button>
          <el-button
            v-hasPermi="['hrm:salary:employee-info:import']"
            plain
            type="warning"
            icon="el-icon-upload"
            @click="$refs.importForm.open('fix')"
          >导入定薪</el-button>
          <el-button
            v-hasPermi="['hrm:salary:employee-info:import']"
            plain
            type="warning"
            icon="el-icon-upload"
            @click="$refs.importForm.open('change')"
          >导入调薪</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card
      class="block-card"
      shadow="never"
    >
      <el-tabs
        v-model="activeStatus"
        @tab-click="handleStatusTabChange"
      >
        <el-tab-pane
          v-for="item in statusItems"
          :key="item.status"
          :name="String(item.status)"
        >
          <span slot="label">{{ item.label }}（{{ statusCountMap[item.status] || 0 }}）</span>
        </el-tab-pane>
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="46"
        />
        <el-table-column
          fixed="left"
          label="员工姓名"
          min-width="140"
        >
          <template slot-scope="scope">
            <el-link
              :underline="false"
              type="primary"
              @click="openDetail(scope.row.employeeId)"
            >{{ scope.row.employeeName || '-' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="工号"
          prop="jobNumber"
          width="120"
        />
        <el-table-column
          label="部门"
          min-width="140"
          prop="deptName"
        />
        <el-table-column
          label="岗位"
          prop="postName"
          min-width="140"
        />
        <el-table-column
          align="center"
          label="员工状态"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              v-if="scope.row.status != null"
              :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
              :value="scope.row.status"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          :formatter="dateFormatter2"
          align="center"
          label="入职日期"
          prop="entryTime"
          width="120"
        />
        <el-table-column
          :formatter="dateFormatter2"
          align="center"
          label="转正日期"
          prop="regularTime"
          width="120"
        />
        <el-table-column
          :formatter="dateFormatter2"
          align="center"
          label="最近调整日期"
          prop="effectTime"
          width="120"
        />
        <el-table-column
          align="center"
          label="调薪原因"
          prop="changeReason"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              v-if="scope.row.changeReason != null"
              :type="DICT_TYPE.HRM_SALARY_CHANGE_REASON"
              :value="scope.row.changeReason"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          align="right"
          label="工资合计"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(getSalaryTotal(scope.row)) }}</template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="140"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:salary:employee-info:update']"
              type="text"
              @click="$refs.employeeInfoForm.open(scope.row.employeeId)"
            >{{ scope.row.id ? '调薪' : '定薪' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-card>
    <salary-employee-info-form
      ref="employeeInfoForm"
      @success="getList"
    />
    <salary-employee-info-batch-form
      ref="employeeInfoBatchForm"
      @success="getList"
    />
    <salary-employee-info-import-form
      ref="importForm"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import {
  getSalaryEmployeeInfoPage,
  getSalaryEmployeeInfoStatusCount
} from '@/api/hrm/salary/employee-info'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { HrmEmployeeStatus, HrmEmployeeStatusTab } from '@/views/hrm/utils/constants'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import SalaryEmployeeInfoBatchForm from './SalaryEmployeeInfoBatchForm.vue'
import SalaryEmployeeInfoForm from './SalaryEmployeeInfoForm.vue'
import SalaryEmployeeInfoImportForm from './SalaryEmployeeInfoImportForm.vue'

export default {
  name: 'HrmSalaryEmployeeInfo',
  components: {
    DeptSelect,
    SalaryEmployeeInfoBatchForm,
    SalaryEmployeeInfoForm,
    SalaryEmployeeInfoImportForm
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      total: 0,
      list: [],
      activeStatus: String(HrmEmployeeStatusTab.ACTIVE),
      statusCountMap: {},
      selectedEmployeeIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        search: undefined,
        deptId: undefined,
        postName: undefined,
        statusCategory: HrmEmployeeStatusTab.ACTIVE,
        changeType: undefined
      },
      statusItems: [
        { status: HrmEmployeeStatusTab.ACTIVE, label: '在职' },
        { status: HrmEmployeeStatusTab.FULL_TIME, label: '全职' },
        ...[
          HrmEmployeeStatus.INTERN,
          HrmEmployeeStatus.LABOR,
          HrmEmployeeStatus.CONSULTANT,
          HrmEmployeeStatus.REHIRE,
          HrmEmployeeStatus.OUTSOURCE,
          HrmEmployeeStatus.PART_TIME,
          HrmEmployeeStatus.PROBATION,
          HrmEmployeeStatus.REGULAR
        ].map(status => ({
          status,
          label: getDictLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, status)
        }))
      ]
    }
  },
  created() { this.getList() },
  methods: {
    getIntDictOptions,
    dateFormatter2,
    formatHrmMoney,
    async getList() {
      this.loading = true
      try {
        const [pageResponse, countResponse] = await Promise.all([
          getSalaryEmployeeInfoPage(this.queryParams),
          getSalaryEmployeeInfoStatusCount(this.queryParams)
        ])
        this.list = pageResponse.data.list
        this.total = pageResponse.data.total
        this.statusCountMap = countResponse.data.reduce((countMap, item) => {
          countMap[item.status] = item.count
          return countMap
        }, {})
        this.selectedEmployeeIds = []
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.activeStatus = String(HrmEmployeeStatusTab.ACTIVE)
      this.queryParams.statusCategory = HrmEmployeeStatusTab.ACTIVE
      this.handleQuery()
    },
    handleStatusTabChange() {
      this.queryParams.statusCategory = Number(this.activeStatus)
      this.handleQuery()
    },
    handleSelectionChange(rows) {
      this.selectedEmployeeIds = rows
        .map(row => row.employeeId)
        .filter(employeeId => employeeId !== undefined)
    },
    openDetail(employeeId) {
      if (!employeeId) return
      this.$router.push({ name: 'HrmSalaryEmployeeInfoDetail', params: { id: employeeId }})
    },
    getSalaryTotal(salaryEmployee) {
      return salaryEmployee.status === HrmEmployeeStatus.PROBATION
        ? salaryEmployee.probationSalary
        : salaryEmployee.regularSalary
    }
  }
}
</script>

<style scoped>
.block-card { margin-top: 16px; }
.search-input, .dept-select { width: 220px; }
.post-input { width: 180px; }
.status-select { width: 170px; }
</style>
