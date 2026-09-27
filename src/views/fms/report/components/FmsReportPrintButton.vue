<template>
  <span class="fms-report-print-button">
    <el-button :disabled="disabled" icon="el-icon-printer" @click="handlePrint">打印</el-button>
    <fms-print-preview ref="printPreview" />
  </span>
</template>

<script>
import FmsPrintPreview from '@/views/fms/components/print/FmsPrintPreview.vue'
import { useFmsStore } from '@/views/fms/store/fms'
import { buildFmsTablePrintHtml } from '@/views/fms/utils/print'

export default {
  name: 'FmsReportPrintButton',
  components: { FmsPrintPreview },
  props: {
    disabled: { type: Boolean, default: false },
    periodLabel: { type: String, required: true },
    target: { type: String, required: true },
    title: { type: String, required: true }
  },
  data() {
    return { fmsStore: useFmsStore() }
  },
  methods: {
    handlePrint() {
      const tableElement = document.getElementById(this.target)
      if (!tableElement) {
        this.$message.error('未找到可打印的表格')
        return
      }
      this.$refs.printPreview.printHtml(buildFmsTablePrintHtml({
        title: this.title,
        companyName: (this.fmsStore.getAccountSet && this.fmsStore.getAccountSet.companyName) || '',
        periodLabel: this.periodLabel,
        footerLabels: ['单位负责人：', '会计负责人：', '制表人：'],
        tableElement
      }))
    }
  }
}
</script>

<style scoped>
.fms-report-print-button { display: inline-block; margin-left: 10px; }
</style>
