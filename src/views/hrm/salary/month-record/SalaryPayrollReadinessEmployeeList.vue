<template>
  <el-table
    :data="list || []"
    max-height="480"
  >
    <el-table-column
      label="员工姓名"
      min-width="130"
      prop="employeeName"
    />
    <el-table-column
      label="工号"
      prop="jobNumber"
      width="120"
    />
    <el-table-column
      label="部门"
      min-width="130"
      prop="deptName"
    />
    <el-table-column
      label="岗位"
      min-width="130"
      prop="postName"
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
      :formatter="dateFormatter"
      align="center"
      label="入职日期"
      prop="entryTime"
      width="110"
    />
  </el-table>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'

export default {
  name: 'HrmSalaryPayrollReadinessEmployeeList',
  props: { list: { type: Array, default: undefined }},
  data() { return { DICT_TYPE } },
  methods: { dateFormatter }
}
</script>
