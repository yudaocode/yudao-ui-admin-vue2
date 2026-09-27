<template>
  <div class="app-container trade-order">
    <doc-alert
      title="【交易】交易订单"
      url="https://doc.iocoder.cn/mall/trade-order/"
    />
    <doc-alert
      title="【交易】购物车"
      url="https://doc.iocoder.cn/mall/trade-cart/"
    />

    <!-- 搜索 -->
    <el-card
      class="search-card"
      shadow="never"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
      >
        <el-form-item
          label="订单状态"
          prop="status"
        >
          <el-select
            v-model="queryParams.status"
            clearable
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_STATUS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="支付方式"
          prop="payChannelCode"
        >
          <el-select
            v-model="queryParams.payChannelCode"
            clearable
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="dict in getStrDictOptions(DICT_TYPE.PAY_CHANNEL_CODE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="创建时间"
          prop="createTime"
        >
          <el-date-picker
            v-model="queryParams.createTime"
            :default-time="['00:00:00', '23:59:59']"
            class="query-control"
            end-placeholder="自定义时间"
            start-placeholder="自定义时间"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item
          label="订单来源"
          prop="terminal"
        >
          <el-select
            v-model="queryParams.terminal"
            clearable
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.TERMINAL)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="订单类型"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            clearable
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="配送方式"
          prop="deliveryType"
        >
          <el-select
            v-model="queryParams.deliveryType"
            clearable
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_DELIVERY_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="queryParams.deliveryType === DeliveryTypeEnum.EXPRESS.type"
          label="快递公司"
          prop="logisticsId"
        >
          <el-select
            v-model="queryParams.logisticsId"
            clearable
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="item in deliveryExpressList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="queryParams.deliveryType === DeliveryTypeEnum.PICK_UP.type"
          label="自提门店"
          prop="pickUpStoreId"
        >
          <el-select
            v-model="queryParams.pickUpStoreId"
            clearable
            multiple
            class="query-control"
            placeholder="全部"
          >
            <el-option
              v-for="item in pickUpStoreList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="queryParams.deliveryType === DeliveryTypeEnum.PICK_UP.type"
          label="核销码"
          prop="pickUpVerifyCode"
        >
          <el-input
            v-model="queryParams.pickUpVerifyCode"
            clearable
            class="query-control"
            placeholder="请输入自提核销码"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="聚合搜索">
          <el-input
            v-model="queryParams[queryType.queryParam]"
            :type="queryType.queryParam === 'userId' ? 'number' : 'text'"
            clearable
            class="query-control"
            placeholder="请输入"
          >
            <el-select
              slot="prepend"
              v-model="queryType.queryParam"
              clearable
              class="aggregate-type"
              placeholder="全部"
              @change="inputChangeSelect"
            >
              <el-option
                v-for="dict in dynamicSearchList"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <!-- row-key 解决嵌套 table 表头数据不刷新的问题 -->
      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
      >
        <OrderTableColumn
          :list="list"
          :pick-up-store-list="pickUpStoreList"
        >
          <template v-slot="{ row }">
            <div class="order-actions">
              <el-button
                v-hasPermi="['trade:order:query']"
                icon="el-icon-bell"
                type="text"
                @click="openDetail(row.id)"
              >
                详情
              </el-button>
              <el-dropdown
                v-hasPermi="['trade:order:update']"
                @command="command => handleCommand(command, row)"
              >
                <el-button
                  icon="el-icon-d-arrow-right"
                  type="text"
                >更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-if="
                      row.deliveryType === DeliveryTypeEnum.EXPRESS.type &&
                        row.status === TradeOrderStatusEnum.UNDELIVERED.status
                    "
                    command="delivery"
                  >
                    <i class="el-icon-takeaway-box" />
                    发货
                  </el-dropdown-item>
                  <el-dropdown-item command="remark">
                    <i class="el-icon-chat-line-square" />
                    备注
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </OrderTableColumn>
      </el-table>
      <pagination
        v-show="total > 0"
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <OrderDeliveryForm
      ref="deliveryForm"
      @success="getList"
    />
    <OrderUpdateRemarkForm
      ref="updateRemarkForm"
      @success="getList"
    />
  </div>
</template>

<script>
import OrderDeliveryForm from '@/views/mall/trade/order/form/OrderDeliveryForm.vue'
import OrderUpdateRemarkForm from '@/views/mall/trade/order/form/OrderUpdateRemarkForm.vue'
import * as TradeOrderApi from '@/api/mall/trade/order'
import * as PickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { DeliveryTypeEnum, TradeOrderStatusEnum } from '@/utils/constants'
import { OrderTableColumn } from './components'

export default {
  name: 'TradeOrder',
  components: { OrderDeliveryForm, OrderUpdateRemarkForm, OrderTableColumn },
  data() {
    return {
      DICT_TYPE,
      DeliveryTypeEnum,
      TradeOrderStatusEnum,
      loading: true,
      total: 2,
      list: [],
      queryParams: this.createInitialQueryParams(),
      queryType: { queryParam: '' },
      dynamicSearchList: [
        { value: 'no', label: '订单号' },
        { value: 'userId', label: '用户UID' },
        { value: 'userNickname', label: '用户昵称' },
        { value: 'userMobile', label: '用户电话' }
      ],
      pickUpStoreList: [],
      deliveryExpressList: []
    }
  },
  watch: {
    $route() {
      this.getList()
    }
  },
  mounted() {
    return this.init()
  },
  methods: {
    createInitialQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        status: undefined,
        payChannelCode: undefined,
        createTime: undefined,
        terminal: undefined,
        type: undefined,
        deliveryType: undefined,
        logisticsId: undefined,
        pickUpStoreId: undefined,
        pickUpVerifyCode: undefined
      }
    },
    inputChangeSelect(value) {
      this.dynamicSearchList
        .filter(item => item.value !== value)
        .forEach(item => {
          if (Object.prototype.hasOwnProperty.call(this.queryParams, item.value)) {
            this.$delete(this.queryParams, item.value)
          }
        })
    },
    async getList() {
      this.loading = true
      try {
        const response = await TradeOrderApi.getOrderPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async handleQuery() {
      this.queryParams.pageNo = 1
      await this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.queryParams = this.createInitialQueryParams()
      return this.handleQuery()
    },
    openDetail(id) {
      return this.$router.push({ name: 'TradeOrderDetail', params: { id }})
    },
    handleCommand(command, row) {
      switch (command) {
        case 'remark':
          if (this.$refs.updateRemarkForm) this.$refs.updateRemarkForm.open(row)
          break
        case 'delivery':
          if (this.$refs.deliveryForm) this.$refs.deliveryForm.open(row)
          break
      }
    },
    async init() {
      await this.getList()
      const pickUpStoreResponse = await PickUpStoreApi.getSimpleDeliveryPickUpStoreList()
      this.pickUpStoreList = pickUpStoreResponse.data
      const deliveryExpressResponse = await DeliveryExpressApi.getSimpleDeliveryExpressList()
      this.deliveryExpressList = deliveryExpressResponse.data
    },
    getIntDictOptions,
    getStrDictOptions
  }
}
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 20px;
}

.query-control {
  width: 280px;
}

.aggregate-type {
  width: 110px;
}

.order-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .query-control {
    width: 100%;
  }
}
</style>
