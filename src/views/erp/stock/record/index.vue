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
      <el-form-item
        label="业务类型"
        prop="bizType"
      >
        <el-select
          v-model="queryParams.bizType"
          clearable
          placeholder="请选择业务类型"
          style="width: 220px"
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.ERP_STOCK_RECORD_BIZ_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="业务单号"
        prop="bizNo"
      >
        <el-input
          v-model="queryParams.bizNo"
          clearable
          placeholder="请输入业务单号"
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
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
          v-hasPermi="['erp:stock-record:export']"
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
    >
      <el-table-column
        label="产品名称"
        align="center"
        prop="productName"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="产品分类"
        align="center"
        prop="categoryName"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="产品单位"
        align="center"
        prop="unitName"
        min-width="90"
      />
      <el-table-column
        label="仓库名称"
        align="center"
        prop="warehouseName"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="业务类型"
        align="center"
        prop="bizType"
        min-width="130"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.ERP_STOCK_RECORD_BIZ_TYPE"
            :value="scope.row.bizType"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="业务单号"
        align="center"
        prop="bizNo"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        label="出入库时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="出入库数量"
        align="center"
        prop="count"
        :formatter="erpCountTableColumnFormatter"
        min-width="110"
      />
      <el-table-column
        label="库存量"
        align="center"
        prop="totalCount"
        :formatter="erpCountTableColumnFormatter"
        min-width="100"
      />
      <el-table-column
        label="操作人"
        align="center"
        prop="creatorName"
        min-width="100"
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
import { StockRecordApi } from '@/api/erp/stock/record'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import download from '@/plugins/download'
import { dateFormatter, erpCountTableColumnFormatter } from '@/utils'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: 'ErpStockRecord',
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      activatedOnce: false,
      total: 0,
      list: [],
      productList: [],
      warehouseList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        productId: undefined,
        warehouseId: undefined,
        bizType: undefined,
        bizNo: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  activated() {
    if (this.activatedOnce) this.getList()
    this.activatedOnce = true
  },
  methods: {
    getDictDatas,
    dateFormatter,
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
      return StockRecordApi.getStockRecordPage(this.queryParams).then(response => {
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
      this.$modal.confirm('是否确认导出所有产品库存明细?').then(() => {
        this.exportLoading = true
        return StockRecordApi.exportStockRecord(this.queryParams)
      }).then(response => {
        download.excel(response.data, '产品库存明细.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    }
  }
}
</script>
