<template>
  <el-dialog title="钱包余额明细" :visible.sync="dialogVisible" width="800px" append-to-body v-dialogDrag>
    <wallet-transaction-list v-if="dialogVisible" :wallet-id="walletId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import WalletTransactionList from '../transaction/WalletTransactionList.vue'

export default {
  name: 'WalletForm',
  components: { WalletTransactionList },
  data() {
    return {
      dialogVisible: false,
      walletId: 0
    }
  },
  methods: {
    open(id) {
      this.walletId = id
      this.dialogVisible = true
    }
  }
}
</script>
