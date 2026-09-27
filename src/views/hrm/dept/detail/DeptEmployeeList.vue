<template>
  <div>
    <el-card shadow="never" class="search-card">
      <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px" @submit.native.prevent>
        <el-form-item label="员工搜索" prop="search">
          <el-input
            v-model="queryParams.search"
            clearable
            placeholder="请输入员工姓名、工号或手机号"
            class="employee-search"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="员工姓名" align="center" prop="name" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-link type="primary" :underline="false" @click="openEmployeeDetail(scope.row.id)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="工号" align="center" prop="jobNumber" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.jobNumber || '-' }}</template>
        </el-table-column>
        <el-table-column label="部门" align="center" prop="deptName" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
        </el-table-column>
        <el-table-column label="岗位" align="center" prop="postName" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.postName || '-' }}</template>
        </el-table-column>
        <el-table-column label="聘用形式" align="center" prop="type" width="110">
          <template slot-scope="scope">
            <dict-tag v-if="scope.row.type != null" :type="DICT_TYPE.HRM_EMPLOYEE_TYPE" :value="scope.row.type" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="入职时间" align="center" prop="entryTime" width="180" :formatter="dateFormatter" />
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import { getEmployeePage } from '@/api/hrm/employee'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { HrmEmployeeStatusTab } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmDeptEmployeeList',
  props: {
    deptId: { type: Number, required: true }
  },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        search: undefined,
        deptId: this.deptId,
        statusCategory: HrmEmployeeStatusTab.ACTIVE
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 查询员工列表 */
    async getList() {
      this.loading = true
      try {
        const response = await getEmployeePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    /** 搜索员工 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置员工搜索 */
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    /** 打开员工档案详情 */
    openEmployeeDetail(id) {
      if (id === undefined) return
      this.$router.push({ name: 'HrmEmployeeDetail', params: { id }})
    }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.employee-search { width: 280px; }
</style>
