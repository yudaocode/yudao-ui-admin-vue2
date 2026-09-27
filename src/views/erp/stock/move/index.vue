<template>
  <div class="app-container">
    <doc-alert
      title="【库存】库存调拨、库存盘点"
      url="https://doc.iocoder.cn/erp/stock-move-check/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="76px"
    >
      <el-form-item
        label="调拨单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入调拨单号"
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
        label="调拨时间"
        prop="moveTime"
      >
        <el-date-picker
          v-model="queryParams.moveTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="调出仓库"
        prop="fromWarehouseId"
      >
        <el-select
          v-model="queryParams.fromWarehouseId"
          clearable
          filterable
          placeholder="请选择调出仓库"
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
          v-hasPermi="['erp:stock-move:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:stock-move:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-hasPermi="['erp:stock-move:delete']"
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
      border
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="50"
        align="center"
      />
      <el-table-column
        label="调拨单号"
        align="center"
        prop="no"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        label="产品信息"
        align="center"
        prop="productNames"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        label="调拨时间"
        align="center"
        prop="moveTime"
        :formatter="dateFormatter2"
        width="120"
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
        :formatter="erpCountTableColumnFormatter"
        min-width="100"
      />
      <el-table-column
        label="金额"
        align="center"
        prop="totalPrice"
        :formatter="erpPriceTableColumnFormatter"
        min-width="100"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        fixed="right"
        width="90"
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
        width="230"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['erp:stock-move:query']"
            type="text"
            @click="openForm('detail', scope.row.id)"
          >详情</el-button>
          <el-button
            v-hasPermi="['erp:stock-move:update']"
            type="text"
            :disabled="scope.row.status === 20"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === 10"
            v-hasPermi="['erp:stock-move:update-status']"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 20)"
          >审批</el-button>
          <el-button
            v-else
            v-hasPermi="['erp:stock-move:update-status']"
            type="text"
            class="danger-text"
            @click="handleUpdateStatus(scope.row.id, 10)"
          >反审批</el-button>
          <el-button
            v-hasPermi="['erp:stock-move:delete']"
            type="text"
            class="danger-text"
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

    <stock-move-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import { getSimpleUserList } from '@/api/system/user'
import { StockMoveApi } from '@/api/erp/stock/move'
import download from '@/plugins/download'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  dateFormatter2,
  erpCountTableColumnFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'
import StockMoveForm from './StockMoveForm.vue'

export default {
  name: 'ErpStockMove',
  components: { StockMoveForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      total: 0,
      list: [],
      selectionList: [],
      productList: [],
      warehouseList: [],
      userList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        productId: undefined,
        fromWarehouseId: undefined,
        moveTime: [],
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
        getSimpleUserList()
      ]).then(([productResponse, warehouseResponse, userResponse]) => {
        this.productList = productResponse.data
        this.warehouseList = warehouseResponse.data
        this.userList = userResponse.data
      })
    },
    getList() {
      this.loading = true
      return StockMoveApi.getStockMovePage(this.queryParams).then(response => {
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
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleSelectionChange(rows) {
      this.selectionList = rows || []
    },
    handleDelete(ids) {
      const values = (ids || []).filter(id => id !== undefined && id !== null)
      if (!values.length) return
      this.$modal.delConfirm().then(() => {
        return StockMoveApi.deleteStockMove(values)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.selectionList = this.selectionList.filter(item => !values.includes(item.id))
        this.getList()
      }).catch(() => {})
    },
    handleUpdateStatus(id, status) {
      const action = status === 20 ? '审批' : '反审批'
      this.$modal.confirm('确定' + action + '该调拨单吗？').then(() => {
        return StockMoveApi.updateStockMoveStatus(id, status)
      }).then(() => {
        this.$modal.msgSuccess(action + '成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.exportConfirm().then(() => {
        this.exportLoading = true
        return StockMoveApi.exportStockMove(this.queryParams)
      }).then(response => {
        download.excel(response.data, '库存调拨单.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    }
  }
}
// TODO 芋艿：可优化功能：列表界面，支持导入
// TODO 芋艿：可优化功能：详情界面，支持打印
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
