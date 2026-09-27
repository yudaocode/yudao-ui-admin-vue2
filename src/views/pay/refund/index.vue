<template>
  <div class="app-container">
    <doc-alert title="支付宝、微信退款接入" url="https://doc.iocoder.cn/pay/refund-demo/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="120px"
      v-show="showSearch"
    >
      <el-form-item label="应用编号" prop="appId">
        <el-select
          v-model="queryParams.appId"
          clearable
          filterable
          placeholder="请选择应用信息"
        >
          <el-option v-for="item in appList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="退款渠道" prop="channelCode">
        <el-select v-model="queryParams.channelCode" placeholder="请选择退款渠道" clearable>
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.PAY_CHANNEL_CODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商户支付单号" prop="merchantOrderId">
        <el-input
          v-model="queryParams.merchantOrderId"
          placeholder="请输入商户支付单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商户退款单号" prop="merchantRefundId">
        <el-input
          v-model="queryParams.merchantRefundId"
          placeholder="请输入商户退款单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道支付单号" prop="channelOrderNo">
        <el-input
          v-model="queryParams.channelOrderNo"
          placeholder="请输入渠道支付单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道退款单号" prop="channelRefundNo">
        <el-input
          v-model="queryParams.channelRefundNo"
          placeholder="请输入渠道退款单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="退款状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择退款状态" clearable>
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.PAY_REFUND_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['pay:refund:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="编号" align="center" prop="id" width="90" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付金额" align="center" prop="payPrice" width="110">
        <template v-slot="scope">{{ formatAmount(scope.row.payPrice) }}</template>
      </el-table-column>
      <el-table-column label="退款金额" align="center" prop="refundPrice" width="110">
        <template v-slot="scope">{{ formatAmount(scope.row.refundPrice) }}</template>
      </el-table-column>
      <el-table-column label="退款订单号" align="left" width="300">
        <template v-slot="scope">
          <p class="order-font"><el-tag size="mini">商户</el-tag> {{ scope.row.merchantRefundId }}</p>
          <p class="order-font"><el-tag size="mini" type="warning">退款</el-tag> {{ scope.row.no }}</p>
          <p v-if="scope.row.channelRefundNo" class="order-font">
            <el-tag size="mini" type="success">渠道</el-tag> {{ scope.row.channelRefundNo }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="支付订单号" align="left" width="300">
        <template v-slot="scope">
          <p class="order-font"><el-tag size="mini">商户</el-tag> {{ scope.row.merchantOrderId }}</p>
          <p class="order-font"><el-tag size="mini" type="success">渠道</el-tag> {{ scope.row.channelOrderNo }}</p>
        </template>
      </el-table-column>
      <el-table-column label="退款状态" align="center" prop="status" width="100">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.PAY_REFUND_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="退款渠道" align="center" width="140">
        <template v-slot="scope">
          <dict-tag
            v-if="scope.row.channelCode"
            :type="DICT_TYPE.PAY_CHANNEL_CODE"
            :value="scope.row.channelCode"
          />
        </template>
      </el-table-column>
      <el-table-column label="成功时间" align="center" prop="successTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.successTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付应用" align="center" prop="appName" width="120" />
      <el-table-column label="操作" align="center" fixed="right" width="100">
        <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['pay:refund:query']"
          >详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <refund-detail ref="detail" />
  </div>
</template>

<script>
import { getRefundPage, exportRefund } from '@/api/pay/refund'
import { getAppList as fetchAppList } from '@/api/pay/app'
import { DICT_TYPE } from '@/utils/dict'
import RefundDetail from './RefundDetail.vue'

export default {
  name: 'PayRefund',
  components: { RefundDetail },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      exportLoading: false,
      total: 0,
      list: [],
      appList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        appId: undefined,
        channelCode: undefined,
        merchantOrderId: undefined,
        merchantRefundId: undefined,
        channelOrderNo: undefined,
        channelRefundNo: undefined,
        status: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
    this.getAppList()
  },
  methods: {
    getList() {
      this.loading = true
      return getRefundPage(this.queryParams).then((response) => {
        const page = response.data
        this.list = page.list
        this.total = page.total
      }).finally(() => {
        this.loading = false
      })
    },
    getAppList() {
      return fetchAppList().then((response) => {
        this.appList = response.data
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleExport() {
      const params = { ...this.queryParams, pageNo: undefined, pageSize: undefined }
      this.$modal.confirm('是否确认导出所有退款订单数据项?').then(() => {
        this.exportLoading = true
        return exportRefund(params)
      }).then((response) => {
        this.$download.excel(response, '退款订单.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    openDetail(id) {
      this.$refs.detail.open(id)
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
.order-font {
  padding: 2px 0;
  margin: 0;
  font-size: 12px;
}
</style>
