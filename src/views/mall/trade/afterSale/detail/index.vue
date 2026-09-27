<template>
  <div class="app-container trade-after-sale-detail">
    <el-card shadow="never">
      <!-- 订单信息 -->
      <el-descriptions title="订单信息">
        <el-descriptions-item label="订单号: ">{{ formData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="配送方式: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_DELIVERY_TYPE"
            :value="formData.order.deliveryType"
          />
        </el-descriptions-item>
        <el-descriptions-item label="订单类型: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_ORDER_TYPE"
            :value="formData.order.type"
          />
        </el-descriptions-item>
        <el-descriptions-item label="收货人: ">
          {{ formData.order.receiverName }}
        </el-descriptions-item>
        <el-descriptions-item label="买家留言: ">
          {{ formData.order.userRemark }}
        </el-descriptions-item>
        <el-descriptions-item label="订单来源: ">
          <dict-tag
            :type="DICT_TYPE.TERMINAL"
            :value="formData.order.terminal"
          />
        </el-descriptions-item>
        <el-descriptions-item label="联系电话: ">
          {{ formData.order.receiverMobile }}
        </el-descriptions-item>
        <el-descriptions-item label="商家备注: ">{{ formData.order.remark }}</el-descriptions-item>
        <el-descriptions-item label="支付单号: ">
          {{ formData.order.payOrderId }}
        </el-descriptions-item>
        <el-descriptions-item label="付款方式: ">
          <dict-tag
            :type="DICT_TYPE.PAY_CHANNEL_CODE"
            :value="formData.order.payChannelCode"
          />
        </el-descriptions-item>
        <el-descriptions-item label="买家: ">
          {{ formData.user && formData.user.nickname }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 售后信息 -->
      <el-descriptions title="售后信息">
        <el-descriptions-item label="退款编号: ">{{ formData.no }}</el-descriptions-item>
        <el-descriptions-item label="申请时间: ">
          {{ parseTime(formData.auditTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="售后类型: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_AFTER_SALE_TYPE"
            :value="formData.type"
          />
        </el-descriptions-item>
        <el-descriptions-item label="售后方式: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_AFTER_SALE_WAY"
            :value="formData.way"
          />
        </el-descriptions-item>
        <el-descriptions-item label="退款金额: ">
          {{ fenToYuan(formData.refundPrice) }}
        </el-descriptions-item>
        <el-descriptions-item label="退款原因: ">{{ formData.applyReason }}</el-descriptions-item>
        <el-descriptions-item label="补充描述: ">
          {{ formData.applyDescription }}
        </el-descriptions-item>
        <el-descriptions-item label="凭证图片: ">
          <el-image
            v-for="(item, index) in formData.applyPicUrls || []"
            :key="index"
            :src="item"
            :preview-src-list="formData.applyPicUrls || []"
            class="proof-image"
          />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 退款状态 -->
      <el-descriptions
        :column="1"
        title="退款状态"
      >
        <el-descriptions-item label="退款状态: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_AFTER_SALE_STATUS"
            :value="formData.status"
          />
        </el-descriptions-item>
        <el-descriptions-item label-class-name="no-colon">
          <el-button
            v-if="formData.status === 10"
            type="primary"
            @click="agree"
          >同意售后</el-button>
          <el-button
            v-if="formData.status === 10"
            type="primary"
            @click="disagree"
          >拒绝售后</el-button>
          <el-button
            v-if="formData.status === 30"
            type="primary"
            @click="receive"
          >确认收货</el-button>
          <el-button
            v-if="formData.status === 30"
            type="primary"
            @click="refuse"
          >拒绝收货</el-button>
          <el-button
            v-if="formData.status === 40"
            type="primary"
            @click="refund"
          >确认退款</el-button>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"><span class="reminder-label">提醒: </span></template>
          如果未发货，请点击同意退款给买家。<br />
          如果实际已发货，请主动与买家联系。<br />
          如果订单整体退款后，优惠券和余额会退还给买家.
        </el-descriptions-item>
      </el-descriptions>

      <!-- 商品信息 -->
      <el-descriptions title="商品信息">
        <el-descriptions-item label-class-name="no-colon">
          <el-row :gutter="20">
            <el-col :span="15">
              <el-table
                v-if="formData.orderItem"
                :data="[formData.orderItem]"
                border
              >
                <el-table-column
                  label="商品"
                  prop="spuName"
                  width="auto"
                >
                  <template v-slot="{ row }">
                    {{ row.spuName }}
                    <el-tag
                      v-for="property in row.properties"
                      :key="property.propertyId"
                      class="property-tag"
                    >
                      {{ property.propertyName }}: {{ property.valueName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  label="商品原价"
                  prop="price"
                  width="150"
                >
                  <template v-slot="{ row }">{{ fenToYuan(row.price) }} 元</template>
                </el-table-column>
                <el-table-column
                  label="数量"
                  prop="count"
                  width="100"
                />
                <el-table-column
                  label="合计"
                  prop="payPrice"
                  width="150"
                >
                  <template v-slot="{ row }">{{ fenToYuan(row.payPrice) }} 元</template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :span="10" />
          </el-row>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作日志 -->
      <el-descriptions title="售后日志">
        <el-descriptions-item label-class-name="no-colon">
          <el-timeline>
            <el-timeline-item
              v-for="saleLog in formData.logs"
              :key="saleLog.id"
              :timestamp="parseTime(saleLog.createTime)"
              placement="top"
            >
              <div class="el-timeline-right-content">
                <span>{{ saleLog.content }}</span>
              </div>
              <span
                slot="dot"
                :style="{ backgroundColor: getUserTypeColor(saleLog.userType == null ? 0 : saleLog.userType) }"
                class="dot-node-style"
              >
                {{ getUserTypeLabel(saleLog.userType == null ? 0 : saleLog.userType) }}
              </span>
            </el-timeline-item>
          </el-timeline>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 各种操作的弹窗 -->
    <AfterSaleDisagreeForm
      ref="updateAuditReasonForm"
      @success="getDetail"
    />
  </div>
</template>

<script>
import * as AfterSaleApi from '@/api/mall/trade/afterSale'
import { fenToYuan } from '@/utils'
import { DICT_TYPE, getDictData, getDictDataLabel } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import AfterSaleDisagreeForm from '@/views/mall/trade/afterSale/form/AfterSaleDisagreeForm.vue'

export default {
  name: 'TradeAfterSaleDetail',
  components: { AfterSaleDisagreeForm },
  data() {
    return {
      DICT_TYPE,
      formData: {
        order: {},
        logs: []
      }
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    /** 获得 userType 颜色 */
    getUserTypeColor(type) {
      const dict = getDictData(DICT_TYPE.USER_TYPE, type)
      switch (dict && dict.colorType) {
        case 'success':
          return '#67C23A'
        case 'info':
          return '#909399'
        case 'warning':
          return '#E6A23C'
        case 'danger':
          return '#F56C6C'
        default:
          return '#409EFF'
      }
    },
    getUserTypeLabel(type) {
      return getDictDataLabel(DICT_TYPE.USER_TYPE, type)[0] || '系'
    },
    /** 获得详情 */
    getDetail() {
      const id = Number(this.$route.params.id)
      if (!id) return Promise.resolve()
      return AfterSaleApi.getAfterSale(id).then((response) => {
        if (response.data == null) {
          this.$modal.notifyError('售后订单不存在')
          return this.close()
        }
        this.formData = response.data
      })
    },
    /** 同意售后 */
    agree() {
      return this.handleConfirmedAction('是否同意售后？', AfterSaleApi.agree)
    },
    /** 拒绝售后 */
    disagree() {
      this.$refs.updateAuditReasonForm.open(this.formData)
    },
    /** 确认收货 */
    receive() {
      return this.handleConfirmedAction('是否确认收货？', AfterSaleApi.receive)
    },
    /** 拒绝收货 */
    refuse() {
      return this.handleConfirmedAction('是否拒绝收货？', AfterSaleApi.refuse)
    },
    /** 确认退款 */
    refund() {
      return this.handleConfirmedAction('是否确认退款？', AfterSaleApi.refund)
    },
    handleConfirmedAction(message, request) {
      return this.$modal.confirm(message)
        .then(() => request(this.formData.id))
        .then(() => {
          this.$modal.msgSuccess('成功')
          return this.getDetail()
        })
        .catch((error) => {
          if (error === 'cancel' || error === 'close') return false
          return Promise.reject(error)
        })
    },
    /** 关闭 tag */
    close() {
      return this.$store.dispatch('tagsView/delView', this.$route)
        .then(() => this.$router.push({ name: 'TradeAfterSale' }))
    },
    fenToYuan,
    parseTime
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-descriptions {
  &:not(:nth-child(1)) {
    margin-top: 20px;
  }

  .el-descriptions__title {
    display: flex;
    align-items: center;

    &::before {
      display: inline-block;
      width: 3px;
      height: 20px;
      margin-right: 10px;
      background-color: #409eff;
      content: '';
    }
  }

  .el-descriptions-item__container {
    margin: 0 10px;

    .no-colon {
      margin: 0;

      &::after {
        content: '';
      }
    }
  }
}

.proof-image {
  width: 60px;
  height: 60px;
  margin-right: 10px;
}

.property-tag {
  margin-right: 10px;
}

.reminder-label {
  color: red;
}

// 时间线样式调整
::v-deep .el-timeline {
  margin: 10px 0 0 160px;

  .el-timeline-item__wrapper {
    position: relative;
    top: -20px;

    .el-timeline-item__timestamp {
      position: absolute !important;
      top: 10px;
      left: -150px;
    }
  }

  .el-timeline-right-content {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 10px;
    background-color: #f5f7fa;

    &::before {
      position: absolute;
      top: 10px;
      left: 13px;
      border-color: transparent #f5f7fa transparent transparent;
      border-style: solid;
      border-width: 8px;
      content: '';
    }
  }

  .dot-node-style {
    position: absolute;
    left: -5px;
    display: flex;
    width: 20px;
    height: 20px;
    font-size: 10px;
    color: #fff;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
  }
}
</style>
