<template>
  <div class="app-container">
    <doc-alert
      title="【客户】客户管理、公海客户"
      url="https://doc.iocoder.cn/crm/customer/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />

    <el-card shadow="never">
      <el-tabs>
        <el-tab-pane label="拥有客户数限制">
          <customer-limit-config-list :conf-type="LimitConfType.CUSTOMER_QUANTITY_LIMIT" />
        </el-tab-pane>
        <el-tab-pane label="锁定客户数限制">
          <customer-limit-config-list :conf-type="LimitConfType.CUSTOMER_LOCK_LIMIT" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { LimitConfType } from '@/api/crm/customer/limitConfig'
import CustomerLimitConfigList from './CustomerLimitConfigList.vue'

export default {
  name: 'CrmCustomerLimitConfig',
  components: { CustomerLimitConfigList },
  data() {
    return { LimitConfType }
  }
}
</script>
