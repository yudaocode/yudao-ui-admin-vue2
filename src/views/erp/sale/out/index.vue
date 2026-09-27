<template>
  <div class="app-container">
    <doc-alert
      title="【销售】销售订单、出库、退货"
      url="https://doc.iocoder.cn/erp/sale/"
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
        label="关联订单"
        prop="orderNo"
      >
        <el-input
          v-model="queryParams.orderNo"
          clearable
          placeholder="请输入关联订单"
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="结算账户"
        prop="accountId"
      >
        <el-select
          v-model="queryParams.accountId"
          clearable
          filterable
          placeholder="请选择结算账户"
          style="width: 220px"
        >
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="收款状态"
        prop="receiptStatus"
      >
        <el-select
          v-model="queryParams.receiptStatus"
          clearable
          placeholder="请选择有款状态"
          style="width: 220px"
        >
          <el-option
            label="未收款"
            value="0"
          />
          <el-option
            label="部分收款"
            value="1"
          />
          <el-option
            label="全部收款"
            value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="审核状态"
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
          v-hasPermi="['erp:sale-out:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:sale-out:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-hasPermi="['erp:sale-out:delete']"
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
        label="总数量"
        align="center"
        prop="totalCount"
        width="100"
        :formatter="erpCountTableColumnFormatter"
      />
      <el-table-column
        label="应收金额"
        align="center"
        prop="totalPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="已收金额"
        align="center"
        prop="receiptPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="未收金额"
        align="center"
        width="115"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.receiptPrice === scope.row.totalPrice">0</span>
          <el-tag
            v-else
            type="danger"
          >
            {{ erpPriceInputFormatter(scope.row.totalPrice - scope.row.receiptPrice) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="审核状态"
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
        width="260"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['erp:sale-out:query']"
            size="mini"
            type="text"
            @click="openForm('detail', scope.row.id)"
          >详情</el-button>
          <el-button
            v-hasPermi="['erp:sale-out:update']"
            size="mini"
            type="text"
            :disabled="scope.row.status === 20"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === 10"
            v-hasPermi="['erp:sale-out:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 20)"
          >审批</el-button>
          <el-button
            v-else
            v-hasPermi="['erp:sale-out:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 10)"
          >反审批</el-button>
          <el-button
            v-hasPermi="['erp:sale-out:delete']"
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

    <SaleOutForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { getCustomerSimpleList } from '@/api/erp/sale/customer'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { getSimpleUserList } from '@/api/system/user'
import { SaleOutApi } from '@/api/erp/sale/out'
import download from '@/plugins/download'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  dateFormatter2,
  erpCountTableColumnFormatter,
  erpPriceInputFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'
import SaleOutForm from './SaleOutForm.vue'

export default {
  name: 'ErpSaleOut',
  components: { SaleOutForm },
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
      userList: [],
      warehouseList: [],
      accountList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        customerId: undefined,
        productId: undefined,
        warehouseId: undefined,
        outTime: [],
        orderNo: undefined,
        receiptStatus: undefined,
        accountId: undefined,
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
    erpPriceInputFormatter,
    erpPriceTableColumnFormatter,
    loadOptions() {
      return Promise.all([
        getProductSimpleList(),
        getCustomerSimpleList(),
        getSimpleUserList(),
        getWarehouseSimpleList(),
        getAccountSimpleList()
      ])
        .then(([productResponse, customerResponse, userResponse, warehouseResponse, accountResponse]) => {
          this.productList = productResponse.data
          this.customerList = customerResponse.data
          this.userList = userResponse.data
          this.warehouseList = warehouseResponse.data
          this.accountList = accountResponse.data
        })
    },
    getList() {
      this.loading = true
      return SaleOutApi.getSaleOutPage(this.queryParams)
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
      this.$modal.confirm('是否确认删除选中的销售出库数据项?')
        .then(() => SaleOutApi.deleteSaleOut(values))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.selectionList = this.selectionList.filter((item) => !values.includes(item.id))
          this.getList()
        })
        .catch(() => {})
    },
    handleUpdateStatus(id, status) {
      const action = status === 20 ? '审批' : '反审批'
      this.$modal.confirm('确定' + action + '该出库吗？')
        .then(() => SaleOutApi.updateSaleOutStatus(id, status))
        .then(() => {
          this.$modal.msgSuccess(action + '成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有销售出库数据项?')
        .then(() => {
          this.exportLoading = true
          return SaleOutApi.exportSaleOut(this.queryParams)
        })
        .then((response) => download.excel(response.data, '销售出库.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
}
// TODO 芋艿：可优化功能：列表界面，支持导入
// TODO 芋艿：可优化功能：详情界面，支持打印
</script>
