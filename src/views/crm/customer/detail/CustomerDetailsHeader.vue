<template>
  <div
    v-loading="loading"
    class="customer-details-header"
  >
    <div class="header-row">
      <span class="customer-name">{{ customer.name || '-' }}</span>
      <div class="header-actions"><slot /></div>
    </div>
    <el-card shadow="never">
      <el-descriptions
        :column="4"
        direction="vertical"
        border
      >
        <el-descriptions-item label="客户级别">
          <dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
            :value="customer.level"
          />
        </el-descriptions-item>
        <el-descriptions-item label="成交状态">
          {{ customer.dealStatus ? '已成交' : '未成交' }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">{{ customer.ownerUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(customer.createTime) || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'CrmCustomerDetailsHeader',
  props: {
    customer: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false }
  },
  data() {
    return { DICT_TYPE }
  }
}
</script>

<style scoped>
.customer-details-header { margin-bottom: 16px; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.customer-name { color: #303133; font-size: 20px; font-weight: 600; }
.header-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.header-actions ::v-deep .el-button + .el-button { margin-left: 0; }
</style>
