<template>
  <div>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="100" />
      <el-table-column label="关联业务标题" align="center" prop="title" min-width="180" />
      <el-table-column label="交易金额" align="center" prop="price" width="130"><template slot-scope="scope">{{ fenToYuan(scope.row.price) }} 元</template></el-table-column>
      <el-table-column label="钱包余额" align="center" prop="balance" width="130"><template slot-scope="scope">{{ fenToYuan(scope.row.balance) }} 元</template></el-table-column>
      <el-table-column label="交易时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import * as WalletTransactionApi from '@/api/pay/wallet/transaction'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserBalanceList',
  props: { walletId: { type: [Number, String], default: undefined }},
  data() {
    return { loading: true, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, walletId: null }}
  },
  mounted() { this.getList() },
  methods: {
    dateFormatter,
    fenToYuan(value) { return (Number(value || 0) / 100).toFixed(2) },
    getList() {
      this.loading = true
      this.queryParams.walletId = this.walletId
      return WalletTransactionApi.getWalletTransactionPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    }
  }
}
</script>
