<template>
  <el-dialog title="详情" :visible.sync="dialogVisible" width="760px" append-to-body>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="编号">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="用户类型"><dict-tag :type="DICT_TYPE.USER_TYPE" :value="detailData.userType" /></el-descriptions-item>
      <el-descriptions-item label="用户编号">{{ detailData.userId }}</el-descriptions-item>
      <el-descriptions-item label="模版编号">{{ detailData.templateId }}</el-descriptions-item>
      <el-descriptions-item label="模板编码">{{ detailData.templateCode }}</el-descriptions-item>
      <el-descriptions-item label="发送人名称">{{ detailData.templateNickname }}</el-descriptions-item>
      <el-descriptions-item label="模版内容">{{ detailData.templateContent }}</el-descriptions-item>
      <el-descriptions-item label="模版参数">{{ detailData.templateParams }}</el-descriptions-item>
      <el-descriptions-item label="模版类型"><dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="detailData.templateType" /></el-descriptions-item>
      <el-descriptions-item label="是否已读"><dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="detailData.readStatus" /></el-descriptions-item>
      <el-descriptions-item label="阅读时间">{{ parseTime(detailData.readTime) }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
export default { name: 'SystemNotifyMessageDetail', data() { return { DICT_TYPE, dialogVisible: false, detailData: {} } }, methods: { open(data) { this.detailData = Object.assign({}, data || {}); this.dialogVisible = true } } }
</script>
