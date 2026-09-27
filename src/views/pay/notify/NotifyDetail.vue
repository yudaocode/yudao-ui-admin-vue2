<template>
  <el-dialog
    title="通知详情"
    :visible.sync="dialogVisible"
    width="700px"
    append-to-body
    v-dialogDrag
  >
    <div v-loading="detailLoading">
      <el-descriptions :column="2" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="通知状态" :span="2">
          <dict-tag v-if="hasValue(detailData.status)" :type="DICT_TYPE.PAY_NOTIFY_STATUS" :value="detailData.status" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="商户订单编号" :span="2">
          <el-tag>{{ detailData.merchantOrderId || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.merchantRefundId" label="商户退款编号" :span="2">
          <el-tag>{{ detailData.merchantRefundId }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.merchantTransferId" label="商户转账编号" :span="2">
          <el-tag>{{ detailData.merchantTransferId }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用编号">{{ detailData.appId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ detailData.appName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联编号">{{ detailData.dataId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="通知类型">
          <dict-tag v-if="hasValue(detailData.type)" :type="DICT_TYPE.PAY_NOTIFY_TYPE" :value="detailData.type" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="通知次数">{{ detailData.notifyTimes == null ? '-' : detailData.notifyTimes }}</el-descriptions-item>
        <el-descriptions-item label="最大通知次数">{{ detailData.maxNotifyTimes == null ? '-' : detailData.maxNotifyTimes }}</el-descriptions-item>
        <el-descriptions-item label="最后通知时间">{{ parseTime(detailData.lastExecuteTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下次通知时间">{{ parseTime(detailData.nextNotifyTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailData.updateTime) || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />
      <el-descriptions :column="1" border size="small" direction="vertical">
        <el-descriptions-item label="回调日志">
          <el-table :data="detailData.logs || []">
            <el-table-column label="日志编号" align="center" prop="id" />
            <el-table-column label="通知状态" align="center" prop="status">
              <template v-slot="scope">
                <dict-tag :type="DICT_TYPE.PAY_NOTIFY_STATUS" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="通知次数" align="center" prop="notifyTimes" />
            <el-table-column label="通知时间" align="center" prop="lastExecuteTime" width="180">
              <template v-slot="scope">
                <span>{{ parseTime(scope.row.createTime) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="响应结果" align="center" prop="response" />
          </el-table>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getNotifyTaskDetail } from '@/api/pay/notify'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'PayNotifyDetail',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      detailLoading: false,
      detailData: { logs: [] }
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.detailLoading = true
      return getNotifyTaskDetail(id).then((response) => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    },
    hasValue(value) {
      return value !== undefined && value !== null
    }
  }
}
</script>

<style scoped>
::v-deep .desc-label {
  font-weight: bold;
}
</style>
