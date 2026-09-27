<template>
  <div class="app-container trade-order-detail">
    <el-card shadow="never">
      <!-- 订单信息 -->
      <el-descriptions title="订单信息">
        <el-descriptions-item label="订单号: ">{{ formData.no }}</el-descriptions-item>
        <el-descriptions-item label="买家: ">
          {{ formData.user && formData.user.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="订单类型: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_ORDER_TYPE"
            :value="formData.type"
          />
        </el-descriptions-item>
        <el-descriptions-item label="订单来源: ">
          <dict-tag
            :type="DICT_TYPE.TERMINAL"
            :value="formData.terminal"
          />
        </el-descriptions-item>
        <el-descriptions-item label="买家留言: ">{{ formData.userRemark }}</el-descriptions-item>
        <el-descriptions-item label="商家备注: ">{{ formData.remark }}</el-descriptions-item>
        <el-descriptions-item label="支付单号: ">{{ formData.payOrderId }}</el-descriptions-item>
        <el-descriptions-item label="付款方式: ">
          <dict-tag
            :type="DICT_TYPE.PAY_CHANNEL_CODE"
            :value="formData.payChannelCode"
          />
        </el-descriptions-item>
        <el-descriptions-item
          v-if="formData.brokerageUser"
          label="推广用户: "
        >
          {{ formData.brokerageUser.nickname }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 订单状态 -->
      <el-descriptions
        :column="1"
        title="订单状态"
      >
        <el-descriptions-item label="订单状态: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_ORDER_STATUS"
            :value="formData.status"
          />
        </el-descriptions-item>
        <el-descriptions-item
          v-hasPermi="['trade:order:update']"
          label-class-name="no-colon"
        >
          <el-button
            v-if="formData.status === TradeOrderStatusEnum.UNPAID.status"
            type="primary"
            @click="updatePrice"
          >
            调整价格
          </el-button>
          <el-button
            type="primary"
            @click="remark"
          >备注</el-button>
          <template v-if="formData.status === TradeOrderStatusEnum.UNDELIVERED.status">
            <el-button
              v-if="formData.deliveryType === DeliveryTypeEnum.EXPRESS.type"
              type="primary"
              @click="delivery"
            >
              发货
            </el-button>
            <el-button
              v-if="formData.deliveryType === DeliveryTypeEnum.EXPRESS.type"
              type="primary"
              @click="updateAddress"
            >
              修改地址
            </el-button>
            <el-button
              v-if="formData.deliveryType === DeliveryTypeEnum.PICK_UP.type && showPickUp"
              type="primary"
              @click="handlePickUp"
            >
              核销
            </el-button>
          </template>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"><span class="reminder-label">提醒: </span></template>
          买家付款成功后，货款将直接进入您的商户号（微信、支付宝）<br />
          请及时关注你发出的包裹状态，确保可以配送至买家手中 <br />
          如果买家表示没收到货或货物有问题，请及时联系买家处理，友好协商
        </el-descriptions-item>
      </el-descriptions>

      <!-- 商品信息 -->
      <el-descriptions title="商品信息">
        <el-descriptions-item label-class-name="no-colon">
          <el-row :gutter="20">
            <el-col :span="15">
              <el-table
                :data="formData.items"
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
                  <template v-slot="{ row }">{{ fenToYuan(row.price) }}元</template>
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
                  <template v-slot="{ row }">{{ fenToYuan(row.payPrice) }}元</template>
                </el-table-column>
                <el-table-column
                  label="售后状态"
                  prop="afterSaleStatus"
                  width="120"
                >
                  <template v-slot="{ row }">
                    <dict-tag
                      :type="DICT_TYPE.TRADE_ORDER_ITEM_AFTER_SALE_STATUS"
                      :value="row.afterSaleStatus"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :span="10" />
          </el-row>
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="4">
        <el-descriptions-item label="商品总额: ">
          {{ fenToYuan(formData.totalPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item label="运费金额: ">
          {{ fenToYuan(formData.deliveryPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item label="订单调价: ">
          {{ fenToYuan(formData.adjustPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item
          v-for="item in 1"
          :key="'first-' + item"
          label-class-name="no-colon"
        />
        <el-descriptions-item>
          <template slot="label"><span class="discount-label">优惠劵优惠: </span></template>
          {{ fenToYuan(formData.couponPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"><span class="discount-label">VIP 优惠: </span></template>
          {{ fenToYuan(formData.vipPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"><span class="discount-label">活动优惠: </span></template>
          {{ fenToYuan(formData.discountPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"><span class="discount-label">积分抵扣: </span></template>
          {{ fenToYuan(formData.pointPrice) }} 元
        </el-descriptions-item>
        <el-descriptions-item
          v-for="item in 3"
          :key="'third-' + item"
          label-class-name="no-colon"
        />
        <el-descriptions-item label="应付金额: ">
          {{ fenToYuan(formData.payPrice) }} 元
        </el-descriptions-item>
      </el-descriptions>

      <!-- 收货信息 -->
      <el-descriptions
        :column="4"
        title="收货信息"
      >
        <el-descriptions-item label="配送方式: ">
          <dict-tag
            :type="DICT_TYPE.TRADE_DELIVERY_TYPE"
            :value="formData.deliveryType"
          />
        </el-descriptions-item>
        <el-descriptions-item label="收货人: ">{{ formData.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话: ">{{ formData.receiverMobile }}</el-descriptions-item>
        <template v-if="formData.deliveryType === DeliveryTypeEnum.EXPRESS.type">
          <el-descriptions-item
            v-if="formData.receiverDetailAddress"
            label="收货地址: "
          >
            {{ formData.receiverAreaName }} {{ formData.receiverDetailAddress }}
            <el-link
              v-clipboard:copy="formData.receiverAreaName + ' ' + formData.receiverDetailAddress"
              v-clipboard:success="clipboardSuccess"
              icon="el-icon-document-copy"
              type="primary"
            />
          </el-descriptions-item>
          <el-descriptions-item
            v-if="formData.logisticsId"
            label="物流公司: "
          >
            {{ getDeliveryExpressName(formData.logisticsId) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="formData.logisticsId"
            label="运单号: "
          >
            {{ formData.logisticsNo }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="formData.deliveryTime"
            label="发货时间: "
          >
            {{ parseTime(formData.deliveryTime) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-for="item in 2"
            :key="'delivery-' + item"
            label-class-name="no-colon"
          />
          <el-descriptions-item
            v-if="expressTrackList.length > 0"
            label="物流详情: "
          >
            <el-timeline>
              <el-timeline-item
                v-for="(express, index) in expressTrackList"
                :key="index"
                :timestamp="parseTime(express.time)"
              >
                {{ express.content }}
              </el-timeline-item>
            </el-timeline>
          </el-descriptions-item>
        </template>
        <template v-if="formData.deliveryType === DeliveryTypeEnum.PICK_UP.type">
          <el-descriptions-item
            v-if="formData.pickUpStoreId"
            label="自提门店: "
          >
            {{ pickUpStore && pickUpStore.name }}
          </el-descriptions-item>
        </template>
      </el-descriptions>

      <!-- 订单日志 -->
      <el-descriptions title="订单操作日志">
        <el-descriptions-item label-class-name="no-colon">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in formData.logs"
              :key="index"
              :timestamp="parseTime(log.createTime)"
              placement="top"
            >
              <div class="el-timeline-right-content">
                {{ log.content }}
              </div>
              <span
                slot="dot"
                :style="{ backgroundColor: getUserTypeColor(log.userType) }"
                class="dot-node-style"
              >
                {{ getUserTypeLabel(log.userType) }}
              </span>
            </el-timeline-item>
          </el-timeline>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 各种操作的弹窗 -->
    <OrderDeliveryForm
      ref="deliveryForm"
      @success="getDetail"
    />
    <OrderUpdateRemarkForm
      ref="updateRemarkForm"
      @success="getDetail"
    />
    <OrderUpdateAddressForm
      ref="updateAddressForm"
      @success="getDetail"
    />
    <OrderUpdatePriceForm
      ref="updatePriceForm"
      @success="getDetail"
    />
  </div>
</template>

<script>
import * as TradeOrderApi from '@/api/mall/trade/order'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import * as DeliveryPickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { DeliveryTypeEnum, TradeOrderStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictData, getDictDataLabel } from '@/utils/dict'
import { fenToYuan } from '@/utils'
import { parseTime } from '@/utils/ruoyi'
import OrderDeliveryForm from '@/views/mall/trade/order/form/OrderDeliveryForm.vue'
import OrderUpdateRemarkForm from '@/views/mall/trade/order/form/OrderUpdateRemarkForm.vue'
import OrderUpdateAddressForm from '@/views/mall/trade/order/form/OrderUpdateAddressForm.vue'
import OrderUpdatePriceForm from '@/views/mall/trade/order/form/OrderUpdatePriceForm.vue'

export default {
  name: 'TradeOrderDetail',
  components: {
    OrderDeliveryForm,
    OrderUpdateRemarkForm,
    OrderUpdateAddressForm,
    OrderUpdatePriceForm
  },
  props: {
    id: { type: Number, default: undefined },
    showPickUp: { type: Boolean, default: true }
  },
  data() {
    return {
      DICT_TYPE,
      DeliveryTypeEnum,
      TradeOrderStatusEnum,
      orderId: Number(this.$route.params.id || this.id),
      formData: {
        items: [],
        logs: []
      },
      deliveryExpressList: [],
      expressTrackList: [],
      pickUpStore: undefined
    }
  },
  mounted() {
    return this.initialize()
  },
  methods: {
    async initialize() {
      await this.getDetail()
      if (this.formData.deliveryType === DeliveryTypeEnum.EXPRESS.type) {
        const expressResponse = await DeliveryExpressApi.getSimpleDeliveryExpressList()
        this.deliveryExpressList = expressResponse.data
        if (this.formData.logisticsId) {
          const trackResponse = await TradeOrderApi.getExpressTrackList(this.formData.id)
          this.expressTrackList = trackResponse.data
        }
      } else if (this.formData.deliveryType === DeliveryTypeEnum.PICK_UP.type) {
        if (this.formData.pickUpStoreId) {
          const storeResponse = await DeliveryPickUpStoreApi.getDeliveryPickUpStore(
            this.formData.pickUpStoreId
          )
          this.pickUpStore = storeResponse.data
        }
      }
    },
    async getDetail() {
      if (!this.orderId) return
      const response = await TradeOrderApi.getOrder(this.orderId)
      if (response.data == null) {
        this.$modal.msgError('交易订单不存在')
        await this.close()
        return
      }
      this.formData = response.data
    },
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
      return getDictDataLabel(DICT_TYPE.USER_TYPE, type)[0]
    },
    getDeliveryExpressName(logisticsId) {
      const express = this.deliveryExpressList.find((item) => item.id === logisticsId)
      return express && express.name
    },
    remark() {
      this.$refs.updateRemarkForm.open(this.formData)
    },
    delivery() {
      this.$refs.deliveryForm.open(this.formData)
    },
    updateAddress() {
      this.$refs.updateAddressForm.open(this.formData)
    },
    updatePrice() {
      this.$refs.updatePriceForm.open(this.formData)
    },
    handlePickUp() {
      return this.$modal.confirm('确认核销订单吗？')
        .then(() => TradeOrderApi.pickUpOrder(this.formData.id))
        .then(() => {
          this.$modal.msgSuccess('核销成功')
          return this.getDetail()
        })
        .catch((error) => {
          if (error === 'cancel' || error === 'close') return false
          return Promise.reject(error)
        })
    },
    close() {
      return this.$store.dispatch('tagsView/delView', this.$route)
        .then(() => this.$router.push({ name: 'TradeOrder' }))
    },
    clipboardSuccess() {
      this.$modal.msgSuccess('复制成功')
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

.property-tag {
  margin-left: 8px;
}

.reminder-label,
.discount-label {
  color: red;
}

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
    min-height: 30px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    align-items: center;

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
