<template>
  <el-dialog
    title="转账单详情"
    :visible.sync="visible"
    width="700px"
    append-to-body
    v-dialogDrag
  >
    <div v-loading="loading">
      <el-descriptions :column="2" label-class-name="desc-label">
        <el-descriptions-item label="商户单号">
          <el-tag size="small">{{ detailData.merchantTransferId }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="转账单号">
          <el-tag v-if="detailData.no" type="warning" size="small">{{ detailData.no }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用编号">{{ detailData.appId }}</el-descriptions-item>
        <el-descriptions-item label="转账状态">
          <dict-tag
            v-if="detailData.status !== undefined && detailData.status !== null"
            :type="DICT_TYPE.PAY_TRANSFER_STATUS"
            :value="detailData.status"
          />
        </el-descriptions-item>
        <el-descriptions-item label="转账金额">
          <el-tag type="success" size="small">￥{{ formatPrice(detailData.price) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="转账时间">{{ parseTime(detailData.successTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions :column="2" label-class-name="desc-label">
        <el-descriptions-item label="收款人姓名">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="收款人账号">{{ detailData.userAccount }}</el-descriptions-item>
        <el-descriptions-item label="支付渠道">
          <dict-tag
            v-if="detailData.channelCode"
            :type="DICT_TYPE.PAY_CHANNEL_CODE"
            :value="detailData.channelCode"
          />
        </el-descriptions-item>
        <el-descriptions-item label="支付 IP">{{ detailData.userIp }}</el-descriptions-item>
        <el-descriptions-item label="渠道单号">
          <el-tag v-if="detailData.channelTransferNo" type="success" size="small">
            {{ detailData.channelTransferNo }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="通知 URL">{{ detailData.notifyUrl }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions :column="1" label-class-name="desc-label" direction="vertical" border>
        <el-descriptions-item label="转账渠道通知内容">
          <pre class="notify-content">{{ detailData.channelNotifyData }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getTransfer } from '@/api/pay/transfer'

export default {
  name: 'PayTransferDetail',
  data() {
    return {
      visible: false,
      loading: false,
      detailData: {}
    }
  },
  methods: {
    formatPrice(value) {
      const number = Number(value || 0)
      return (number / 100).toFixed(2)
    },
    open(id) {
      this.visible = true
      this.loading = true
      getTransfer(id).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>
.desc-label {
  font-weight: bold;
}

.notify-content {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: inherit;
  font-size: 13px;
}
</style>
