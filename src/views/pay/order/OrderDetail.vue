<template>
  <el-dialog
    title="订单详情"
    :visible.sync="dialogVisible"
    width="700px"
    append-to-body
    v-dialogDrag
  >
    <div v-loading="detailLoading">
      <el-descriptions :column="2" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="商户单号">
          <el-tag size="small">{{ detailData.merchantOrderId || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付单号">
          <el-tag v-if="detailData.no" type="warning" size="small">{{ detailData.no }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="应用编号">{{ detailData.appId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ detailData.appName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <dict-tag v-if="hasValue(detailData.status)" :type="DICT_TYPE.PAY_ORDER_STATUS" :value="detailData.status" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付金额">
          <el-tag type="success" size="small">{{ formatAmount(detailData.price) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="手续费">
          <el-tag type="warning" size="small">{{ formatAmount(detailData.channelFeePrice) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="手续费比例">{{ formatRate(detailData.channelFeeRate) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ parseTime(detailData.successTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="失效时间">{{ parseTime(detailData.expireTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailData.updateTime) || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />
      <el-descriptions :column="2" border size="small" label-class-name="desc-label">
        <el-descriptions-item label="商品标题">{{ detailData.subject || '-' }}</el-descriptions-item>
        <el-descriptions-item label="商品描述">{{ detailData.body || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付渠道">
          <dict-tag v-if="detailData.channelCode" :type="DICT_TYPE.PAY_CHANNEL_CODE" :value="detailData.channelCode" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付 IP">{{ detailData.userIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="渠道单号">
          <el-tag v-if="detailData.channelOrderNo" type="success" size="small">{{ detailData.channelOrderNo }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="渠道用户">{{ detailData.channelUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">
          <el-tag type="danger" size="small">{{ formatAmount(detailData.refundPrice) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="通知 URL">{{ detailData.notifyUrl || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />
      <el-descriptions :column="1" border size="small" label-class-name="desc-label" direction="vertical">
        <el-descriptions-item label="支付通道异步回调内容">
          <pre class="notify-data">{{ detailData.extension && detailData.extension.channelNotifyData || '-' }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getOrderDetail } from '@/api/pay/order'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'PayOrderDetail',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      detailLoading: false,
      detailData: {
        extension: {}
      }
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.detailLoading = true
      return getOrderDetail(id).then((response) => {
        this.detailData = response.data
        if (!this.detailData.extension) this.detailData.extension = {}
      }).finally(() => {
        this.detailLoading = false
      })
    },
    hasValue(value) {
      return value !== undefined && value !== null
    },
    formatAmount(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      return Number.isFinite(number) ? '￥' + (number / 100).toFixed(2) : '-'
    },
    formatRate(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      // PayChannelDO stores feeRate as a percentage (for example, 1.5 = 1.5%).
      return Number.isFinite(number) ? number.toFixed(2) + '%' : '-'
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
