<template>
  <el-card shadow="never"><div slot="header">基本信息</div><el-descriptions
    :column="4"
    border
  ><el-descriptions-item label="商机名称">{{ business.name || '-' }}</el-descriptions-item><el-descriptions-item label="客户名称">{{ business.customerName || '-' }}</el-descriptions-item><el-descriptions-item label="商机金额（元）">{{ formatPrice(business.totalPrice) }}</el-descriptions-item><el-descriptions-item label="预计成交日期">{{ parseTime(business.dealTime) || '-' }}</el-descriptions-item><el-descriptions-item label="下次联系时间">{{ parseTime(business.contactNextTime) || '-' }}</el-descriptions-item><el-descriptions-item label="商机状态组">{{ business.statusTypeName || '-' }}</el-descriptions-item><el-descriptions-item label="商机阶段">{{ business.statusName || '-' }}</el-descriptions-item><el-descriptions-item label="备注">{{ business.remark || '-' }}</el-descriptions-item></el-descriptions><div class="system-title">系统信息</div><el-descriptions
    :column="4"
    border
  ><el-descriptions-item label="负责人">{{ business.ownerUserName || '-' }}</el-descriptions-item><el-descriptions-item label="最后跟进时间">{{ parseTime(business.contactLastTime) || '-' }}</el-descriptions-item><el-descriptions-item label="创建人">{{ business.creatorName || '-' }}</el-descriptions-item><el-descriptions-item label="创建时间">{{ parseTime(business.createTime) || '-' }}</el-descriptions-item><el-descriptions-item label="更新时间">{{ parseTime(business.updateTime) || '-' }}</el-descriptions-item></el-descriptions></el-card>
</template>
<script>
export default { name: 'CrmBusinessDetailsInfo', props: { business: { type: Object, default: () => ({}) }}, methods: { formatPrice(value) { return value === undefined || value === null ? '-' : Number(value).toFixed(2) } }}
</script>
<style scoped>.system-title { margin: 20px 0 12px; color: #303133; font-size: 16px; font-weight: 600; }</style>
