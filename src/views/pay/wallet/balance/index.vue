<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="queryParams.userType" placeholder="请选择用户类型" clearable>
          <el-option v-for="dict in getDictDatas(DICT_TYPE.USER_TYPE)" :key="dict.value" :label="dict.label" :value="toNumber(dict.value)" />
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

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户类型" align="center" prop="userType">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType" /></template>
      </el-table-column>
      <el-table-column label="余额" align="center" prop="balance">
        <template v-slot="scope">{{ formatAmount(scope.row.balance) }} 元</template>
      </el-table-column>
      <el-table-column label="累计支出" align="center" prop="totalExpense">
        <template v-slot="scope">{{ formatAmount(scope.row.totalExpense) }} 元</template>
      </el-table-column>
      <el-table-column label="累计充值" align="center" prop="totalRecharge">
        <template v-slot="scope">{{ formatAmount(scope.row.totalRecharge) }} 元</template>
      </el-table-column>
      <el-table-column label="冻结金额" align="center" prop="freezePrice">
        <template v-slot="scope">{{ formatAmount(scope.row.freezePrice) }} 元</template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="90">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="openForm(scope.row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <wallet-form ref="walletForm" />
  </div>
</template>

<script>
import { getWalletPage } from '@/api/pay/wallet/balance'
import WalletForm from './WalletForm.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'WalletBalance',
  components: { WalletForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, userId: null, userType: null, createTime: [] }
    }
  },
  methods: {
    getDictDatas,
    getList() {
      this.loading = true
      return getWalletPage(this.queryParams).then((response) => {
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
    openForm(id) {
      this.$refs.walletForm.open(id)
    },
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    formatAmount(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      return Number.isFinite(number) ? (number / 100).toFixed(2) : '-'
    }
  },
  created() {
    this.getList()
  }
}
</script>
