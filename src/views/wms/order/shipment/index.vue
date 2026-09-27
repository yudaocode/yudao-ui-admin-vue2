<!-- WMS 出库单 -->
<template>
  <div class="app-container wms-shipment-order">
    <doc-alert
      title="【单据】出库"
      url="https://doc.iocoder.cn/wms/order/shipment/"
    />

    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      size="small"
      label-width="80px"
      @submit.native.prevent
    >
      <el-form-item
        label="出库单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入出库单号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="业务单号"
        prop="bizOrderNo"
      >
        <el-input
          v-model="queryParams.bizOrderNo"
          clearable
          placeholder="请输入业务单号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="单据状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择单据状态"
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
        label="仓库"
        prop="warehouseId"
      >
        <warehouse-select
          v-model="queryParams.warehouseId"
          @change="handleWarehouseChange"
        />
      </el-form-item>
      <el-form-item
        label="客户"
        prop="merchantId"
      >
        <merchant-select
          v-model="queryParams.merchantId"
          customer
          placeholder="请选择客户"
        />
      </el-form-item>
      <el-form-item
        label="单据日期"
        prop="orderTime"
      >
        <el-date-picker
          v-model="queryParams.orderTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item
        label="数量"
        prop="totalQuantityMin"
      >
        <div class="range-input">
          <el-input-number
            v-model="queryParams.totalQuantityMin"
            :controls="false"
            :min="0"
            :precision="QUANTITY_PRECISION"
            placeholder="最小值"
          />
          <span>至</span>
          <el-input-number
            v-model="queryParams.totalQuantityMax"
            :controls="false"
            :min="0"
            :precision="QUANTITY_PRECISION"
            placeholder="最大值"
          />
        </div>
      </el-form-item>
      <el-form-item
        label="总金额"
        prop="totalPriceMin"
      >
        <div class="range-input">
          <el-input-number
            v-model="queryParams.totalPriceMin"
            :controls="false"
            :min="0"
            :precision="PRICE_PRECISION"
            placeholder="最小值"
          />
          <span>至</span>
          <el-input-number
            v-model="queryParams.totalPriceMax"
            :controls="false"
            :min="0"
            :precision="PRICE_PRECISION"
            placeholder="最大值"
          />
        </div>
      </el-form-item>
      <el-form-item
        label="出库类型"
        prop="type"
      >
        <el-select
          v-model="queryParams.type"
          clearable
          placeholder="请选择出库类型"
        >
          <el-option
            v-for="dict in shipmentTypeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建用户"
        prop="creator"
      >
        <user-select-v2
          v-model="queryParams.creator"
          placeholder="请选择创建用户"
        />
      </el-form-item>
      <el-form-item
        label="更新用户"
        prop="updater"
      >
        <user-select-v2
          v-model="queryParams.updater"
          placeholder="请选择更新用户"
        />
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item
        label="更新时间"
        prop="updateTime"
      >
        <el-date-picker
          v-model="queryParams.updateTime"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
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
        <el-popover
          placement="bottom"
          width="520"
          trigger="click"
        >
          <el-checkbox-group
            v-model="checkedTableColumns"
            class="column-settings"
          >
            <el-checkbox
              v-for="column in tableColumnOptions"
              :key="column.value"
              :label="column.value"
            >{{ column.label }}</el-checkbox>
          </el-checkbox-group>
          <el-button
            slot="reference"
            icon="el-icon-setting"
          >表格设置</el-button>
        </el-popover>
        <el-button
          v-hasPermi="['wms:shipment-order:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['wms:shipment-order:export']"
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
      @expand-change="handleExpandChange"
    >
      <el-table-column
        type="expand"
        width="48"
      >
        <template slot-scope="scope">
          <el-table
            :data="detailMap[scope.row.id] || []"
            border
            size="mini"
          >
            <el-table-column
              label="商品信息"
              min-width="220"
            >
              <template slot-scope="detail"><div>{{ detail.row.itemName || "-" }}</div>
                <span class="sub-text">商品编号：{{ detail.row.itemCode || "-" }}</span></template>
            </el-table-column>
            <el-table-column
              label="规格信息"
              min-width="220"
            >
              <template slot-scope="detail"><div>{{ detail.row.skuName || "-" }}</div>
                <span class="sub-text">规格编号：{{ detail.row.skuCode || "-" }}</span></template>
            </el-table-column>
            <el-table-column
              label="出库数量"
              width="120"
              align="right"
            ><template slot-scope="detail">{{
              formatQuantity(detail.row.quantity)
            }}</template></el-table-column>
            <el-table-column
              label="单价(元)"
              width="120"
              align="right"
            ><template slot-scope="detail">{{
              formatPrice(detail.row.price) || "-"
            }}</template></el-table-column>
            <el-table-column
              label="金额(元)"
              width="120"
              align="right"
            ><template slot-scope="detail">{{
              formatPrice(getDetailTotalPrice(detail.row)) || "-"
            }}</template></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('no')"
        label="单号/业务单号"
        width="290"
        fixed="left"
      >
        <template slot-scope="scope">
          <div>
            单号：<el-button
              type="text"
              class="link-button"
              @click="openDetail(scope.row.id)"
            >{{ scope.row.no || "-" }}</el-button>
          </div>
          <div
            v-if="scope.row.bizOrderNo"
            class="sub-text"
          >
            业务：{{ scope.row.bizOrderNo }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('status')"
        label="出库状态"
        width="110"
        align="center"
        fixed="left"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.WMS_ORDER_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('type')"
        label="出库类型"
        width="120"
        align="center"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.WMS_SHIPMENT_ORDER_TYPE"
        :value="scope.row.type"
      /></template></el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('warehouse')"
        label="仓库"
        min-width="160"
        prop="warehouseName"
      />
      <el-table-column
        v-if="isTableColumnVisible('quantityAmount')"
        label="总数量/总金额(元)"
        min-width="180"
      ><template slot-scope="scope"><div class="split-value">
                                      <span>数量：</span><span>{{ formatQuantity(scope.row.totalQuantity) }}</span>
                                    </div>
        <div class="split-value">
          <span>金额：</span><span>{{ formatPrice(scope.row.totalPrice) }}</span>
        </div></template></el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('merchant')"
        label="客户"
        min-width="160"
        prop="merchantName"
      />
      <el-table-column
        v-if="isTableColumnVisible('operateInfo')"
        label="操作信息"
        min-width="280"
      ><template slot-scope="scope"><div>
                                      创建：{{ formatNullableDate(scope.row.createTime) }} /
                                      {{ scope.row.creatorName || scope.row.creator || "-" }}
                                    </div>
        <div>
          更新：{{ formatNullableDate(scope.row.updateTime) }} /
          {{ scope.row.updaterName || scope.row.updater || "-" }}
        </div></template></el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('remark')"
        label="备注"
        min-width="160"
        prop="remark"
      />
      <el-table-column
        label="操作"
        width="220"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-tooltip
            :content="getShipmentOrderUpdateTip(scope.row.status)"
            :disabled="canUpdateShipmentOrder(scope.row.status)"
          >
            <span><el-button
              v-hasPermi="['wms:shipment-order:update']"
              type="text"
              :disabled="!canUpdateShipmentOrder(scope.row.status)"
              @click="openForm('update', scope.row.id)"
            >修改</el-button></span>
          </el-tooltip>
          <el-tooltip
            :content="getShipmentOrderDeleteTip(scope.row.status)"
            :disabled="canDeleteShipmentOrder(scope.row.status)"
          >
            <span><el-button
              v-hasPermi="['wms:shipment-order:delete']"
              type="text"
              class="danger-text"
              :disabled="!canDeleteShipmentOrder(scope.row.status)"
              @click="handleDelete(scope.row.id)"
            >删除</el-button></span>
          </el-tooltip>
          <el-button
            v-hasPermi="['wms:shipment-order:query']"
            type="text"
            @click="handlePrint(scope.row.id)"
          >打印</el-button>
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

    <shipment-order-form
      ref="form"
      @success="getList"
    />
    <shipment-order-detail ref="detail" />
    <shipment-order-print ref="print" />
  </div>
</template>

<script>
import { ShipmentOrderApi } from '@/api/wms/order/shipment'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  OrderDeleteStatusList,
  OrderStatusEnum,
  OrderUpdateStatusList
} from '@/views/wms/utils/constants'
import {
  formatPrice,
  formatQuantity,
  multiplyPrice,
  PRICE_PRECISION,
  QUANTITY_PRECISION
} from '@/views/wms/utils/format'
import { formatDate } from '@/utils'
import MerchantSelect from '@/views/wms/md/merchant/components/MerchantSelect.vue'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import ShipmentOrderForm from './ShipmentOrderForm.vue'
import ShipmentOrderDetail from './ShipmentOrderDetail.vue'
import ShipmentOrderPrint from './ShipmentOrderPrint.vue'

export default {
  name: 'WmsShipmentOrder',
  components: {
    MerchantSelect,
    WarehouseSelect,
    UserSelectV2,
    ShipmentOrderForm,
    ShipmentOrderDetail,
    ShipmentOrderPrint
  },
  data() {
    return {
      DICT_TYPE,
      QUANTITY_PRECISION,
      PRICE_PRECISION,
      loading: false,
      exportLoading: false,
      list: [],
      total: 0,
      detailMap: {},
      checkedTableColumns: [
        'no',
        'status',
        'type',
        'warehouse',
        'quantityAmount',
        'merchant',
        'operateInfo',
        'remark'
      ],
      tableColumnOptions: [
        { label: '单号/业务单号', value: 'no' },
        { label: '出库状态', value: 'status' },
        { label: '出库类型', value: 'type' },
        { label: '仓库', value: 'warehouse' },
        { label: '数量/金额(元)', value: 'quantityAmount' },
        { label: '客户', value: 'merchant' },
        { label: '操作信息', value: 'operateInfo' },
        { label: '备注', value: 'remark' }
      ],
      queryParams: this.getDefaultQueryParams()
    }
  },
  computed: {
    statusDictDatas() {
      return getDictDatas(DICT_TYPE.WMS_ORDER_STATUS)
    },
    shipmentTypeDictDatas() {
      return getDictDatas(DICT_TYPE.WMS_SHIPMENT_ORDER_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatPrice,
    formatQuantity,
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        status: undefined,
        warehouseId: undefined,
        merchantId: undefined,
        orderTime: undefined,
        totalQuantityMin: undefined,
        totalQuantityMax: undefined,
        totalPriceMin: undefined,
        totalPriceMax: undefined,
        type: undefined,
        bizOrderNo: undefined,
        creator: undefined,
        updater: undefined,
        createTime: undefined,
        updateTime: undefined
      }
    },
    isTableColumnVisible(column) {
      return this.checkedTableColumns.indexOf(column) >= 0
    },
    canUpdateShipmentOrder(status) {
      return OrderUpdateStatusList.indexOf(Number(status)) >= 0
    },
    canDeleteShipmentOrder(status) {
      return OrderDeleteStatusList.indexOf(Number(status)) >= 0
    },
    getShipmentOrderUpdateTip(status) {
      if (Number(status) === OrderStatusEnum.FINISHED) { return '已出库，无法修改' }
      if (Number(status) === OrderStatusEnum.CANCELED) { return '已作废，无法修改' }
      return '当前状态无法修改'
    },
    getShipmentOrderDeleteTip(status) {
      return Number(status) === OrderStatusEnum.FINISHED
        ? '已出库，无法删除'
        : '当前状态无法删除'
    },
    getList() {
      this.loading = true
      return ShipmentOrderApi.getShipmentOrderPage(this.queryParams)
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
      this.queryParams = this.getDefaultQueryParams()
      this.handleQuery()
    },
    handleWarehouseChange() {
      this.handleQuery()
    },
    getDetailTotalPrice(detail) {
      return detail.totalPrice === undefined || detail.totalPrice === null
        ? multiplyPrice(detail.quantity, detail.price)
        : detail.totalPrice
    },
    handleExpandChange(row, expandedRows) {
      if (!row.id || !expandedRows.some((item) => item.id === row.id)) return
      this.$delete(this.detailMap, row.id)
      return ShipmentOrderApi.getShipmentOrderDetailListByOrderId(row.id)
        .then((response) => {
          this.$set(this.detailMap, row.id, response.data)
        })
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
    handleDelete(id) {
      this.$modal
        .confirm('确认删除该出库单吗？')
        .then(() => ShipmentOrderApi.deleteShipmentOrder(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal
        .confirm('是否确认导出所有出库单数据项？')
        .then(() => {
          this.exportLoading = true
          return ShipmentOrderApi.exportShipmentOrder(this.queryParams)
        })
        .then((data) => this.$download.excel(data, '出库单.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    },
    formatNullableDate(value) {
      if (!value) return '-'
      const text = formatDate(value)
      return text || '-'
    }
  }
}
</script>

<style scoped>
.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range-input .el-input-number {
  width: 105px;
}
.column-settings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.split-value {
  display: flex;
  justify-content: space-between;
}
.link-button {
  padding: 0;
}
.danger-text {
  color: #f56c6c;
}
</style>
