<template>
  <div
    v-loading="loading"
    class="contact-header"
  >
    <div class="header-main"><span class="title">{{ contact.name || '-' }}</span><div><slot /></div></div>
    <el-card shadow="never"><el-descriptions
      :column="4"
      size="small"
    >
      <el-descriptions-item label="客户">{{ contact.customerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="手机">{{ contact.mobile || '-' }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ contact.ownerUserName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(contact.createTime) }}</el-descriptions-item>
    </el-descriptions></el-card>
  </div>
</template>

<script>
import { formatDate } from '@/utils'
export default {
  name: 'CrmContactDetailsHeader',
  props: { contact: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false }},
  methods: { formatDate }
}
</script>
<style scoped>
.header-main { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { font-size: 20px; font-weight: 600; }
</style>
