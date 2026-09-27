<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      v-show="showSearch"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" plain icon="el-icon-plus" :loading="loading" @click="openForm">创建示例提现单</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="操作" align="center" width="110">
        <template v-slot="scope">
          <el-button
            v-if="scope.row.status === 0 && !scope.row.payTransferId"
            type="primary"
            size="mini"
            @click="handleTransfer(scope.row.id)"
          >发起转账</el-button>
          <el-button
            v-else-if="scope.row.status === 20"
            type="warning"
            size="mini"
            @click="handleTransfer(scope.row.id)"
          >重新转账</el-button>
        </template>
      </el-table-column>
      <el-table-column label="提现单编号" align="center" prop="id" width="100" />
      <el-table-column label="提现标题" align="center" prop="subject" min-width="120" />
      <el-table-column label="提现类型" align="center" prop="type" min-width="90">
        <template v-slot="scope">
          <el-tag v-if="scope.row.type === 1">支付宝</el-tag>
          <el-tag v-else-if="scope.row.type === 2">微信余额</el-tag>
          <el-tag v-else-if="scope.row.type === 3">钱包余额</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="提现金额" align="center" prop="price" width="120">
        <template v-slot="scope">￥{{ formatPrice(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column label="收款人姓名" align="center" prop="userName" min-width="150" />
      <el-table-column label="收款人账号" align="center" prop="userAccount" min-width="220" />
      <el-table-column label="提现状态" align="center" prop="status" width="110">
        <template v-slot="scope">
          <el-tag v-if="scope.row.status === 0 && !scope.row.payTransferId" type="warning">等待转账</el-tag>
          <el-tag v-else-if="scope.row.status === 0 && scope.row.payTransferId" type="info">转账中</el-tag>
          <el-tag v-else-if="scope.row.status === 10" type="success">转账成功</el-tag>
          <el-tag v-else-if="scope.row.status === 20" type="danger">转账失败</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="转账单号" align="center" prop="payTransferId" min-width="120" />
      <el-table-column label="转账渠道" align="center" prop="transferChannelCode" min-width="160">
        <template v-slot="scope">
          <dict-tag v-if="scope.row.transferChannelCode" :type="DICT_TYPE.PAY_CHANNEL_CODE" :value="scope.row.transferChannelCode" />
        </template>
      </el-table-column>
      <el-table-column label="转账时间" align="center" prop="transferTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.transferTime) }}</template>
      </el-table-column>
      <el-table-column label="转账失败原因" align="center" prop="transferErrorMsg" min-width="200" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <demo-withdraw-form ref="demoForm" @success="getList" />
  </div>
</template>

<script>
import { getDemoWithdrawPage, transferDemoWithdraw } from '@/api/pay/demo/withdraw'
import DemoWithdrawForm from './DemoWithdrawForm.vue'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'PayDemoWithdraw',
  components: { DemoWithdrawForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10 }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getDemoWithdrawPage(this.queryParams).then((response) => {
        const page = response.data
        this.list = page.list
        this.total = page.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm() {
      this.$refs.demoForm.open('create')
    },
    handleTransfer(id) {
      this.$modal.confirm('确认要执行转账操作吗?').then(() => {
        this.loading = true
        return transferDemoWithdraw(id)
      }).then((response) => {
        const payTransferId = response.data
        this.$modal.msgSuccess('转账提交成功，转账单号：' + payTransferId)
        this.getList()
      }).finally(() => {
        this.loading = false
      })
    },
    formatPrice(value) {
      const number = Number(value || 0)
      return (Number.isFinite(number) ? number / 100 : 0).toFixed(2)
    }
  }
}
</script>
