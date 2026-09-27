<!-- WMS 盘库单详情 -->
<template>
  <el-dialog
    v-dialogDrag
    title="盘库单详情"
    :visible.sync="visible"
    width="1200px"
    append-to-body
  >
    <div
      v-loading="loading"
      class="check-detail"
    >
      <div class="section-title">单据信息</div>
      <el-descriptions
        :column="2"
        border
        size="small"
        label-class-name="desc-label"
      >
        <el-descriptions-item label="盘库单号">{{
          detailData.no || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{
          detailData.warehouseName || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="单据日期">{{
          formatDateOnly(detailData.orderTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="单据状态"><dict-tag
          v-if="hasValue(detailData.status)"
          :type="DICT_TYPE.WMS_ORDER_STATUS"
          :value="detailData.status"
        /><span v-else>-</span></el-descriptions-item>
        <el-descriptions-item label="盈亏数量"><span :class="getLossClass(detailData.totalQuantity)">{{
          formatQuantity(detailData.totalQuantity) || "-"
        }}</span></el-descriptions-item>
        <el-descriptions-item label="总金额">{{
          formatPrice(detailData.totalPrice) || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="实际金额">{{
          formatPrice(detailData.actualPrice) || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="实际盈亏金额"><span :class="getLossClass(getOrderDifferencePrice(detailData))">{{
          formatPrice(getOrderDifferencePrice(detailData)) || "-"
        }}</span></el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(detailData.createTime) || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{
          detailData.creatorName || detailData.creator || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(detailData.updateTime) || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{
          detailData.updaterName || detailData.updater || "-"
        }}</el-descriptions-item>
        <el-descriptions-item
          label="备注"
          :span="2"
        >{{
          detailData.remark || "-"
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="section-title section-title-spaced">商品明细</div>
      <el-table
        :data="detailRows"
        border
        size="small"
        show-summary
        :summary-method="getSummaries"
        empty-text="暂无商品明细"
      >
        <el-table-column
          label="商品信息"
          min-width="200"
        ><template slot-scope="scope"><div>{{ scope.row.itemName || "-" }}</div>
          <span
            v-if="scope.row.itemCode"
            class="sub-text"
          >商品编号：{{ scope.row.itemCode }}</span></template></el-table-column>
        <el-table-column
          label="规格信息"
          min-width="200"
        ><template slot-scope="scope"><div>{{ scope.row.skuName || "-" }}</div>
          <span
            v-if="scope.row.skuCode"
            class="sub-text"
          >规格编号：{{ scope.row.skuCode }}</span></template></el-table-column>
        <el-table-column
          label="账面数量"
          prop="quantity"
          width="120"
          align="right"
        ><template slot-scope="scope">{{
          formatQuantity(scope.row.quantity) || "-"
        }}</template></el-table-column>
        <el-table-column
          label="单价(元)"
          prop="price"
          width="130"
          align="right"
        ><template slot-scope="scope">{{
          formatPrice(scope.row.price) || "-"
        }}</template></el-table-column>
        <el-table-column
          label="实盘数量"
          prop="checkQuantity"
          width="120"
          align="right"
        ><template slot-scope="scope">{{
          formatQuantity(scope.row.checkQuantity) || "-"
        }}</template></el-table-column>
        <el-table-column
          label="实际金额(元)"
          prop="actualPrice"
          width="140"
          align="right"
        ><template slot-scope="scope">{{
          formatPrice(getActualPrice(scope.row)) || "-"
        }}</template></el-table-column>
        <el-table-column
          label="盈亏数量"
          prop="differenceQuantity"
          width="120"
          align="right"
        ><template slot-scope="scope"><span :class="getLossClass(getDifferenceQuantity(scope.row))">{{
          formatQuantity(getDifferenceQuantity(scope.row)) || "-"
        }}</span></template></el-table-column>
        <el-table-column
          label="实际盈亏金额(元)"
          prop="differencePrice"
          width="160"
          align="right"
        ><template slot-scope="scope"><span :class="getLossClass(getDifferencePrice(scope.row))">{{
          formatPrice(getDifferencePrice(scope.row)) || "-"
        }}</span></template></el-table-column>
      </el-table>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="visible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { CheckOrderApi } from '@/api/wms/order/check'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils'
import {
  formatPrice,
  formatQuantity,
  formatSumPrice,
  formatSumQuantity,
  getLossClass,
  multiplyPrice,
  roundPrice
} from '@/views/wms/utils/format'

export default {
  name: 'WmsCheckOrderDetail',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      detailData: { details: [] }
    }
  },
  computed: {
    detailRows() {
      return (this.detailData.details || []).map((detail) =>
        Object.assign({}, detail, {
          actualPrice:
            detail.actualPrice == null
              ? multiplyPrice(detail.checkQuantity, detail.price)
              : detail.actualPrice
        })
      )
    }
  },
  methods: {
    formatPrice,
    formatQuantity,
    formatSumPrice,
    formatSumQuantity,
    formatDate,
    getLossClass,
    hasValue(value) {
      return value !== undefined && value !== null
    },
    formatDateOnly(value) {
      const formatted = this.formatDate(value)
      return formatted ? formatted.slice(0, 10) : '-'
    },
    getOrderDifferencePrice(order) {
      return roundPrice(
        Number(order.actualPrice || 0) - Number(order.totalPrice || 0)
      )
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
    getDifferencePrice(detail) {
      if (detail.price === undefined || detail.price === null) return undefined
      return roundPrice(
        this.getDifferenceQuantity(detail) * Number(detail.price)
      )
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'quantity') { return formatSumQuantity(data, (detail) => detail.quantity) }
        if (column.property === 'checkQuantity') { return formatSumQuantity(data, (detail) => detail.checkQuantity) }
        if (column.property === 'actualPrice') { return formatSumPrice(data, (detail) => this.getActualPrice(detail)) }
        if (column.property === 'differenceQuantity') {
          return formatQuantity(
            data.reduce(
              (sum, detail) => sum + this.getDifferenceQuantity(detail),
              0
            )
          )
        }
        if (column.property === 'differencePrice') {
          return formatSumPrice(data, (detail) =>
            this.getDifferencePrice(detail)
          )
        }
        return ''
      })
    },
    open(id) {
      this.visible = true
      this.loading = true
      return CheckOrderApi.getCheckOrder(id)
        .then((response) => {
          this.detailData = response.data
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.check-detail {
  min-height: 180px;
}
.section-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}
.section-title-spaced {
  margin-top: 24px;
}
::v-deep .desc-label {
  font-weight: bold;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.text-red-500 {
  color: #f56c6c;
}
</style>
