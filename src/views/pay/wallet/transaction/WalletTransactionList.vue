<template>
  <div>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="钱包编号" align="center" prop="walletId" />
      <el-table-column label="关联业务标题" align="center" prop="title" />
      <el-table-column label="交易金额" align="center" prop="price">
        <template v-slot="scope">{{ formatAmount(scope.row.price) }} 元</template>
      </el-table-column>
      <el-table-column label="钱包余额" align="center" prop="balance">
        <template v-slot="scope">{{ formatAmount(scope.row.balance) }} 元</template>
      </el-table-column>
      <el-table-column label="交易时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { getWallet } from '@/api/pay/wallet/balance'
import { getWalletTransactionPage } from '@/api/pay/wallet/transaction'

export default {
  name: 'WalletTransactionList',
  props: {
    walletId: { type: [Number, String], default: null },
    userId: { type: [Number, String], default: null }
  },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, walletId: null }
    }
  },
  watch: {
    walletId: {
      immediate: true,
      handler(value) {
        if (this.userId !== null && this.userId !== undefined && this.userId !== '') {
          this.getList()
          return
        }
        this.queryParams.walletId = value
        this.queryParams.pageNo = 1
        if (value !== null && value !== undefined && value !== '') this.getList()
      }
    },
    userId: {
      immediate: true,
      handler(value) {
        if (value !== null && value !== undefined && value !== '') this.getList()
      }
    }
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        if (this.userId !== null && this.userId !== undefined && this.userId !== '') {
          const walletResponse = await getWallet({ userId: this.userId })
          const wallet = walletResponse.data
          this.queryParams.walletId = wallet.id
        } else {
          this.queryParams.walletId = this.walletId
        }
        const response = await getWalletTransactionPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    formatAmount(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      return Number.isFinite(number) ? (number / 100).toFixed(2) : '-'
    }
  }
}
</script>
