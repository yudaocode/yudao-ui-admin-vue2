<template>
  <div class="app-container">
    <doc-alert
      title="【库存】其它入库、其它出库"
      url="https://doc.iocoder.cn/erp/stock-in-out/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="76px"
    >
      <el-form-item
        label="出库单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入出库单号"
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
        label="出库时间"
        prop="outTime"
      >
        <el-date-picker
          v-model="queryParams.outTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="客户"
        prop="customerId"
      >
        <el-select
          v-model="queryParams.customerId"
          clearable
          filterable
          placeholder="请选择客户"
          style="width: 220px"
        >
          <el-option
            v-for="item in customerList"
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
        label="创建人"
        prop="creator"
      >
        <el-select
          v-model="queryParams.creator"
          clearable
          filterable
          placeholder="请选择创建人"
          style="width: 220px"
        >
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择状态"
          style="width: 220px"
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.ERP_AUDIT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="queryParams.remark"
          clearable
          placeholder="请输入备注"
          style="width: 220px"
          @keyup.enter.native="handleQuery"
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
          v-hasPermi="['erp:stock-out:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:stock-out:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-hasPermi="['erp:stock-out:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          :disabled="selectionList.length === 0"
          @click="handleDelete(selectionList.map(item => item.id))"
        >删除</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        label="选择"
        type="selection"
        width="48"
      />
      <el-table-column
        label="出库单号"
        align="center"
        prop="no"
        min-width="180"
      />
      <el-table-column
        label="产品信息"
        align="center"
        prop="productNames"
        min-width="200"
      />
      <el-table-column
        label="客户"
        align="center"
        prop="customerName"
        min-width="120"
      />
      <el-table-column
        label="出库时间"
        align="center"
        prop="outTime"
        width="120"
        :formatter="dateFormatter2"
      />
      <el-table-column
        label="创建人"
        align="center"
        prop="creatorName"
        min-width="100"
      />
      <el-table-column
        label="数量"
        align="center"
        prop="totalCount"
        width="100"
        :formatter="erpCountTableColumnFormatter"
      />
      <el-table-column
        label="金额"
        align="center"
        prop="totalPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="状态"
        align="center"
        fixed="right"
        width="90"
        prop="status"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.ERP_AUDIT_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="220"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['erp:stock-out:query']"
            size="mini"
            type="text"
            @click="openForm('detail', scope.row.id)"
          >详情</el-button>
          <el-button
            v-hasPermi="['erp:stock-out:update']"
            size="mini"
            type="text"
            :disabled="scope.row.status === 20"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === 10"
            v-hasPermi="['erp:stock-out:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 20)"
          >审批</el-button>
          <el-button
            v-else
            v-hasPermi="['erp:stock-out:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 10)"
          >反审批</el-button>
          <el-button
            v-hasPermi="['erp:stock-out:delete']"
            size="mini"
            type="text"
            @click="handleDelete([scope.row.id])"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <StockOutForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { getCustomerSimpleList } from '@/api/erp/sale/customer'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import { getSimpleUserList } from '@/api/system/user'
import { StockOutApi } from '@/api/erp/stock/out'
import download from '@/plugins/download'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  dateFormatter2,
  erpCountTableColumnFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'
import StockOutForm from './StockOutForm.vue'

export default {
  name: 'ErpStockOut',
  components: { StockOutForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      total: 0,
      list: [],
      selectionList: [],
      productList: [],
      customerList: [],
      warehouseList: [],
      userList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        productId: undefined,
        customerId: undefined,
        warehouseId: undefined,
        outTime: [],
        status: undefined,
        remark: undefined,
        creator: undefined
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    getDictDatas,
    dateFormatter2,
    erpCountTableColumnFormatter,
    erpPriceTableColumnFormatter,
    loadOptions() {
      return Promise.all([
        getProductSimpleList(),
        getWarehouseSimpleList(),
        getCustomerSimpleList(),
        getSimpleUserList()
      ])
        .then(([productResponse, warehouseResponse, customerResponse, userResponse]) => {
          this.productList = productResponse.data
          this.warehouseList = warehouseResponse.data
          this.customerList = customerResponse.data
          this.userList = userResponse.data
        })
    },
    getList() {
      this.loading = true
      return StockOutApi.getStockOutPage(this.queryParams)
        .then((response) => {
          this.list = response.data.list
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleSelectionChange(rows) {
      this.selectionList = rows || []
    },
    handleDelete(ids) {
      const values = (ids || []).filter((id) => id !== undefined && id !== null)
      if (!values.length) return
      this.$modal.delConfirm()
        .then(() => StockOutApi.deleteStockOut(values))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.selectionList = this.selectionList.filter((item) => !values.includes(item.id))
          this.getList()
        })
        .catch(() => {})
    },
    handleUpdateStatus(id, status) {
      const action = status === 20 ? '审批' : '反审批'
      this.$modal.confirm('确定' + action + '该出库单吗？')
        .then(() => StockOutApi.updateStockOutStatus(id, status))
        .then(() => {
          this.$modal.msgSuccess(action + '成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal.exportConfirm()
        .then(() => {
          this.exportLoading = true
          return StockOutApi.exportStockOut(this.queryParams)
        })
        .then((response) => download.excel(response.data, '其它出库单.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
}
</script>
