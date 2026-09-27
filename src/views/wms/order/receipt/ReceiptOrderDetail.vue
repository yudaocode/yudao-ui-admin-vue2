<template>
  <el-dialog
    v-dialogDrag
    title="入库单详情"
    :visible.sync="visible"
    width="1000px"
    append-to-body
  >
    <div
      v-loading="loading"
      class="receipt-detail"
    >
      <div class="section-title">单据信息</div>
      <el-descriptions
        :column="2"
        border
        size="small"
        label-class-name="desc-label"
      >
        <el-descriptions-item label="入库单号">{{
          detailData.no || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="入库类型">
          <dict-tag
            v-if="hasValue(detailData.type)"
            :type="DICT_TYPE.WMS_RECEIPT_ORDER_TYPE"
            :value="detailData.type"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="仓库">{{
          detailData.warehouseName || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="单据状态">
          <dict-tag
            v-if="hasValue(detailData.status)"
            :type="DICT_TYPE.WMS_ORDER_STATUS"
            :value="detailData.status"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="单据日期">
          {{ formatDateOnly(detailData.orderTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商">{{
          detailData.merchantName || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="业务单号">{{
          detailData.bizOrderNo || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="总数量">
          {{ formatQuantity(detailData.totalQuantity) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="总金额">
          {{ formatPrice(detailData.totalPrice) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(detailData.createTime) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ detailData.creatorName || detailData.creator || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(detailData.updateTime) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="更新人">
          {{ detailData.updaterName || detailData.updater || "-" }}
        </el-descriptions-item>
        <el-descriptions-item
          label="备注"
          :span="2"
        >
          {{ detailData.remark || "-" }}
        </el-descriptions-item>
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
        >
          <template slot-scope="scope">
            <div>{{ scope.row.itemName || "-" }}</div>
            <span
              v-if="scope.row.itemCode"
              class="sub-text"
            >商品编号：{{ scope.row.itemCode }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="规格信息"
          min-width="200"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.skuName || "-" }}</div>
            <span
              v-if="scope.row.skuCode"
              class="sub-text"
            >规格编号：{{ scope.row.skuCode }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="数量"
          prop="quantity"
          width="120"
          align="right"
        >
          <template slot-scope="scope">{{
            formatQuantity(scope.row.quantity) || "-"
          }}</template>
        </el-table-column>
        <el-table-column
          label="单位"
          prop="unit"
          width="90"
          align="center"
        />
        <el-table-column
          label="单价(元)"
          prop="price"
          width="130"
          align="right"
        >
          <template slot-scope="scope">{{
            formatPrice(scope.row.price) || "-"
          }}</template>
        </el-table-column>
        <el-table-column
          label="金额(元)"
          prop="totalPrice"
          width="130"
          align="right"
        >
          <template slot-scope="scope">{{
            formatPrice(scope.row.totalPrice) || "-"
          }}</template>
        </el-table-column>
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
import { ReceiptOrderApi } from '@/api/wms/order/receipt'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils'
import {
  formatPrice,
  formatQuantity,
  formatSumPrice,
  formatSumQuantity,
  multiplyPrice
} from '@/views/wms/utils/format'

export default {
  name: 'WmsReceiptOrderDetail',
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
          totalPrice:
            detail.totalPrice == null
              ? multiplyPrice(detail.quantity, detail.price)
              : detail.totalPrice
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
    hasValue(value) {
      return value !== undefined && value !== null
    },
    formatDateOnly(value) {
      const formatted = this.formatDate(value)
      return formatted ? formatted.slice(0, 10) : '-'
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'quantity') {
          return formatSumQuantity(data, (detail) => detail.quantity)
        }
        if (column.property === 'totalPrice') {
          return formatSumPrice(data, (detail) => detail.totalPrice)
        }
        return ''
      })
    },
    open(id) {
      this.visible = true
      this.loading = true
      return ReceiptOrderApi.getReceiptOrder(id)
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
.receipt-detail {
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
</style>
