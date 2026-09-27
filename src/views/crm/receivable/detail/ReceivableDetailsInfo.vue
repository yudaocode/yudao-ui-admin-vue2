<template>
  <el-card shadow="never">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="basicInfo">
        <template slot="title"><span class="section-title">基本信息</span></template>
        <el-descriptions
          :column="3"
          border
          size="small"
        >
          <el-descriptions-item label="回款编号">{{ receivable.no || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ receivable.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="合同编号">{{ (receivable.contract && receivable.contract.no) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="回款日期">{{ formatDate(receivable.returnTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="回款金额">{{ formatMoney(receivable.price) }}</el-descriptions-item>
          <el-descriptions-item label="回款方式"><dict-tag
            :type="DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE"
            :value="receivable.returnType"
          /></el-descriptions-item>
          <el-descriptions-item label="备注">{{ receivable.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item name="systemInfo">
        <template slot="title"><span class="section-title">系统信息</span></template>
        <el-descriptions
          :column="3"
          border
          size="small"
        >
          <el-descriptions-item label="负责人">{{ receivable.ownerUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ receivable.creatorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(receivable.createTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(receivable.updateTime) || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils'

export default {
  name: 'CrmReceivableDetailsInfo',
  props: { receivable: { type: Object, default: () => ({}) }},
  data() { return { DICT_TYPE, activeNames: ['basicInfo', 'systemInfo'] } },
  methods: {
    formatDate,
    formatMoney(value) { const number = Number(value); return Number.isFinite(number) ? number.toFixed(2) : '-' }
  }
}
</script>

<style scoped>
.section-title { font-weight: 600; }
</style>
