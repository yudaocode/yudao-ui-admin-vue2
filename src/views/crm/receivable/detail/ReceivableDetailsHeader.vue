<template>
  <div
    v-loading="loading"
    class="receivable-header"
  >
    <div class="header-main"><span class="title">{{ receivable.no || '回款详情' }}</span><div><slot /></div></div>
    <el-card
      shadow="never"
      class="summary-card"
    >
      <el-descriptions
        :column="5"
        border
        size="small"
      >
        <el-descriptions-item label="客户名称">{{ receivable.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="合同金额">{{ formatMoney(receivable.contract && receivable.contract.totalPrice) }}</el-descriptions-item>
        <el-descriptions-item label="回款日期">{{ formatDate(receivable.returnTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="回款金额">{{ formatMoney(receivable.price) }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ receivable.ownerUserName || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { formatDate } from '@/utils'

export default {
  name: 'CrmReceivableDetailsHeader',
  props: { receivable: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false }},
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
