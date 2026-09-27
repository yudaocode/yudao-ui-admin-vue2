<!-- WMS 盘库单打印 -->
<template>
  <el-dialog
    v-dialogDrag
    title="盘库单打印预览"
    :visible.sync="visible"
    width="1100px"
    append-to-body
  >
    <div
      id="wmsCheckOrderPrint"
      ref="printContent"
      v-loading="loading"
      class="print-content"
    >
      <div class="print-heading">
        <h2>盘库单</h2>
        <order-barcode :value="printData.no" label="盘库单号条码" />
      </div>
      <div class="print-meta">
        <div>盘库单号：{{ printData.no || "-" }}</div>
        <div>仓库：{{ printData.warehouseName || "-" }}</div>
        <div>
          盘库状态：{{
            getDictDataLabel(DICT_TYPE.WMS_ORDER_STATUS, printData.status) ||
              "-"
          }}
        </div>
        <div>单据日期：{{ formatDateOnly(printData.orderTime) }}</div>
        <div>
          盈亏数量：<span :class="getLossClass(printData.totalQuantity)">{{
            formatQuantity(printData.totalQuantity) || "-"
          }}</span>
        </div>
        <div>总金额：{{ formatPrice(printData.totalPrice) || "-" }}</div>
        <div>实际金额：{{ formatPrice(printData.actualPrice) || "-" }}</div>
        <div>
          实际盈亏金额：<span
            :class="getLossClass(getOrderDifferencePrice(printData))"
          >{{ formatPrice(getOrderDifferencePrice(printData)) || "-" }}</span>
        </div>
        <div class="print-wide">
          创建：{{ formatDate(printData.createTime) || "-" }} /
          {{ printData.creatorName || printData.creator || "-" }}
        </div>
        <div class="print-wide">
          更新：{{ formatDate(printData.updateTime) || "-" }} /
          {{ printData.updaterName || printData.updater || "-" }}
        </div>
        <div class="print-wide">备注：{{ printData.remark || "-" }}</div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>商品信息</th>
            <th>规格信息</th>
            <th class="text-right">账面库存</th>
            <th class="text-right">单价(元)</th>
            <th class="text-right">实际库存</th>
            <th class="text-right">实际金额(元)</th>
            <th class="text-right">盈亏数</th>
            <th class="text-right">实际盈亏金额(元)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="detail in printRows"
            :key="detail.id || detail.skuId"
          >
            <td>
              <div>{{ detail.itemName || "-" }}</div>
              <div
                v-if="detail.itemCode"
                class="sub-text"
              >
                编号：{{ detail.itemCode }}
              </div>
            </td>
            <td>
              <div>{{ detail.skuName || "-" }}</div>
              <div
                v-if="detail.skuCode"
                class="sub-text"
              >
                编号：{{ detail.skuCode }}
              </div>
            </td>
            <td class="text-right">
              {{ formatQuantity(detail.quantity) || "-" }}
            </td>
            <td class="text-right">{{ formatPrice(detail.price) || "-" }}</td>
            <td class="text-right">
              {{ formatQuantity(detail.checkQuantity) || "-" }}
            </td>
            <td class="text-right">
              {{ formatPrice(detail.actualPrice) || "-" }}
            </td>
            <td class="text-right">
              <span :class="getLossClass(detail.differenceQuantity)">{{
                formatQuantity(detail.differenceQuantity) || "-"
              }}</span>
            </td>
            <td class="text-right">
              <span :class="getLossClass(detail.differencePrice)">{{
                formatPrice(detail.differencePrice) || "-"
              }}</span>
            </td>
          </tr>
          <tr v-if="printRows.length">
            <td
              colspan="2"
              class="summary-cell"
            >合计</td>
            <td class="text-right summary-cell">
              {{ formatSumQuantity(printRows, (detail) => detail.quantity) }}
            </td>
            <td class="summary-cell" />
            <td class="text-right summary-cell">
              {{
                formatSumQuantity(printRows, (detail) => detail.checkQuantity)
              }}
            </td>
            <td class="text-right summary-cell">
              {{ formatSumPrice(printRows, (detail) => detail.actualPrice) }}
            </td>
            <td class="text-right summary-cell">
              <span :class="getLossClass(totalDifferenceQuantity)">{{
                formatQuantity(totalDifferenceQuantity)
              }}</span>
            </td>
            <td class="text-right summary-cell">
              <span :class="getLossClass(totalDifferencePrice)">{{
                formatPrice(totalDifferencePrice)
              }}</span>
            </td>
          </tr>
          <tr v-if="!printRows.length">
            <td
              colspan="8"
              class="empty-cell"
            >暂无明细</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="visible = false">取 消</el-button><el-button
        type="primary"
        icon="el-icon-printer"
        :disabled="loading"
        @click="handlePrint"
      >打 印</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { CheckOrderApi } from '@/api/wms/order/check'
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'
import { formatDate } from '@/utils'
import OrderBarcode from '@/views/wms/components/OrderBarcode.vue'
import {
  formatPrice,
  formatQuantity,
  formatSumPrice,
  formatSumQuantity,
  getLossClass,
  roundPrice,
  sumPrice,
  sumQuantity
} from '@/views/wms/utils/format'

export default {
  name: 'WmsCheckOrderPrint',
  components: { OrderBarcode },
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      printData: { details: [] }
    }
  },
  computed: {
    printRows() {
      return (this.printData.details || []).map((detail) => {
        const differenceQuantity = this.getDifferenceQuantity(detail)
        return Object.assign({}, detail, {
          actualPrice:
            detail.actualPrice == null
              ? this.getActualPrice(detail)
              : detail.actualPrice,
          differenceQuantity,
          differencePrice: this.getDifferencePrice(detail, differenceQuantity)
        })
      })
    },
    totalDifferenceQuantity() {
      return sumQuantity(this.printRows, (detail) => detail.differenceQuantity)
    },
    totalDifferencePrice() {
      return sumPrice(this.printRows, (detail) => detail.differencePrice)
    }
  },
  methods: {
    formatPrice,
    formatQuantity,
    formatSumPrice,
    formatSumQuantity,
    getLossClass,
    formatDate,
    getDictDataLabel,
    formatDateOnly(value) {
      const formatted = this.formatDate(value)
      return formatted ? formatted.slice(0, 10) : '-'
    },
    getDifferenceQuantity(detail) {
      return Number(detail.checkQuantity || 0) - Number(detail.quantity || 0)
    },
    getActualPrice(detail) {
      if (
        detail.checkQuantity === undefined ||
        detail.checkQuantity === null ||
        detail.price === undefined ||
        detail.price === null
      ) { return undefined }
      return roundPrice(Number(detail.checkQuantity) * Number(detail.price))
    },
    getDifferencePrice(detail, differenceQuantity) {
      if (detail.price === undefined || detail.price === null) return undefined
      return roundPrice(differenceQuantity * Number(detail.price))
    },
    getOrderDifferencePrice(order) {
      return roundPrice(
        Number(order.actualPrice || 0) - Number(order.totalPrice || 0)
      )
    },
    open(id) {
      this.visible = true
      this.loading = true
      return CheckOrderApi.getCheckOrder(id)
        .then((response) => {
          this.printData = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    print(id) {
      return this.open(id)
    },
    handlePrint() {
      const content = this.$refs.printContent
      if (!content) return window.print()
      const printWindow = window.open('', '_blank')
      if (!printWindow) { return this.$modal.msgWarning('浏览器阻止了打印窗口，请允许弹窗后重试') }
      printWindow.document.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>盘库单</title><style>body{margin:0;padding:12mm;color:#303133;font-family:Arial,"Microsoft YaHei",sans-serif}.print-heading{text-align:center;position:relative;margin-bottom:10px}.print-heading h2{margin:0}.print-number{position:absolute;right:0;top:0;font-size:12px}.print-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 24px;margin-bottom:12px;font-size:14px}.print-wide{grid-column:1 / span 3}.print-table{width:100%;border-collapse:collapse;font-size:13px}.print-table th,.print-table td{border:1px solid #dcdfe6;padding:8px;vertical-align:top}.print-table th,.summary-cell{background:#f5f7fa}.text-right{text-align:right}.sub-text{color:#606266;font-size:12px}.empty-cell{text-align:center}.text-red-500{color:#f56c6c}@page{size:auto;margin:12mm}</style></head><body>' +
          content.innerHTML +
          '</body></html>'
      )
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 300)
    }
  }
}
</script>

<style scoped>
.print-content {
  max-height: 65vh;
  overflow: auto;
  color: #303133;
}
.print-heading {
  position: relative;
  margin-bottom: 10px;
  text-align: center;
}
.print-heading h2 {
  margin: 0;
}
.print-number {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 12px;
}
.print-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 24px;
  margin-bottom: 12px;
  font-size: 14px;
}
.print-wide {
  grid-column: 1 / span 3;
}
.print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.print-table th,
.print-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  vertical-align: top;
}
.print-table th,
.summary-cell {
  background: #f5f7fa;
}
.text-right {
  text-align: right;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.empty-cell {
  text-align: center;
}
.text-red-500 {
  color: #f56c6c;
}
</style>
