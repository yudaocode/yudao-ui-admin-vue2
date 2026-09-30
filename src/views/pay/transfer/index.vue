<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      v-show="showSearch"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="转账单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入转账单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="转账渠道" prop="channelCode">
        <el-select
          v-model="queryParams.channelCode"
          placeholder="请选择支付渠道"
          clearable
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.PAY_CHANNEL_CODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商户单号" prop="merchantOrderId">
        <el-input
          v-model="queryParams.merchantOrderId"
          placeholder="请输入商户单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="转账状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择转账状态"
          clearable
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.PAY_TRANSFER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收款人姓名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入收款人姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收款人账号" prop="userAccount">
        <el-input
          v-model="queryParams.userAccount"
          placeholder="请输入收款人账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道单号" prop="channelTransferNo">
        <el-input
          v-model="queryParams.channelTransferNo"
          placeholder="请输入渠道单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['pay:transfer:export']"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="编号" align="center" prop="id" width="90" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付应用" align="center" prop="appName" min-width="120" />
      <el-table-column label="转账金额" align="center" prop="price" width="110">
        <template v-slot="scope">
          <span>￥{{ formatPrice(scope.row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="转账状态" align="center" prop="status" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.PAY_TRANSFER_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="left" width="300">
        <template v-slot="scope">
          <p class="transfer-font">
            <el-tag size="mini">商户</el-tag>
            {{ scope.row.merchantTransferId }}
          </p>
          <p v-if="scope.row.no" class="transfer-font">
            <el-tag size="mini" type="warning">转账</el-tag>
            {{ scope.row.no }}
          </p>
          <p v-if="scope.row.channelTransferNo" class="transfer-font">
            <el-tag size="mini" type="success">渠道</el-tag>
            {{ scope.row.channelTransferNo }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="收款人姓名" align="center" prop="userName" width="120" />
      <el-table-column label="收款账号" align="left" prop="userAccount" width="200" />
      <el-table-column label="转账标题" align="center" prop="subject" width="140" />
      <el-table-column label="转账渠道" align="center" prop="channelCode" width="140">
        <template v-slot="scope">
          <dict-tag
            v-if="scope.row.channelCode"
            :type="DICT_TYPE.PAY_CHANNEL_CODE"
            :value="scope.row.channelCode"
          />
        </template>
      </el-table-column>
      <el-table-column label="转账成功时间" align="center" prop="successTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.successTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="80">
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-search"
            @click="openDetail(scope.row.id)"
          >
            详情
          </el-button>
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

    <TransferDetail ref="transferDetail" />
  </div>
</template>

<script>
import { exportTransfer, getTransferPage } from '@/api/pay/transfer'
import TransferDetail from './TransferDetail'

export default {
  name: 'PayTransfer',
  components: { TransferDetail },
  data() {
    return {
      loading: true,
      exportLoading: false,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: null,
        channelCode: null,
        merchantOrderId: null,
        status: null,
        userName: null,
        userAccount: null,
        channelTransferNo: null,
        createTime: []
      }
    }
  },
  methods: {
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    formatPrice(value) {
      const number = Number(value || 0)
      return (number / 100).toFixed(2)
    },
    /** 查询转账单列表 */
    getList() {
      this.loading = true
      getTransferPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      const params = { ...this.queryParams }
      delete params.pageNo
      delete params.pageSize
      this.$modal.confirm('是否确认导出所有转账订单数据项?').then(() => {
        this.exportLoading = true
        return exportTransfer(params)
      }).then(response => {
        this.$download.excel(response, '转账订单.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    /** 打开详情 */
    openDetail(id) {
      this.$refs.transferDetail.open(id)
    }
  },
  created() {
    this.getList()
  }
}
</script>

<style scoped>
.transfer-font {
  padding: 2px 0;
  font-size: 12px;
}
</style>
