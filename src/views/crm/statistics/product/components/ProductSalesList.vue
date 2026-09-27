<!-- 产品销售情况统计 -->
<template>
  <el-card
    shadow="never"
    class="product-sales-list"
  >
    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      :span-method="spanMethod"
      :row-class-name="getRowClassName"
      :cell-class-name="getCellClassName"
      border
    >
      <el-table-column
        label="序号"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.rowType === ProductSalesRowTypeEnum.DETAIL">
            {{ scope.row.index }}
          </span>
          <span v-else>{{ scope.row.summaryLabel }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="产品分类"
        align="center"
        prop="categoryName"
        min-width="140"
      />
      <el-table-column
        label="产品名称"
        align="center"
        prop="productName"
        min-width="180"
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.rowType === ProductSalesRowTypeEnum.DETAIL"
            :underline="false"
            type="primary"
            @click="openProduct(scope.row.productId)"
          >
            {{ scope.row.productName }}
          </el-link>
          <span v-else>{{ scope.row.summaryLabel }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="合同编号"
        align="center"
        prop="contractNo"
        min-width="160"
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.rowType === ProductSalesRowTypeEnum.DETAIL"
            :underline="false"
            type="primary"
            @click="openContract(scope.row.contractId)"
          >
            {{ scope.row.contractNo }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="合同名称"
        align="center"
        prop="contractName"
        min-width="180"
      />
      <el-table-column
        label="负责人"
        align="center"
        prop="ownerUserName"
        min-width="120"
      />
      <el-table-column
        label="客户名称"
        align="center"
        prop="customerName"
        min-width="180"
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.rowType === ProductSalesRowTypeEnum.DETAIL && scope.row.customerId"
            :underline="false"
            type="primary"
            @click="openCustomer(scope.row.customerId)"
          >
            {{ scope.row.customerName }}
          </el-link>
          <span v-else-if="scope.row.rowType === ProductSalesRowTypeEnum.DETAIL">
            {{ scope.row.customerName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="销售单价（元）"
        align="right"
        prop="productPrice"
        min-width="140"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.rowType === ProductSalesRowTypeEnum.DETAIL">
            {{ erpPriceInputFormatter(scope.row.productPrice) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="数量"
        align="right"
        prop="productCount"
        min-width="120"
      />
      <el-table-column
        label="订单产品小计（元）"
        align="right"
        prop="productTotalPrice"
        min-width="160"
      >
        <template slot-scope="scope">
          {{ erpPriceInputFormatter(scope.row.productTotalPrice) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import { StatisticsProductApi } from '@/api/crm/statistics/product'
import { erpPriceInputFormatter } from '@/utils'

const ProductSalesRowTypeEnum = Object.freeze({
  DETAIL: 'detail',
  PRODUCT_SUMMARY: 'productSummary',
  CATEGORY_SUMMARY: 'categorySummary'
})

const SUMMARY_LABEL_COLUMN_INDEX = 0
const CATEGORY_COLUMN_INDEX = 1
const PRODUCT_COLUMN_INDEX = 2
const CONTRACT_NO_COLUMN_INDEX = 3
const CUSTOMER_COLUMN_INDEX = 6
const SUMMARY_VALUE_COLUMN_INDEX = 8
const LINK_COLUMN_INDEXES = Object.freeze([
  PRODUCT_COLUMN_INDEX,
  CONTRACT_NO_COLUMN_INDEX,
  CUSTOMER_COLUMN_INDEX
])

function getNumber(value) {
  return Number(value || 0)
}

function getCategoryKey(item) {
  return item.categoryId || 'category-' + item.categoryName
}

function getProductKey(item) {
  return item.productId
}

function buildProductSummaryRow(rows) {
  const first = rows[0] || {}
  return {
    rowType: ProductSalesRowTypeEnum.PRODUCT_SUMMARY,
    summaryLabel: (first.productName || '产品') + ' 小计',
    productCount: rows.reduce((sum, item) => sum + getNumber(item.productCount), 0),
    productTotalPrice: rows.reduce((sum, item) => sum + getNumber(item.productTotalPrice), 0)
  }
}

function buildCategorySummaryRow(rows) {
  const first = rows[0] || {}
  return {
    rowType: ProductSalesRowTypeEnum.CATEGORY_SUMMARY,
    summaryLabel: (first.categoryName || '未分类') + ' 小计',
    productCount: rows.reduce((sum, item) => sum + getNumber(item.productCount), 0),
    productTotalPrice: rows.reduce((sum, item) => sum + getNumber(item.productTotalPrice), 0)
  }
}

function buildProductGroups(rows) {
  const result = []
  let index = 0
  while (index < rows.length) {
    const productKey = getProductKey(rows[index])
    const productRows = []
    while (index < rows.length && getProductKey(rows[index]) === productKey) {
      productRows.push(rows[index])
      index += 1
    }
    result.push(productRows)
  }
  return result
}

function buildList(data) {
  const result = []
  let index = 0
  let rowIndex = 1
  while (index < data.length) {
    const categoryStartIndex = result.length
    const categoryKey = getCategoryKey(data[index])
    const categoryRows = []

    while (index < data.length && getCategoryKey(data[index]) === categoryKey) {
      categoryRows.push(data[index])
      index += 1
    }

    const productGroups = buildProductGroups(categoryRows)
    const productSummaryRows = []
    productGroups.forEach(productRows => {
      const productStartIndex = result.length
      productRows.forEach(row => {
        result.push(Object.assign({}, row, {
          rowType: ProductSalesRowTypeEnum.DETAIL,
          index: rowIndex++
        }))
      })
      result[productStartIndex].productRowspan = productRows.length
      if (productGroups.length > 1 && productRows.length > 1) {
        productSummaryRows.push(buildProductSummaryRow(productRows))
      }
    })

    if (result.length > categoryStartIndex) {
      result[categoryStartIndex].categoryRowspan = categoryRows.length
    }
    result.push.apply(result, productSummaryRows)
    result.push(buildCategorySummaryRow(categoryRows))
  }
  return result
}

export default {
  name: 'CrmStatisticsProductSalesList',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      ProductSalesRowTypeEnum,
      loading: false,
      list: [],
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    erpPriceInputFormatter,
    getApiParams() {
      return {
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        categoryId: this.queryParams.categoryId,
        productId: this.queryParams.productId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticsProductApi.getProductSalesList(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        this.list = buildList(data)
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    openContract(id) {
      if (!id) return
      this.$router.push({ name: 'CrmContractDetail', params: { id }}).catch(() => {})
    },
    openCustomer(id) {
      if (!id) return
      this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {})
    },
    openProduct(id) {
      if (!id) return
      this.$router.push({ name: 'CrmProductDetail', params: { id }}).catch(() => {})
    },
    spanMethod({ row, columnIndex }) {
      if (
        row.rowType === ProductSalesRowTypeEnum.PRODUCT_SUMMARY ||
        row.rowType === ProductSalesRowTypeEnum.CATEGORY_SUMMARY
      ) {
        if (columnIndex === SUMMARY_LABEL_COLUMN_INDEX) {
          return { rowspan: 1, colspan: SUMMARY_VALUE_COLUMN_INDEX }
        }
        if (columnIndex > SUMMARY_LABEL_COLUMN_INDEX && columnIndex < SUMMARY_VALUE_COLUMN_INDEX) {
          return { rowspan: 0, colspan: 0 }
        }
      }
      if (columnIndex === CATEGORY_COLUMN_INDEX) {
        if (row.rowType !== ProductSalesRowTypeEnum.DETAIL) {
          return { rowspan: 0, colspan: 0 }
        }
        return row.categoryRowspan
          ? { rowspan: row.categoryRowspan, colspan: 1 }
          : { rowspan: 0, colspan: 0 }
      }
      if (columnIndex === PRODUCT_COLUMN_INDEX) {
        if (row.rowType !== ProductSalesRowTypeEnum.DETAIL) return undefined
        return row.productRowspan
          ? { rowspan: row.productRowspan, colspan: 1 }
          : { rowspan: 0, colspan: 0 }
      }
      return undefined
    },
    getRowClassName({ row }) {
      if (row.rowType === ProductSalesRowTypeEnum.PRODUCT_SUMMARY) {
        return 'product-summary-row'
      }
      if (row.rowType === ProductSalesRowTypeEnum.CATEGORY_SUMMARY) {
        return 'category-summary-row'
      }
      return ''
    },
    getCellClassName({ row, columnIndex }) {
      return row.rowType === ProductSalesRowTypeEnum.DETAIL &&
        LINK_COLUMN_INDEXES.indexOf(columnIndex) !== -1
        ? 'is-link-cell'
        : ''
    }
  }
}
</script>

<style scoped>
.product-sales-list ::v-deep .product-summary-row > td {
  background-color: #fff9f2 !important;
  font-weight: 600;
}

.product-sales-list ::v-deep .category-summary-row > td {
  background-color: #fff3e8 !important;
  font-weight: 600;
}

.product-sales-list ::v-deep .is-link-cell {
  color: #409eff;
  cursor: pointer;
}
</style>
