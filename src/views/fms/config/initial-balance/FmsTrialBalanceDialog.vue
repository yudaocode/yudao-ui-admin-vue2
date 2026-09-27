<template>
  <el-dialog title="试算平衡" :visible.sync="visible" width="680px" append-to-body>
    <el-result
      :icon="result && result.balanced ? 'success' : 'warning'"
      :title="result && result.balanced ? '期初余额试算平衡' : '期初余额试算不平衡'"
      :sub-title="result && result.balanced ? '借贷金额相等，可以开始记账' : '请检查期初余额和累计发生额'"
    />
    <el-table :data="rows" border>
      <el-table-column label="项目" prop="name" min-width="180" />
      <el-table-column align="right" label="借方" prop="debitAmount" min-width="130" />
      <el-table-column align="right" label="贷方" prop="creditAmount" min-width="130" />
      <el-table-column align="right" label="差额" prop="differenceAmount" min-width="130" />
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="visible = false">我知道了</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsInitialBalanceApi } from '@/api/fms/config/initial-balance'
import { formatAmount } from '@/views/fms/utils/format'

export default {
  name: 'FmsTrialBalanceDialog',
  data() {
    return { visible: false, result: null, requestSequence: 0 }
  },
  computed: {
    rows() {
      if (!this.result) return []
      return [
        {
          name: '期初余额（综合本位币）',
          debitAmount: formatAmount(this.result.openingDebitAmount),
          creditAmount: formatAmount(this.result.openingCreditAmount),
          differenceAmount: formatAmount(this.result.openingDifferenceAmount)
        },
        {
          name: '累计发生额（综合本位币）',
          debitAmount: formatAmount(this.result.yearDebitAmount),
          creditAmount: formatAmount(this.result.yearCreditAmount),
          differenceAmount: formatAmount(this.result.yearDifferenceAmount)
        }
      ]
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open(accountSetId) {
      const sequence = ++this.requestSequence
      this.result = null
      return FmsInitialBalanceApi.getTrialBalance(accountSetId).then(response => {
        if (sequence !== this.requestSequence) return
        this.result = response.data
        this.visible = true
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer { text-align: right; }
</style>
