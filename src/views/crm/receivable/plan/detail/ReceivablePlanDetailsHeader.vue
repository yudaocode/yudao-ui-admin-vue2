<template>
  <div
    v-loading="loading"
    class="receivable-plan-header"
  >
    <div class="header-main"><span class="title">第 {{ receivablePlan.period || '-' }} 期</span><div><slot /></div></div>
    <el-card
      shadow="never"
      class="summary-card"
    >
      <el-descriptions
        :column="5"
        border
        size="small"
      >
        <el-descriptions-item label="客户名称">{{ receivablePlan.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{ receivablePlan.contractNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划回款金额">{{ formatMoney(receivablePlan.price) }}</el-descriptions-item>
        <el-descriptions-item label="计划回款日期">{{ formatDate(receivablePlan.returnTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="实际回款金额">{{ formatMoney(receivablePlan.receivable && receivablePlan.receivable.price || 0) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { formatDate } from '@/utils'

export default {
  name: 'CrmReceivablePlanDetailsHeader',
  props: { receivablePlan: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false }},
  methods: {
    formatDate,
    formatMoney(value) { const number = Number(value); return Number.isFinite(number) ? number.toFixed(2) : '-' }
  }
}
</script>

<style scoped>
.header-main { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { font-size: 20px; font-weight: 600; }
.summary-card { margin-bottom: 12px; }
</style>
