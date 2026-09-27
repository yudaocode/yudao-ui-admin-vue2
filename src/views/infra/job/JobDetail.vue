<template>
  <el-dialog title="任务详细" :visible.sync="dialogVisible" width="700px" append-to-body>
    <el-descriptions v-loading="detailLoading" :column="1" border size="small">
      <el-descriptions-item label="任务编号">{{ detailData.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="任务名称">{{ detailData.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="任务状态"><dict-tag :type="DICT_TYPE.INFRA_JOB_STATUS" :value="detailData.status" /></el-descriptions-item>
      <el-descriptions-item label="处理器的名字">{{ detailData.handlerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="处理器的参数">{{ detailData.handlerParam || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Cron 表达式">{{ detailData.cronExpression || '-' }}</el-descriptions-item>
      <el-descriptions-item label="重试次数">{{ detailData.retryCount == null ? '-' : detailData.retryCount }}</el-descriptions-item>
      <el-descriptions-item label="重试间隔">{{ detailData.retryInterval == null ? '-' : detailData.retryInterval + ' 毫秒' }}</el-descriptions-item>
      <el-descriptions-item label="监控超时时间">{{ detailData.monitorTimeout > 0 ? detailData.monitorTimeout + ' 毫秒' : '未开启' }}</el-descriptions-item>
      <el-descriptions-item label="后续执行时间">
        <el-timeline><el-timeline-item v-for="(time, index) in nextTimes" :key="index" :timestamp="parseTime(time)">第 {{ index + 1 }} 次</el-timeline-item></el-timeline>
      </el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer"><el-button @click="dialogVisible = false">关 闭</el-button></div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { getJob, getJobNextTimes } from '@/api/infra/job'

export default {
  name: 'InfraJobDetail',
  data() { return { DICT_TYPE, dialogVisible: false, detailLoading: false, detailData: {}, nextTimes: [] } },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.detailData = {}
      this.nextTimes = []
      if (id === undefined || id === null) return
      this.detailLoading = true
      Promise.all([getJob(id), getJobNextTimes(id)]).then(([job, times]) => {
        this.detailData = job.data
        this.nextTimes = times.data
      }).finally(() => { this.detailLoading = false })
    }
  }
}
</script>
