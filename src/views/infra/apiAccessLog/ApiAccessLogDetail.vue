<template>
  <el-dialog title="API 访问日志详细" :visible.sync="visible" width="800px" append-to-body>
    <el-descriptions v-loading="loading" :column="1" border size="small">
      <el-descriptions-item label="日志主键">{{ detailData.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="链路追踪">{{ detailData.traceId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="应用名">{{ detailData.applicationName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="用户信息">
        {{ detailData.userId || '-' }}
        <dict-tag :type="DICT_TYPE.USER_TYPE" :value="detailData.userType" />
      </el-descriptions-item>
      <el-descriptions-item label="用户 IP">{{ detailData.userIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="用户 UA">{{ detailData.userAgent || '-' }}</el-descriptions-item>
      <el-descriptions-item label="请求信息">
        {{ detailData.requestMethod || '-' }} {{ detailData.requestUrl || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="请求参数">{{ detailData.requestParams || '-' }}</el-descriptions-item>
      <el-descriptions-item label="请求结果">{{ detailData.responseBody || '-' }}</el-descriptions-item>
      <el-descriptions-item label="请求时间">
        {{ parseTime(detailData.beginTime) || '-' }} ~ {{ parseTime(detailData.endTime) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="请求耗时">{{ detailData.duration == null ? '-' : detailData.duration + ' ms' }}</el-descriptions-item>
      <el-descriptions-item label="操作结果">
        <span v-if="detailData.resultCode === 0">正常</span>
        <span v-else-if="detailData.resultCode != null">失败 | {{ detailData.resultCode }} | {{ detailData.resultMsg || '-' }}</span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="操作模块">{{ detailData.operateModule || '-' }}</el-descriptions-item>
      <el-descriptions-item label="操作名">{{ detailData.operateName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="操作类型">
        <dict-tag :type="DICT_TYPE.INFRA_OPERATE_TYPE" :value="detailData.operateType" />
      </el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'ApiAccessLogDetail',
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
