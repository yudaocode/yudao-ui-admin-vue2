<template>
  <div>
    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" @submit.native.prevent>
      <el-form-item label="订单状态" prop="status"><el-select v-model="queryParams.status" clearable placeholder="全部"><el-option v-for="item in orderStatusDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item label="支付方式" prop="payChannelCode"><el-select v-model="queryParams.payChannelCode" clearable placeholder="全部"><el-option v-for="item in payChannelDictDatas" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="创建时间" prop="createTime"><el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item label="订单来源" prop="terminal"><el-select v-model="queryParams.terminal" clearable placeholder="全部"><el-option v-for="item in terminalDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item label="订单类型" prop="type"><el-select v-model="queryParams.type" clearable placeholder="全部"><el-option v-for="item in orderTypeDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item label="配送方式" prop="deliveryType"><el-select v-model="queryParams.deliveryType" clearable placeholder="全部"><el-option v-for="item in deliveryTypeDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item v-if="queryParams.deliveryType === DeliveryTypeEnum.EXPRESS.type" label="快递公司" prop="logisticsId"><el-select v-model="queryParams.logisticsId" clearable placeholder="全部"><el-option v-for="item in deliveryExpressList" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
      <el-form-item v-if="queryParams.deliveryType === DeliveryTypeEnum.PICK_UP.type" label="自提门店" prop="pickUpStoreId"><el-select v-model="queryParams.pickUpStoreId" clearable multiple placeholder="全部"><el-option v-for="item in pickUpStoreList" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
      <el-form-item v-if="queryParams.deliveryType === DeliveryTypeEnum.PICK_UP.type" label="核销码" prop="pickUpVerifyCode"><el-input v-model="queryParams.pickUpVerifyCode" clearable placeholder="请输入自提核销码" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="聚合搜索">
        <el-input v-model="queryParams[queryType.queryParam]" clearable placeholder="请输入" @keyup.enter.native="handleQuery">
          <el-select slot="prepend" v-model="queryType.queryParam" clearable placeholder="全部" style="width: 110px" @change="inputChangeSelect">
            <el-option v-for="item in dynamicSearchList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-input>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" row-key="id">
      <order-table-column :list="list" :pick-up-store-list="pickUpStoreList">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="openDetail(row.id)">详情</el-button>
        </template>
      </order-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as OrderApi from '@/api/mall/trade/order'
import * as PickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import OrderTableColumn from '@/views/mall/trade/order/components/OrderTableColumn.vue'
import { DeliveryTypeEnum } from '@/utils/constants'

export default {
  name: 'UserOrderList',
  components: { OrderTableColumn },
  props: { userId: { type: [Number, String], required: true }},
  data() {
    return {
      DICT_TYPE,
      DeliveryTypeEnum,
      loading: true,
      total: 0,
      list: [],
      deliveryExpressList: [],
      pickUpStoreList: [],
      dynamicSearchList: [
        { value: 'no', label: '订单号' },
        { value: 'userNickname', label: '用户昵称' },
        { value: 'userMobile', label: '用户电话' }
      ],
      queryType: { queryParam: '' },
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        status: undefined,
        payChannelCode: undefined,
        createTime: [],
        terminal: undefined,
        type: undefined,
        deliveryType: undefined,
        logisticsId: undefined,
        pickUpStoreId: undefined,
        pickUpVerifyCode: undefined,
        no: undefined,
        userNickname: undefined,
        userMobile: undefined
      }
    }
  },
  computed: {
    orderStatusDictDatas() { return getDictDatas(DICT_TYPE.TRADE_ORDER_STATUS) },
    payChannelDictDatas() { return getDictDatas(DICT_TYPE.PAY_CHANNEL_CODE) },
    terminalDictDatas() { return getDictDatas(DICT_TYPE.TERMINAL) },
    orderTypeDictDatas() { return getDictDatas(DICT_TYPE.TRADE_ORDER_TYPE) },
    deliveryTypeDictDatas() { return getDictDatas(DICT_TYPE.TRADE_DELIVERY_TYPE) }
  },
  async mounted() {
    try {
      const [storeResponse, expressResponse] = await Promise.all([
        PickUpStoreApi.getSimpleDeliveryPickUpStoreList(),
        DeliveryExpressApi.getSimpleDeliveryExpressList()
      ])
      this.pickUpStoreList = storeResponse.data
      this.deliveryExpressList = expressResponse.data
    } finally {
      await this.getList()
    }
  },
  methods: {
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    inputChangeSelect(value) {
      this.dynamicSearchList.filter(item => item.value !== value).forEach(item => {
        if (Object.prototype.hasOwnProperty.call(this.queryParams, item.value)) {
          Reflect.deleteProperty(this.queryParams, item.value)
        }
      })
    },
    getList() {
      this.loading = true
      const query = Object.assign({}, this.queryParams, { userId: this.userId })
      if (!this.queryType.queryParam) {
        Reflect.deleteProperty(query, 'no')
        Reflect.deleteProperty(query, 'userNickname')
        Reflect.deleteProperty(query, 'userMobile')
      }
      return OrderApi.getOrderPage(query).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.queryType.queryParam = ''
      this.queryParams.userId = this.userId
      this.handleQuery()
    },
    openDetail(id) { this.$router.push({ name: 'TradeOrderDetail', params: { id: id }}) }
  }
}
</script>
