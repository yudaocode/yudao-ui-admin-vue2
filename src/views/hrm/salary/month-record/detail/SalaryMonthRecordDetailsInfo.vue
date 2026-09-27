<template>
  <el-card
    v-loading="loading"
    shadow="never"
  >
    <el-descriptions
      :column="3"
      border
    >
      <el-descriptions-item label="月份">{{ formatHrmYearMonth(record.year, record.month) }}</el-descriptions-item>
      <el-descriptions-item label="计薪人数">{{ record.employeeCount == null ? 0 : record.employeeCount }}</el-descriptions-item>
      <el-descriptions-item label="应发工资">{{ formatHrmMoney(record.expectedPaySalary) }}</el-descriptions-item>
      <el-descriptions-item label="实发工资">{{ formatHrmMoney(record.realPaySalary) }}</el-descriptions-item>
      <el-descriptions-item label="个人社保">{{ formatHrmMoney(record.personalInsuranceAmount) }}</el-descriptions-item>
      <el-descriptions-item label="个人公积金">{{ formatHrmMoney(record.personalProvidentFundAmount) }}</el-descriptions-item>
      <el-descriptions-item label="个人所得税">{{ formatHrmMoney(record.personalTax) }}</el-descriptions-item>
      <el-descriptions-item label="公司社保">{{ formatHrmMoney(record.corporateInsuranceAmount) }}</el-descriptions-item>
      <el-descriptions-item label="公司公积金">{{ formatHrmMoney(record.corporateProvidentFundAmount) }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import { formatHrmMoney, formatHrmYearMonth } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalaryMonthRecordDetailsInfo',
  props: {
    record: { type: Object, required: true },
    loading: { type: Boolean, required: true }
  },
  methods: { formatHrmMoney, formatHrmYearMonth }
}
</script>
