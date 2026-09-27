<template>
  <el-card
    shadow="never"
    class="customer-details-info"
  >
    <el-collapse v-model="activeNames">
      <el-collapse-item name="basicInfo">
        <template slot="title"><span class="section-title">基本信息</span></template>
        <el-descriptions
          :column="4"
          border
        >
          <el-descriptions-item label="客户名称">{{ customer.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户来源">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
              :value="customer.source"
            />
          </el-descriptions-item>
          <el-descriptions-item label="手机">{{ customer.mobile || '-' }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ customer.telephone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ customer.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地址">
            {{ formatAddress(customer.areaName, customer.detailAddress) }}
          </el-descriptions-item>
          <el-descriptions-item label="QQ">{{ customer.qq || '-' }}</el-descriptions-item>
          <el-descriptions-item label="微信">{{ customer.wechat || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户行业">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_INDUSTRY"
              :value="customer.industryId"
            />
          </el-descriptions-item>
          <el-descriptions-item label="客户级别">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
              :value="customer.level"
            />
          </el-descriptions-item>
          <el-descriptions-item label="下次联系时间">
            {{ parseTime(customer.contactNextTime) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ customer.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item name="systemInfo">
        <template slot="title"><span class="section-title">系统信息</span></template>
        <el-descriptions
          :column="4"
          border
        >
          <el-descriptions-item label="负责人">{{ customer.ownerUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最后跟进记录">
            {{ customer.contactLastContent || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后跟进时间">
            {{ parseTime(customer.contactLastTime) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="锁定状态">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="customer.lockStatus"
            />
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ customer.creatorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ parseTime(customer.createTime) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ parseTime(customer.updateTime) || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'CrmCustomerDetailsInfo',
  props: {
    customer: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      DICT_TYPE,
      activeNames: ['basicInfo', 'systemInfo']
    }
  },
  methods: {
    formatAddress(areaName, detailAddress) {
      const address = [areaName, detailAddress].filter(Boolean).join(' ')
      return address || '-'
    }
  }
}
</script>

<style scoped>
.section-title { color: #303133; font-size: 16px; font-weight: 600; }
</style>
