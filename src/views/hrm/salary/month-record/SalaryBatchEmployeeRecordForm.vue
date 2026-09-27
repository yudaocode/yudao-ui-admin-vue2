<template>
  <el-dialog
    title="在线编辑工资"
    :visible.sync="dialogVisible"
    :before-close="handleBeforeClose"
    :close-on-click-modal="false"
    width="calc(100vw - 32px)"
    append-to-body
  >
    <el-table
      v-loading="loading"
      :data="list"
      border
      height="calc(100vh - 300px)"
    >
      <el-table-column
        fixed="left"
        label="员工姓名"
        min-width="130"
        prop="employeeName"
      />
      <el-table-column
        fixed="left"
        label="工号"
        prop="jobNumber"
        width="120"
      />
      <el-table-column
        fixed="left"
        label="部门"
        min-width="130"
        prop="deptName"
      />
      <el-table-column
        fixed="left"
        label="岗位"
        min-width="130"
        prop="postName"
      />
      <el-table-column
        v-for="option in editableOptions"
        :key="option.code"
        :label="option.name"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <el-input-number
            :value="getSalaryOptionValue(scope.row, option.code)"
            :controls="false"
            :max="100000000"
            :min="0"
            :precision="2"
            class="full-width"
            @change="updateSalaryOptionValue(scope.row, option.code, $event)"
          />
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button
        :disabled="loading || editedEmployeeIdSet.size === 0"
        type="primary"
        @click="submitForm"
      >保 存</el-button>
      <el-button @click="handleCancel">放弃编辑</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getSalaryMonthEmployeeRecordList, updateSalaryMonthEmployeeRecordList } from '@/api/hrm/salary/month-record/employee'
import { HRM_SALARY_COMPUTED_OPTION_CODES } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmSalaryBatchEmployeeRecordForm',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      edited: false,
      editedEmployeeIdSet: new Set(),
      list: [],
      editableOptions: []
    }
  },
  methods: {
    async open(record, queryParams) {
      if (!record.id) return
      this.dialogVisible = true
      this.loading = true
      try {
        const response = await getSalaryMonthEmployeeRecordList({
          employeeChangeType: queryParams.employeeChangeType,
          employeeName: queryParams.employeeName,
          jobNumber: queryParams.jobNumber,
          deptId: queryParams.deptId,
          monthRecordId: record.id
        })
        this.list = response.data
        this.editableOptions = this.getLeafOptions(record.optionHeaders)
          .filter(option => !HRM_SALARY_COMPUTED_OPTION_CODES.has(option.code))
        this.edited = false
        this.editedEmployeeIdSet = new Set()
      } finally {
        this.loading = false
      }
    },
    getLeafOptions(options) {
      const result = []
      const append = values => {
        (values || []).forEach(option => {
          if (option.children && option.children.length) append(option.children)
          else result.push(option)
        })
      }
      append(options)
      return result
    },
    getSalaryOptionValue(record, optionCode) {
      const option = (record.optionValues || []).find(item => item.code === optionCode)
      return Number((option && option.value) || 0)
    },
    updateSalaryOptionValue(record, optionCode, value) {
      const optionValue = (record.optionValues || []).find(option => option.code === optionCode)
      if (optionValue) {
        optionValue.value = Number(value || 0)
      } else {
        record.optionValues = [
          ...(record.optionValues || []),
          { code: optionCode, value: Number(value || 0) }
        ]
      }
      this.handleOptionChange(record.id)
    },
    handleOptionChange(employeeRecordId) {
      if (!employeeRecordId) return
      this.editedEmployeeIdSet.add(employeeRecordId)
      this.editedEmployeeIdSet = new Set(this.editedEmployeeIdSet)
      this.edited = true
    },
    async handleBeforeClose(done) {
      if (!this.edited) {
        done()
        return
      }
      try {
        await this.$modal.confirm('当前修改尚未保存，确定放弃编辑吗？')
        this.edited = false
        done()
      } catch (error) {}
    },
    async handleCancel() {
      if (!this.edited) {
        this.dialogVisible = false
        return
      }
      try {
        await this.$modal.confirm('当前修改尚未保存，确定放弃编辑吗？')
        this.edited = false
        this.dialogVisible = false
      } catch (error) {}
    },
    async submitForm() {
      this.loading = true
      try {
        await updateSalaryMonthEmployeeRecordList(this.list
          .filter(item => item.id && this.editedEmployeeIdSet.has(item.id))
          .map(item => ({ id: item.id, optionValues: item.optionValues || [] })))
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        this.edited = false
        this.editedEmployeeIdSet = new Set()
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
