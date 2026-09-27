<!-- ERP 产品库存列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【库存】产品库存、库存明细"
      url="https://doc.iocoder.cn/erp/stock/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="76px"
    >
      <el-form-item
        label="产品"
        prop="productId"
      >
        <el-select
          v-model="queryParams.productId"
          clearable
          filterable
          placeholder="请选择产品"
          style="width: 220px"
        >
          <el-option
            v-for="item in productList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="仓库"
        prop="warehouseId"
      >
        <el-select
          v-model="queryParams.warehouseId"
          clearable
          filterable
          placeholder="请选择仓库"
          style="width: 220px"
        >
          <el-option
            v-for="item in warehouseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          v-hasPermi="['erp:stock:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="产品名称"
        align="center"
        prop="productName"
        min-width="160"
      />
      <el-table-column
        label="产品单位"
        align="center"
        prop="unitName"
        min-width="90"
      />
      <el-table-column
        label="产品分类"
        align="center"
        prop="categoryName"
        min-width="120"
      />
      <el-table-column
        label="库存量"
        align="center"
        prop="count"
        min-width="100"
        :formatter="erpCountTableColumnFormatter"
      />
      <el-table-column
        label="仓库"
        align="center"
        prop="warehouseName"
        min-width="140"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { StockApi } from '@/api/erp/stock/stock'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import download from '@/plugins/download'
import { erpCountTableColumnFormatter } from '@/utils'

export default {
  name: 'ErpStock',
  data() {
    return {
      loading: true,
      exportLoading: false,
      total: 0,
      list: [],
      productList: [],
      warehouseList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        productId: undefined,
        warehouseId: undefined
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    erpCountTableColumnFormatter,
    loadOptions() {
      return Promise.all([
        getProductSimpleList(),
        getWarehouseSimpleList()
      ]).then(([productResponse, warehouseResponse]) => {
        this.productList = productResponse.data
        this.warehouseList = warehouseResponse.data
      })
    },
    getList() {
      this.loading = true
      return StockApi.getStockPage(this.queryParams).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有产品库存数据项?').then(() => {
        this.exportLoading = true
        return StockApi.exportStock(this.queryParams)
      }).then((response) => {
        download.excel(response.data, '产品库存.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    }
  }
}
</script>
