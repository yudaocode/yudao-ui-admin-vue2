<template>
  <el-dialog
    title="退款订单详情"
    :visible.sync="dialogVisible"
    width="700px"
    append-to-body
    v-dialogDrag
  >
    <div v-loading="detailLoading">
      <el-descriptions :column="2" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="商户退款单号">
          <el-tag size="small">{{ refundDetail.merchantRefundId || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="渠道退款单号">
          <el-tag v-if="refundDetail.channelRefundNo" type="success" size="small">{{ refundDetail.channelRefundNo }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="商户支付单号">
          <el-tag size="small">{{ refundDetail.merchantOrderId || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="渠道支付单号">
          <el-tag v-if="refundDetail.channelOrderNo" type="success" size="small">{{ refundDetail.channelOrderNo }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="应用编号">{{ refundDetail.appId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ refundDetail.appName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">
          <el-tag type="success" size="small">{{ formatAmount(refundDetail.payPrice) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="退款金额">
          <el-tag type="danger" size="small">{{ formatAmount(refundDetail.refundPrice) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="退款状态">
          <dict-tag v-if="refundDetail.status !== undefined && refundDetail.status !== null" :type="DICT_TYPE.PAY_REFUND_STATUS" :value="refundDetail.status" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="退款时间">{{ parseTime(refundDetail.successTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(refundDetail.createTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(refundDetail.updateTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付订单商品" :span="2">
          {{ refundDetail.order && refundDetail.order.subject ? refundDetail.order.subject : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />
      <el-descriptions :column="2" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="退款渠道">
          <dict-tag v-if="refundDetail.channelCode" :type="DICT_TYPE.PAY_CHANNEL_CODE" :value="refundDetail.channelCode" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="退款原因">{{ refundDetail.reason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款 IP">{{ refundDetail.userIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="通知 URL">{{ refundDetail.notifyUrl || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />
      <el-descriptions :column="2" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="渠道错误码">{{ refundDetail.channelErrorCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="渠道错误码描述">{{ refundDetail.channelErrorMsg || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="支付通道异步回调内容">
          <pre class="notify-data">{{ refundDetail.channelNotifyData || '-' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>
</template>

<script>
import { getRefund } from '@/api/pay/refund'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'PayRefundDetail',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      detailLoading: false,
      refundDetail: {}
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.detailLoading = true
      return getRefund(id).then((response) => {
        this.refundDetail = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    },
    formatAmount(value) {
      if (value === undefined || value === null || value === '') return '-'
      const amount = Number(value)
      return Number.isFinite(amount) ? '￥' + (amount / 100).toFixed(2) : '-'
    }
  }
}
</script>

<style scoped>
::v-deep .desc-label {
  font-weight: bold;
}

.notify-data {
  margin: 0;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
