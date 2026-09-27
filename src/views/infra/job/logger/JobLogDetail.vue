<template>
  <el-dialog title="任务详细" :visible.sync="dialogVisible" width="700px" append-to-body>
    <el-descriptions v-loading="detailLoading" :column="1" border size="small">
      <el-descriptions-item label="日志编号">{{ detailData.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="任务编号">{{ detailData.jobId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="处理器的名字">{{ detailData.handlerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="处理器的参数">{{ detailData.handlerParam || '-' }}</el-descriptions-item>
      <el-descriptions-item label="第几次执行">{{ detailData.executeIndex || '-' }}</el-descriptions-item>
      <el-descriptions-item label="执行时间">{{ parseTime(detailData.beginTime) || '-' }} ~ {{ parseTime(detailData.endTime) || '-' }}</el-descriptions-item>
      <el-descriptions-item label="执行时长">{{ detailData.duration == null ? '-' : detailData.duration + ' 毫秒' }}</el-descriptions-item>
      <el-descriptions-item label="任务状态"><dict-tag :type="DICT_TYPE.INFRA_JOB_LOG_STATUS" :value="detailData.status" /></el-descriptions-item>
      <el-descriptions-item label="执行结果">{{ detailData.result || '-' }}</el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer"><el-button @click="dialogVisible = false">关 闭</el-button></div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getJobLog } from '@/api/infra/jobLog'

export default {
  name: 'InfraJobLogDetail',
  data() { return { DICT_TYPE, dialogVisible: false, detailLoading: false, detailData: {}} },
  methods: {
    open(id) {
      this.dialogVisible = true
      if (id === undefined || id === null) return
      this.detailLoading = true
      return getJobLog(id).then(response => { this.detailData = response.data }).finally(() => { this.detailLoading = false })
    }
  }
}
</script>
