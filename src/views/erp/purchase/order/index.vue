<template>
  <div class="app-container">
    <doc-alert
      title="【采购】采购订单、入库、退货"
      url="https://doc.iocoder.cn/erp/purchase/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="76px"
    >
      <el-form-item
        label="订单单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          placeholder="请输入订单单号"
          clearable
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
        label="订单时间"
        prop="orderTime"
      >
        <el-date-picker
          v-model="queryParams.orderTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="供应商"
        prop="supplierId"
      >
        <el-select
          v-model="queryParams.supplierId"
          clearable
          filterable
          placeholder="请选择供应商"
          style="width: 220px"
        >
          <el-option
            v-for="item in supplierList"
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
          style="width: 160px"
        >
          <el-option
            v-for="dict in statusDictDatas"
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
          placeholder="请输入备注"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="入库数量"
        prop="inStatus"
      >
        <el-select
          v-model="queryParams.inStatus"
          clearable
          placeholder="请选择入库数量"
          style="width: 160px"
        >
          <el-option
            label="未入库"
            value="0"
          />
          <el-option
            label="部分入库"
            value="1"
          />
          <el-option
            label="全部入库"
            value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="退货数量"
        prop="returnStatus"
      >
        <el-select
          v-model="queryParams.returnStatus"
          clearable
          placeholder="请选择退货数量"
          style="width: 160px"
        >
          <el-option
            label="未退货"
            value="0"
          />
          <el-option
            label="部分退货"
            value="1"
          />
          <el-option
            label="全部退货"
            value="2"
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
          v-hasPermi="['erp:purchase-order:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:purchase-order:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-hasPermi="['erp:purchase-order:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          :disabled="selectionList.length === 0"
          @click="handleDelete(selectionList.map(item => item.id))"
        >删除</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="48"
      />
      <el-table-column
        label="订单单号"
        align="center"
        prop="no"
        min-width="160"
      />
      <el-table-column
        label="产品信息"
        align="center"
        prop="productNames"
        min-width="200"
      />
      <el-table-column
        label="供应商"
        align="center"
        prop="supplierName"
        min-width="120"
      />
      <el-table-column
        label="订单时间"
        align="center"
        prop="orderTime"
        width="120"
      >
        <template slot-scope="scope">{{ formatDate(scope.row.orderTime) }}</template>
      </el-table-column>
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
      >
        <template slot-scope="scope">{{ formatCount(scope.row.totalCount) }}</template>
      </el-table-column>
      <el-table-column
        label="入库数量"
        align="center"
        prop="inCount"
        width="100"
      >
        <template slot-scope="scope">{{ formatCount(scope.row.inCount) }}</template>
      </el-table-column>
      <el-table-column
        label="退货数量"
        align="center"
        prop="returnCount"
        width="100"
      >
        <template slot-scope="scope">{{ formatCount(scope.row.returnCount) }}</template>
      </el-table-column>
      <el-table-column
        label="金额合计"
        align="center"
        prop="totalProductPrice"
        width="115"
      >
        <template slot-scope="scope">{{ formatPrice(scope.row.totalProductPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="含税金额"
        align="center"
        prop="totalPrice"
        width="115"
      >
        <template slot-scope="scope">{{ formatPrice(scope.row.totalPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="支付订金"
        align="center"
        prop="depositPrice"
        width="115"
      >
        <template slot-scope="scope">{{ formatPrice(scope.row.depositPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="90"
      >
        <template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.ERP_AUDIT_STATUS"
          :value="scope.row.status"
        /></template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="260"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['erp:purchase-order:query']"
            size="mini"
            type="text"
            @click="openForm('detail', scope.row.id)"
          >详情</el-button>
          <el-button
            v-hasPermi="['erp:purchase-order:update']"
            size="mini"
            type="text"
            :disabled="scope.row.status === 20"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="scope.row.status === 10"
            v-hasPermi="['erp:purchase-order:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 20)"
          >审批</el-button>
          <el-button
            v-else
            v-hasPermi="['erp:purchase-order:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 10)"
          >反审批</el-button>
          <el-button
            v-hasPermi="['erp:purchase-order:delete']"
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

    <PurchaseOrderForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { getSupplierSimpleList } from '@/api/erp/purchase/supplier'
import { getSimpleUserList } from '@/api/system/user'
import {
  deletePurchaseOrder,
  exportPurchaseOrder,
  getPurchaseOrderPage,
  updatePurchaseOrderStatus
} from '@/api/erp/purchase/order'
import download from '@/plugins/download'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import PurchaseOrderForm from './PurchaseOrderForm.vue'

export default {
  name: 'ErpPurchaseOrder',
  components: { PurchaseOrderForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      exportLoading: false,
      total: 0,
      list: [],
      selectionList: [],
      productList: [],
      supplierList: [],
      userList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.ERP_AUDIT_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        supplierId: undefined,
        productId: undefined,
        orderTime: [],
        status: undefined,
        remark: undefined,
        creator: undefined,
        inStatus: undefined,
        returnStatus: undefined
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    loadOptions() {
      return Promise.all([getProductSimpleList(), getSupplierSimpleList(), getSimpleUserList()]).then(([product, supplier, user]) => {
        this.productList = product.data
        this.supplierList = supplier.data
        this.userList = user.data
      })
    },
    getList() {
      this.loading = true
      return getPurchaseOrderPage(this.queryParams).then((response) => {
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
      this.$modal.confirm('是否确认删除选中的采购订单数据项?').then(() => deletePurchaseOrder(values)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleUpdateStatus(id, status) {
      const action = status === 20 ? '审批' : '反审批'
      this.$modal.confirm('确定' + action + '该订单吗？').then(() => updatePurchaseOrderStatus(id, status)).then(() => {
        this.$modal.msgSuccess(action + '成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有采购订单数据项?').then(() => {
        this.exportLoading = true
        return exportPurchaseOrder(this.queryParams)
      }).then((response) => {
        download.excel(response.data, '采购订单.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    },
    formatCount(value) {
      if (value === undefined || value === null || value === '') return ''
      return Number(value).toFixed(3)
    },
    formatPrice(value) {
      if (value === undefined || value === null || value === '') return ''
      return Number(value).toFixed(2)
    }
  }
}
</script>
