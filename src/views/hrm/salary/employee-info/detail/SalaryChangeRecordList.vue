<template>
  <el-card shadow="never">
    <el-table
      v-loading="loading"
      :data="recordList"
      stripe
    >
      <el-table-column
        align="center"
        label="类型"
        prop="recordType"
        width="90"
      >
        <template slot-scope="scope">
          {{ scope.row.recordType === HrmSalaryRecordType.FIXED ? '定薪' : '调薪' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="调整原因"
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
        :formatter="dateFormatter2"
        align="center"
        label="生效日期"
        prop="effectTime"
        width="120"
      />
      <el-table-column
        align="right"
        label="正式调整前"
        width="120"
      >
        <template slot-scope="scope">{{ formatHrmMoney(scope.row.beforeTotal) }}</template>
      </el-table-column>
      <el-table-column
        align="right"
        label="正式调整后"
        width="120"
      >
        <template slot-scope="scope">{{ formatHrmMoney(scope.row.afterTotal) }}</template>
      </el-table-column>
      <el-table-column
        align="right"
        label="试用调整前"
        width="120"
      >
        <template slot-scope="scope">{{ formatHrmMoney(scope.row.probationBeforeTotal) }}</template>
      </el-table-column>
      <el-table-column
        align="right"
        label="试用调整后"
        width="120"
      >
        <template slot-scope="scope">{{ formatHrmMoney(scope.row.probationAfterTotal) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="状态"
        prop="status"
        width="110"
      >
        <template slot-scope="scope">
          <dict-tag
            v-if="scope.row.status != null"
            :type="DICT_TYPE.HRM_SALARY_CHANGE_RECORD_STATUS"
            :value="scope.row.status"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        min-width="160"
        prop="remark"
      />
      <el-table-column
        align="center"
        fixed="right"
        label="操作"
        width="176"
      >
        <template slot-scope="scope">
          <el-button
            v-if="canEditRecord(scope.row)"
            v-hasPermi="['hrm:salary:employee-info:update']"
            type="text"
            @click="$emit('edit', scope.row)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === HrmSalaryChangeRecordStatus.PENDING"
            v-hasPermi="['hrm:salary:employee-info:update']"
            type="text"
            class="warning-text"
            @click="handleCancel(scope.row.id)"
          >取消</el-button>
          <el-button
            v-if="scope.row.status !== HrmSalaryChangeRecordStatus.EFFECTIVE"
            v-hasPermi="['hrm:salary:change-record:delete']"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import {
  cancelSalaryChangeRecord,
  deleteSalaryChangeRecord,
  getSalaryChangeRecordList
} from '@/api/hrm/salary/change-record'
import { HrmSalaryChangeRecordStatus, HrmSalaryRecordType } from '@/views/hrm/utils/constants'
import { formatHrmMoney } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalaryChangeRecordList',
  props: { employeeId: { type: Number, required: true }},
  data() {
    return {
      DICT_TYPE,
      HrmSalaryChangeRecordStatus,
      HrmSalaryRecordType,
      loading: false,
      recordList: []
    }
  },
  created() { this.getList() },
  methods: {
    dateFormatter2,
    formatHrmMoney,
    async getList() {
      this.loading = true
      try {
        const response = await getSalaryChangeRecordList(this.employeeId)
        this.recordList = response.data
      } finally {
        this.loading = false
      }
    },
    canEditRecord(record) {
      if (record.recordType !== HrmSalaryRecordType.FIXED) {
        return record.status !== HrmSalaryChangeRecordStatus.EFFECTIVE
      }
      return !this.recordList.some(item =>
        item.recordType === HrmSalaryRecordType.CHANGE &&
        item.status !== HrmSalaryChangeRecordStatus.CANCELLED
      )
    },
    async handleCancel(recordId) {
      if (!recordId) return
      try {
        await this.$modal.confirm('确认取消该待生效的薪资调整吗？')
        await cancelSalaryChangeRecord(recordId)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        await this.getList()
        this.$emit('change')
      } catch (error) {}
    },
    async handleDelete(recordId) {
      if (!recordId) return
      try {
        await this.$modal.confirm()
        await deleteSalaryChangeRecord(recordId)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
        this.$emit('change')
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.warning-text { color: #e6a23c; }
.danger-text { color: #f56c6c; }
</style>
