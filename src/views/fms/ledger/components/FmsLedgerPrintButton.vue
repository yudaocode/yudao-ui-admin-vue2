<template>
  <span class="fms-ledger-print-button">
    <el-button
      v-hasPermi="[permissionPrefix + ':print']"
      icon="el-icon-printer"
      plain
      type="primary"
      @click="handlePrint"
    >打印</el-button>
    <fms-print-preview ref="printPreview" />
  </span>
</template>

<script>
import FmsPrintPreview from '@/views/fms/components/print/FmsPrintPreview.vue'
import { useFmsStore } from '@/views/fms/store/fms'
import { formatPeriodLabel } from '@/views/fms/ledger/utils'
import { buildFmsTablePrintHtml } from '@/views/fms/utils/print'

export default {
  name: 'FmsLedgerPrintButton',
  components: { FmsPrintPreview },
  props: {
    target: { type: String, required: true },
    title: { type: String, required: true },
    startMonth: { type: String, required: true },
    endMonth: { type: String, required: true },
    permissionPrefix: { type: String, default: 'fms:ledger:general' },
    centerText: { type: String, default: '' },
    beforePrint: { type: Function, default: null }
  },
  data() {
    return { fmsStore: useFmsStore() }
  },
  methods: {
    async handlePrint() {
      if (this.beforePrint) await this.beforePrint()
      await this.$nextTick()
      const tableElement = document.getElementById(this.target)
      if (!tableElement) {
        this.$message.error('未找到可打印的表格')
        return
      }
      this.$refs.printPreview.printHtml(buildFmsTablePrintHtml({
        title: this.title,
        companyName: (this.fmsStore.getAccountSet && this.fmsStore.getAccountSet.companyName) || '',
        periodLabel: formatPeriodLabel(this.startMonth, this.endMonth),
        centerText: this.centerText,
        tableElement
      }))
    }
  }
}
</script>

<style scoped>
.fms-ledger-print-button { margin-left: 10px; }
</style>
