<template>
  <el-dialog title="详情" :visible.sync="dialogVisible" width="800px" append-to-body>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="日志主键">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item v-if="detailData.traceId" label="链路追踪">{{ detailData.traceId }}</el-descriptions-item>
      <el-descriptions-item label="操作人编号">{{ detailData.userId }}</el-descriptions-item>
      <el-descriptions-item label="操作人名字">{{ detailData.userName }}</el-descriptions-item>
      <el-descriptions-item label="操作人 IP">{{ detailData.userIp }}</el-descriptions-item>
      <el-descriptions-item label="操作人 UA">{{ detailData.userAgent }}</el-descriptions-item>
      <el-descriptions-item label="操作模块">{{ detailData.type }}</el-descriptions-item>
      <el-descriptions-item label="操作名">{{ detailData.subType }}</el-descriptions-item>
      <el-descriptions-item label="操作内容">{{ detailData.action }}</el-descriptions-item>
      <el-descriptions-item v-if="detailData.extra" label="操作拓展参数">{{ detailData.extra }}</el-descriptions-item>
      <el-descriptions-item label="请求 URL">{{ detailData.requestMethod }} {{ detailData.requestUrl }}</el-descriptions-item>
      <el-descriptions-item label="操作时间">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="业务编号">{{ detailData.bizId }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
<script>
export default { name: 'SystemOperateLogDetail', data() { return { dialogVisible: false, detailData: {} } }, methods: { open(data) { this.detailData = Object.assign({}, data || {}); this.dialogVisible = true } } }
</script>
