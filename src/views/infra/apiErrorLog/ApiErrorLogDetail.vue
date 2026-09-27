<template>
  <el-dialog title="API 异常日志详细" :visible.sync="visible" width="800px" append-to-body>
    <el-descriptions v-loading="loading" :column="1" border size="small">
      <el-descriptions-item label="日志主键">{{ detailData.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="链路追踪">{{ detailData.traceId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="应用名">{{ detailData.applicationName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="用户编号">
        {{ detailData.userId || '-' }}
        <dict-tag :type="DICT_TYPE.USER_TYPE" :value="detailData.userType" />
      </el-descriptions-item>
      <el-descriptions-item label="用户 IP">{{ detailData.userIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="用户 UA">{{ detailData.userAgent || '-' }}</el-descriptions-item>
      <el-descriptions-item label="请求信息">
        {{ detailData.requestMethod || '-' }} {{ detailData.requestUrl || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="请求参数">{{ detailData.requestParams || '-' }}</el-descriptions-item>
      <el-descriptions-item label="异常时间">{{ parseTime(detailData.exceptionTime) || '-' }}</el-descriptions-item>
      <el-descriptions-item label="异常名">{{ detailData.exceptionName || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="detailData.exceptionStackTrace" label="异常堆栈">
        <el-input v-model="detailData.exceptionStackTrace" type="textarea" :autosize="{ maxRows: 20 }" readonly />
      </el-descriptions-item>
      <el-descriptions-item label="处理状态">
        <dict-tag :type="DICT_TYPE.INFRA_API_ERROR_LOG_PROCESS_STATUS" :value="detailData.processStatus" />
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.processUserId" label="处理人">{{ detailData.processUserId }}</el-descriptions-item>
      <el-descriptions-item v-if="detailData.processTime" label="处理时间">{{ parseTime(detailData.processTime) }}</el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'ApiErrorLogDetail',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      detailData: {}
    }
  },
  methods: {
    open(data) {
      this.visible = true
      this.loading = true
      this.detailData = Object.assign({}, data || {})
      this.$nextTick(() => { this.loading = false })
    }
  }
}
</script>
