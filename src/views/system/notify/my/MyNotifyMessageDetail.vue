<template>
  <el-dialog title="消息详情" :visible.sync="dialogVisible" width="700px" append-to-body>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="发送人">{{ detailData.templateNickname }}</el-descriptions-item>
      <el-descriptions-item label="发送时间">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="消息类型"><dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="detailData.templateType" /></el-descriptions-item>
      <el-descriptions-item label="是否已读"><dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="detailData.readStatus" /></el-descriptions-item>
      <el-descriptions-item v-if="detailData.readStatus" label="阅读时间">{{ parseTime(detailData.readTime) }}</el-descriptions-item>
      <el-descriptions-item label="内容">{{ detailData.templateContent }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
export default { name: 'MyNotifyMessageDetailDetail', data() { return { DICT_TYPE, dialogVisible: false, detailData: {} } }, methods: { open(data) { this.detailData = Object.assign({}, data || {}); this.dialogVisible = true } } }
</script>
