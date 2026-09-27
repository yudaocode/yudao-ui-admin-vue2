<template>
  <div class="business-detail-header">
    <div class="header-row"><span class="business-name">{{ business.name || '-' }}</span><div><slot /></div></div>
    <el-descriptions
      :column="5"
      direction="vertical"
      border
    >
      <el-descriptions-item label="客户名称">{{ business.customerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="商机金额（元）">{{ formatPrice(business.totalPrice) }}</el-descriptions-item>
      <el-descriptions-item label="商机组">{{ business.statusTypeName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ business.ownerUserName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ parseTime(business.createTime) || '-' }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script>
export default {
  name: 'CrmBusinessDetailsHeader',
  props: { business: { type: Object, default: () => ({}) }},
  methods: { formatPrice(value) { return value === undefined || value === null ? '-' : Number(value).toFixed(2) } }
}
</script>
<style scoped>
.header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.business-name { color: #303133; font-size: 20px; font-weight: 600; }
</style>
