<template>
  <div
    v-loading="loading"
    class="clue-header"
  >
    <div class="header-main">
      <span class="title">{{ clue.name || '-' }}</span>
      <div><slot /></div>
    </div>
    <el-card
      shadow="never"
      class="summary-card"
    >
      <el-descriptions
        :column="4"
        size="small"
      >
        <el-descriptions-item label="线索来源"><dict-tag
          :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
          :value="clue.source"
        /></el-descriptions-item>
        <el-descriptions-item label="手机">{{ clue.mobile || '-' }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ clue.ownerUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(clue.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils'

export default {
  name: 'CrmClueDetailsHeader',
  props: {
    clue: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false }
  },
  data() { return { DICT_TYPE } },
  methods: { formatDate }
}
</script>

<style scoped>
.header-main { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { font-size: 20px; font-weight: 600; }
.summary-card { margin-bottom: 12px; }
</style>
