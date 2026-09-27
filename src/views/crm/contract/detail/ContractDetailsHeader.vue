<template>
  <el-card
    shadow="never"
    class="contract-details-header"
  >
    <div class="header-row">
      <div class="contract-name">{{ contract.name || '合同详情' }}</div>
      <div><slot /></div>
    </div>
    <el-descriptions
      :column="5"
      direction="vertical"
      border
    >
      <el-descriptions-item label="客户名称">{{ contract.customerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="合同金额（元）">{{ erpPriceInputFormatter(contract.totalPrice) }}</el-descriptions-item>
      <el-descriptions-item label="下单时间">{{ formatDate(contract.orderDate) }}</el-descriptions-item>
      <el-descriptions-item label="回款金额（元）">{{ erpPriceInputFormatter(contract.totalReceivablePrice) }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ contract.ownerUserName || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import { erpPriceInputFormatter } from '@/utils'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'ContractDetailsHeader',
  props: { contract: { type: Object, default: () => ({}) }},
  methods: { erpPriceInputFormatter, formatDate }
}
</script>

<style scoped>
.contract-details-header { margin-bottom: 16px; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.contract-name { font-size: 20px; font-weight: 600; }
</style>
