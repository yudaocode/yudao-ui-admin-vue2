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
          <el-descriptions-item label="期数">{{ receivablePlan.period || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ receivablePlan.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="合同编号">{{ receivablePlan.contractNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划回款金额">{{ formatMoney(receivablePlan.price) }}</el-descriptions-item>
          <el-descriptions-item label="计划回款日期">{{ formatDate(receivablePlan.returnTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划回款方式"><dict-tag
            :type="DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE"
            :value="receivablePlan.returnType"
          /></el-descriptions-item>
          <el-descriptions-item label="提前几天提醒">{{ receivablePlan.remindDays == null ? '-' : receivablePlan.remindDays }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ receivablePlan.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实际回款金额">{{ formatMoney(receivablePlan.receivable && receivablePlan.receivable.price || 0) }}</el-descriptions-item>
          <el-descriptions-item label="未回款金额">{{ formatMoney(Number(receivablePlan.price || 0) - Number(receivablePlan.receivable && receivablePlan.receivable.price || 0)) }}</el-descriptions-item>
          <el-descriptions-item label="实际回款日期">{{ formatDate(receivablePlan.receivable && receivablePlan.receivable.returnTime) || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item name="systemInfo">
        <template slot="title"><span class="section-title">系统信息</span></template>
        <el-descriptions
          :column="3"
          border
          size="small"
        >
          <el-descriptions-item label="负责人">{{ receivablePlan.ownerUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ receivablePlan.creatorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(receivablePlan.createTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(receivablePlan.updateTime) || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils'

export default {
  name: 'CrmReceivablePlanDetailsInfo',
  props: { receivablePlan: { type: Object, default: () => ({}) }},
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
