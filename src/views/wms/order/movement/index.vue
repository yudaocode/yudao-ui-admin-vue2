<template>
  <div class="app-container">
    <doc-alert
      title="【单据】移库"
      url="https://doc.iocoder.cn/wms/order/movement/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="76px"
      @submit.native.prevent
    >
      <el-form-item
        label="移库单号"
        prop="no"
      ><el-input
        v-model="queryParams.no"
        clearable
        placeholder="请输入移库单号"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        clearable
        placeholder="请选择状态"
      ><el-option
        v-for="item in statusDictDatas"
        :key="item.value"
        :label="item.label"
        :value="Number(item.value)"
      /></el-select></el-form-item>
      <el-form-item
        label="来源仓库"
        prop="sourceWarehouseId"
      ><warehouse-select v-model="queryParams.sourceWarehouseId" /></el-form-item>
      <el-form-item
        label="目标仓库"
        prop="targetWarehouseId"
      ><warehouse-select v-model="queryParams.targetWarehouseId" /></el-form-item>
      <el-form-item
        label="单据日期"
        prop="orderTime"
      ><el-date-picker
        v-model="queryParams.orderTime"
        type="daterange"
        value-format="yyyy-MM-dd HH:mm:ss"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
      /></el-form-item>
      <el-form-item><el-button
        type="primary"
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['wms:movement-order:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button><el-button
        v-hasPermi="['wms:movement-order:export']"
        type="success"
        plain
        icon="el-icon-download"
        :loading="exportLoading"
        @click="handleExport"
      >导出</el-button></el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      :show-overflow-tooltip="true"
      @expand-change="handleExpandChange"
    >
      <el-table-column
        type="expand"
        width="48"
      ><template slot-scope="scope"><el-table
        :data="detailMap[scope.row.id] || []"
        border
        size="mini"
      ><el-table-column
        label="商品"
        min-width="180"
      ><template slot-scope="detail"><div>{{ detail.row.itemName || "-" }}</div>
        <span class="sub-text">{{
          detail.row.itemCode || ""
        }}</span></template></el-table-column><el-table-column
        label="规格"
        min-width="180"
      ><template slot-scope="detail"><div>{{ detail.row.skuName || "-" }}</div>
        <span class="sub-text">{{
          detail.row.skuCode || ""
        }}</span></template></el-table-column><el-table-column
        label="数量"
        prop="quantity"
        width="110"
        align="right"
      ><template slot-scope="detail">{{
        formatQuantity(detail.row.quantity)
      }}</template></el-table-column><el-table-column
        label="单价(元)"
        prop="price"
        width="120"
        align="right"
      ><template slot-scope="detail">{{
        formatPrice(detail.row.price) || "-"
      }}</template></el-table-column><el-table-column
        label="金额(元)"
        prop="totalPrice"
        width="120"
        align="right"
      ><template slot-scope="detail">{{
        formatPrice(
          detail.row.totalPrice ||
            multiplyPrice(detail.row.quantity, detail.row.price)
        ) || "-"
      }}</template></el-table-column></el-table></template></el-table-column>
      <el-table-column
        label="移库单号"
        prop="no"
        min-width="180"
        fixed="left"
      />
      <el-table-column
        label="状态"
        prop="status"
        width="100"
        align="center"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.WMS_ORDER_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="来源仓库"
        prop="sourceWarehouseName"
        min-width="150"
      />
      <el-table-column
        label="目标仓库"
        prop="targetWarehouseName"
        min-width="150"
      />
      <el-table-column
        label="数量"
        prop="totalQuantity"
        width="100"
        align="right"
      ><template slot-scope="scope">{{
        formatQuantity(scope.row.totalQuantity)
      }}</template></el-table-column>
      <el-table-column
        label="金额(元)"
        prop="totalPrice"
        width="120"
        align="right"
      ><template slot-scope="scope">{{
        formatPrice(scope.row.totalPrice)
      }}</template></el-table-column>
      <el-table-column
        label="单据日期"
        prop="orderTime"
        width="120"
      ><template slot-scope="scope">{{
        formatDate(scope.row.orderTime)
      }}</template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="300"
        fixed="right"
      ><template slot-scope="scope"><el-button
        v-hasPermi="['wms:movement-order:query']"
        type="text"
        size="mini"
        @click="openDetail(scope.row.id)"
      >详情</el-button><el-button
        v-hasPermi="['wms:movement-order:update']"
        type="text"
        size="mini"
        :disabled="!canUpdate(scope.row.status)"
        @click="openForm('update', scope.row.id)"
      >修改</el-button><el-button
        v-if="canUpdate(scope.row.status)"
        v-hasPermi="['wms:movement-order:complete']"
        type="text"
        size="mini"
        @click="handleComplete(scope.row)"
      >完成</el-button><el-button
        v-if="canUpdate(scope.row.status)"
        v-hasPermi="['wms:movement-order:cancel']"
        type="text"
        size="mini"
        @click="handleCancel(scope.row)"
      >作废</el-button><el-button
        v-hasPermi="['wms:movement-order:delete']"
        type="text"
        size="mini"
        :disabled="!canDelete(scope.row.status)"
        @click="handleDelete(scope.row)"
      >删除</el-button><el-button
        v-hasPermi="['wms:movement-order:query']"
        type="text"
        size="mini"
        @click="handlePrint(scope.row.id)"
      >打印</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <movement-order-form
      ref="form"
      @success="getList"
    />
    <movement-order-detail ref="detail" />
    <movement-order-print ref="print" />
  </div>
</template>

<script>
import { MovementOrderApi } from '@/api/wms/order/movement'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  OrderUpdateStatusList,
  OrderDeleteStatusList
} from '@/views/wms/utils/constants'
import {
  formatPrice,
  formatQuantity,
  multiplyPrice
} from '@/views/wms/utils/format'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import MovementOrderForm from './MovementOrderForm.vue'
import MovementOrderDetail from './MovementOrderDetail.vue'
import MovementOrderPrint from './MovementOrderPrint.vue'

export default {
  name: 'WmsMovementOrder',
  components: {
    WarehouseSelect,
    MovementOrderForm,
    MovementOrderDetail,
    MovementOrderPrint
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      list: [],
      total: 0,
      statusDictDatas: getDictDatas(DICT_TYPE.WMS_ORDER_STATUS),
      detailMap: {},
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        status: undefined,
        sourceWarehouseId: undefined,
        targetWarehouseId: undefined,
        orderTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatPrice,
    formatQuantity,
    multiplyPrice,
    getList() {
      this.loading = true
      return MovementOrderApi.getMovementOrderPage(this.queryParams)
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
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    handlePrint(id) {
      this.$refs.print.print(id)
    },
    handleExpandChange(row, rows) {
      if (!row.id || !rows.some((item) => item.id === row.id)) return
      this.$delete(this.detailMap, row.id)
      return MovementOrderApi.getMovementOrderDetailListByOrderId(row.id).then(
        (response) => {
          this.$set(this.detailMap, row.id, response.data)
        }
      )
    },
    canUpdate(status) {
      return OrderUpdateStatusList.indexOf(Number(status)) >= 0
    },
    canDelete(status) {
      return OrderDeleteStatusList.indexOf(Number(status)) >= 0
    },
    handleDelete(row) {
      this.$modal
        .confirm('确认删除移库单“' + row.no + '”吗？')
        .then(() => MovementOrderApi.deleteMovementOrder(row.id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleComplete(row) {
      this.$modal
        .confirm('确认完成移库？完成后将更新库存。')
        .then(() => MovementOrderApi.completeMovementOrder(row.id))
        .then(() => {
          this.$modal.msgSuccess('移库成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleCancel(row) {
      this.$modal
        .confirm('确认作废该移库单？作废后不可恢复。')
        .then(() => MovementOrderApi.cancelMovementOrder(row.id))
        .then(() => {
          this.$modal.msgSuccess('作废成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal
        .confirm('是否确认导出所有移库单数据项？')
        .then(() => {
          this.exportLoading = true
          return MovementOrderApi.exportMovementOrder(this.queryParams)
        })
        .then((data) => this.$download.excel(data, '移库单.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime())
        ? ''
        : date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0')
    }
  }
}
</script>

<style scoped>
.sub-text {
  color: #909399;
  font-size: 12px;
}
</style>
