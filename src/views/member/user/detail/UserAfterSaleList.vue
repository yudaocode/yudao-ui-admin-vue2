<template>
  <div>
    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" @submit.native.prevent>
      <el-form-item label="商品名称" prop="spuName"><el-input v-model="queryParams.spuName" clearable placeholder="请输入商品 SPU 名称" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="退款编号" prop="no"><el-input v-model="queryParams.no" clearable placeholder="请输入退款编号" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="订单编号" prop="orderNo"><el-input v-model="queryParams.orderNo" clearable placeholder="请输入订单编号" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="售后状态" prop="status"><el-select v-model="queryParams.status" clearable placeholder="请选择售后状态"><el-option v-for="item in statusTabs" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="售后方式" prop="way"><el-select v-model="queryParams.way" clearable placeholder="全部"><el-option v-for="item in afterSaleWayDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item label="售后类型" prop="type"><el-select v-model="queryParams.type" clearable placeholder="全部"><el-option v-for="item in afterSaleTypeDictDatas" :key="item.value" :label="item.label" :value="toNumber(item.value)" /></el-select></el-form-item>
      <el-form-item label="创建时间" prop="createTime"><el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-tabs v-model="queryParams.status" type="card" @tab-click="tabClick">
      <el-tab-pane v-for="item in statusTabs" :key="item.value" :label="item.label" :name="item.value" />
    </el-tabs>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="退款编号" prop="no" min-width="150" />
      <el-table-column label="订单编号" prop="orderNo" min-width="150"><template slot-scope="scope"><el-button type="text" @click="openOrderDetail(scope.row.orderId)">{{ scope.row.orderNo || '-' }}</el-button></template></el-table-column>
      <el-table-column label="商品信息" prop="spuName" min-width="260"><template slot-scope="scope"><div class="product-cell"><el-image v-if="scope.row.picUrl" :src="scope.row.picUrl" :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []" class="product-image" /><span>{{ scope.row.spuName || '-' }}</span><el-tag v-for="property in (scope.row.properties || [])" :key="property.propertyId" size="mini">{{ property.propertyName }}：{{ property.valueName }}</el-tag></div></template></el-table-column>
      <el-table-column label="退款金额" prop="refundPrice" width="120"><template slot-scope="scope">{{ fenToYuan(scope.row.refundPrice) }} 元</template></el-table-column>
      <el-table-column label="申请时间" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="售后状态" prop="status" width="110"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.TRADE_AFTER_SALE_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="售后方式" prop="way" width="110"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.TRADE_AFTER_SALE_WAY" :value="scope.row.way" /></template></el-table-column>
      <el-table-column label="操作" fixed="right" width="100"><template slot-scope="scope"><el-button type="text" size="mini" @click="openAfterSaleDetail(scope.row.id)">处理退款</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as AfterSaleApi from '@/api/mall/trade/afterSale'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserAfterSaleList',
  props: { userId: { type: [Number, String], required: true }},
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, userId: undefined, no: undefined, status: '0', orderNo: undefined, spuName: undefined, createTime: [], way: undefined, type: undefined },
      statusTabs: [{ label: '全部', value: '0' }]
    }
  },
  computed: {
    afterSaleWayDictDatas() { return getDictDatas(DICT_TYPE.TRADE_AFTER_SALE_WAY) },
    afterSaleTypeDictDatas() { return getDictDatas(DICT_TYPE.TRADE_AFTER_SALE_TYPE) }
  },
  mounted() {
    this.statusTabs = this.statusTabs.concat(getDictDatas(DICT_TYPE.TRADE_AFTER_SALE_STATUS).map(item => ({ label: item.label, value: String(item.value) })))
    this.getList()
  },
  methods: {
    dateFormatter,
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    fenToYuan(value) { return (Number(value || 0) / 100).toFixed(2) },
    getList() {
      this.loading = true
      const data = Object.assign({}, this.queryParams, { userId: this.userId })
      if (data.status === '0') Reflect.deleteProperty(data, 'status')
      return AfterSaleApi.getAfterSalePage(data).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.queryParams.status = '0'; this.queryParams.userId = this.userId; this.handleQuery() },
    tabClick(tab) { this.queryParams.status = tab.name; this.handleQuery() },
    openOrderDetail(id) {
      if (id !== undefined && id !== null && this.$router && this.$router.push) {
        this.$router.push({ name: 'TradeOrderDetail', params: { id: id }})
      }
    },
    openAfterSaleDetail(id) {
      this.$emit('open-detail', id)
      if (this.$router && this.$router.push) {
        this.$router.push({ name: 'TradeAfterSaleDetail', params: { id: id }})
      }
    }
  }
}
</script>

<style scoped>
.product-cell { display: flex; align-items: center; gap: 8px; }
.product-image { width: 30px; height: 30px; }
</style>
