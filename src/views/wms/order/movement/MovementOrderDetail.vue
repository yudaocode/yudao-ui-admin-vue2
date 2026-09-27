<template>
  <el-dialog
    title="移库单详情"
    :visible.sync="visible"
    width="1050px"
    append-to-body
  >
    <div v-loading="loading">
      <el-descriptions
        v-if="detailData"
        :column="2"
        border
        size="small"
      ><el-descriptions-item label="移库单号">{{
        detailData.no || "-"
      }}</el-descriptions-item><el-descriptions-item label="状态"><dict-tag
        :type="DICT_TYPE.WMS_ORDER_STATUS"
        :value="detailData.status"
      /></el-descriptions-item><el-descriptions-item label="来源仓库">{{
        detailData.sourceWarehouseName || "-"
      }}</el-descriptions-item><el-descriptions-item label="目标仓库">{{
        detailData.targetWarehouseName || "-"
      }}</el-descriptions-item><el-descriptions-item label="单据日期">{{
        formatDate(detailData.orderTime) || "-"
      }}</el-descriptions-item><el-descriptions-item label="总数量">{{
        formatQuantity(detailData.totalQuantity) || "-"
      }}</el-descriptions-item><el-descriptions-item label="总金额">{{
        formatPrice(detailData.totalPrice) || "-"
      }}</el-descriptions-item><el-descriptions-item label="备注">{{
        detailData.remark || "-"
      }}</el-descriptions-item></el-descriptions>
      <el-table
        v-if="detailData"
        :data="detailData.details || []"
        border
        size="small"
        class="detail-table"
        show-summary
        :summary-method="getSummaries"
      ><el-table-column
        label="商品"
        prop="itemName"
        min-width="190"
      /><el-table-column
        label="规格"
        prop="skuName"
        min-width="190"
      /><el-table-column
        label="数量"
        prop="quantity"
        width="110"
        align="right"
      ><template slot-scope="scope">{{
        formatQuantity(scope.row.quantity)
      }}</template></el-table-column><el-table-column
        label="单价(元)"
        prop="price"
        width="120"
        align="right"
      ><template slot-scope="scope">{{
        formatPrice(scope.row.price) || "-"
      }}</template></el-table-column><el-table-column
        label="金额(元)"
        prop="totalPrice"
        width="120"
        align="right"
      ><template slot-scope="scope">{{
        formatPrice(
          scope.row.totalPrice ||
            multiplyPrice(scope.row.quantity, scope.row.price)
        ) || "-"
      }}</template></el-table-column></el-table>
    </div>
  </el-dialog>
</template>

<script>
import { MovementOrderApi } from '@/api/wms/order/movement'
import { DICT_TYPE } from '@/utils/dict'
import {
  formatQuantity,
  formatPrice,
  multiplyPrice,
  sumQuantity,
  sumPrice
} from '@/views/wms/utils/format'

export default {
  name: 'WmsMovementOrderDetail',
  data() {
    return { DICT_TYPE, visible: false, loading: false, detailData: null }
  },
  methods: {
    formatQuantity,
    formatPrice,
    multiplyPrice,
    open(id) {
      this.visible = true
      this.loading = true
      return MovementOrderApi.getMovementOrder(id)
        .then((response) => {
          this.detailData = response.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime())
        ? ''
        : date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0')
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'quantity') { return formatQuantity(sumQuantity(data, (item) => item.quantity)) }
        if (column.property === 'totalPrice') {
          return formatPrice(
            sumPrice(
              data,
              (item) =>
                item.totalPrice || multiplyPrice(item.quantity, item.price)
            )
          )
        }
        return ''
      })
    }
  }
}
</script>

<style scoped>
.detail-table {
  margin-top: 16px;
}
</style>
