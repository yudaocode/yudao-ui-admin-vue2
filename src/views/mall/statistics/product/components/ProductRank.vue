<template>
  <el-card
    shadow="never"
    class="product-rank"
  >
    <div
      slot="header"
      class="product-rank__header"
    >
      <span class="product-rank__title">商品排行</span>
      <ProductDateRangePicker @change="handleDateRangeChange" />
    </div>

    <el-table
      v-loading="loading"
      :data="list"
      row-key="spuId"
      @sort-change="handleSortChange"
    >
      <el-table-column
        label="商品 ID"
        prop="spuId"
        min-width="70"
      />
      <el-table-column
        label="商品图片"
        align="center"
        prop="picUrl"
        width="80"
      >
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            class="product-rank__image"
          />
          <span
            v-else
            class="product-rank__image-empty"
          >--</span>
        </template>
      </el-table-column>
      <el-table-column
        label="商品名称"
        prop="name"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        label="浏览量"
        prop="browseCount"
        min-width="90"
        sortable="custom"
      />
      <el-table-column
        label="访客数"
        prop="browseUserCount"
        min-width="90"
        sortable="custom"
      />
      <el-table-column
        label="加购件数"
        prop="cartCount"
        min-width="105"
        sortable="custom"
      />
      <el-table-column
        label="下单件数"
        prop="orderCount"
        min-width="105"
        sortable="custom"
      />
      <el-table-column
        label="支付件数"
        prop="orderPayCount"
        min-width="105"
        sortable="custom"
      />
      <el-table-column
        label="支付金额"
        prop="orderPayPrice"
        min-width="105"
        sortable="custom"
        :formatter="formatFenToYuan"
      />
      <el-table-column
        label="收藏数"
        prop="favoriteCount"
        min-width="90"
        sortable="custom"
      />
      <el-table-column
        label="访客-支付转化率(%)"
        prop="browseConvertPercent"
        min-width="180"
        sortable="custom"
        :formatter="formatConvertRate"
      />
    </el-table>

    <Pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="loadRanking"
    />
  </el-card>
</template>

<script>
import { ProductStatisticsApi } from '@/api/mall/statistics/product'
import ProductDateRangePicker from './ProductDateRangePicker.vue'

export default {
  name: 'ProductRank',
  components: { ProductDateRangePicker },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        times: [],
        sortingFields: []
      }
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    handleDateRangeChange(times) {
      this.queryParams.times = Array.isArray(times) ? times.slice(0, 2) : []
      this.queryParams.pageNo = 1
      this.loadRanking()
    },
    handleSortChange({ prop, order }) {
      this.queryParams.sortingFields = prop && order
        ? [{ field: prop, order: order === 'ascending' ? 'asc' : 'desc' }]
        : []
      this.queryParams.pageNo = 1
      this.loadRanking()
    },
    formatFenToYuan(row, column, cellValue) {
      const value = Number(cellValue)
      return '￥' + (Number.isFinite(value) ? (value / 100).toFixed(2) : '0.00')
    },
    formatConvertRate(row, column, cellValue) {
      const value = Number(cellValue)
      return (Number.isFinite(value) ? value : 0) + '%'
    },
    async loadRanking() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await ProductStatisticsApi.getProductStatisticsRankPage({
          ...this.queryParams,
          times: this.queryParams.times.slice(),
          sortingFields: this.queryParams.sortingFields.map(item => ({ ...item }))
        })
        if (requestId !== this.requestSequence) return
        const page = response.data
        this.list = page.list
        this.total = page.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.product-rank__header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.product-rank__title {
  flex: none;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.product-rank__image {
  display: block;
  width: 30px;
  height: 30px;
  margin: 0 auto;
  border-radius: 3px;
}

.product-rank__image-empty {
  color: #c0c4cc;
}

@media (max-width: 720px) {
  .product-rank__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
