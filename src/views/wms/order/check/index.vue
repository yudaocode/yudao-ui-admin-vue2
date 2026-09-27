<!-- WMS 盘库单 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【单据】盘库"
      url="https://doc.iocoder.cn/wms/order/check/"
    />
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      size="small"
      label-width="76px"
      @submit.native.prevent
    >
      <el-form-item
        label="盘库单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入盘库单号"
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
            v-for="item in statusDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="仓库"
        prop="warehouseId"
      >
        <warehouse-select v-model="queryParams.warehouseId" />
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
        label="盈亏数量"
        prop="totalQuantityMin"
      >
        <div class="range-input">
          <el-input-number
            v-model="queryParams.totalQuantityMin"
            :controls="false"
            :precision="QUANTITY_PRECISION"
            placeholder="最小值"
          /><span>至</span><el-input-number
            v-model="queryParams.totalQuantityMax"
            :controls="false"
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
          /><span>至</span><el-input-number
            v-model="queryParams.totalPriceMax"
            :controls="false"
            :min="0"
            :precision="PRICE_PRECISION"
            placeholder="最大值"
          />
        </div>
      </el-form-item>
      <el-form-item
        label="实际金额"
        prop="actualPriceMin"
      >
        <div class="range-input">
          <el-input-number
            v-model="queryParams.actualPriceMin"
            :controls="false"
            :min="0"
            :precision="PRICE_PRECISION"
            placeholder="最小值"
          /><span>至</span><el-input-number
            v-model="queryParams.actualPriceMax"
            :controls="false"
            :min="0"
            :precision="PRICE_PRECISION"
            placeholder="最大值"
          />
        </div>
      </el-form-item>
      <el-form-item
        label="创建用户"
        prop="creator"
      ><user-select-v2
        v-model="queryParams.creator"
        placeholder="请选择创建用户"
      /></el-form-item>
      <el-form-item
        label="更新用户"
        prop="updater"
      ><user-select-v2
        v-model="queryParams.updater"
        placeholder="请选择更新用户"
      /></el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      ><el-date-picker
        v-model="queryParams.createTime"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      /></el-form-item>
      <el-form-item
        label="更新时间"
        prop="updateTime"
      ><el-date-picker
        v-model="queryParams.updateTime"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      /></el-form-item>
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
          trigger="click"
          width="380"
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
          v-hasPermi="['wms:check-order:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['wms:check-order:export']"
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
            ><template slot-scope="detail"><div>{{ detail.row.itemName || "-" }}</div>
              <span
                v-if="detail.row.itemCode"
                class="sub-text"
              >商品编号：{{ detail.row.itemCode }}</span></template></el-table-column>
            <el-table-column
              label="规格信息"
              min-width="220"
            ><template slot-scope="detail"><div>{{ detail.row.skuName || "-" }}</div>
              <span
                v-if="detail.row.skuCode"
                class="sub-text"
              >规格编号：{{ detail.row.skuCode }}</span></template></el-table-column>
            <el-table-column
              label="账面数量"
              prop="quantity"
              width="120"
              align="right"
            ><template slot-scope="detail">{{
              formatQuantity(detail.row.quantity)
            }}</template></el-table-column>
            <el-table-column
              label="实盘数量"
              prop="checkQuantity"
              width="120"
              align="right"
            ><template slot-scope="detail">{{
              formatQuantity(detail.row.checkQuantity)
            }}</template></el-table-column>
            <el-table-column
              label="单价(元)"
              prop="price"
              width="120"
              align="right"
            ><template slot-scope="detail">{{
              formatPrice(detail.row.price)
            }}</template></el-table-column>
            <el-table-column
              label="实际金额(元)"
              width="140"
              align="right"
            ><template slot-scope="detail">{{
              formatPrice(getDetailActualPrice(detail.row))
            }}</template></el-table-column>
            <el-table-column
              label="盈亏数量"
              width="120"
              align="right"
            ><template slot-scope="detail"><span
              :class="getLossClass(getDetailDifferenceQuantity(detail.row))"
            >{{
              formatQuantity(getDetailDifferenceQuantity(detail.row))
            }}</span></template></el-table-column>
            <el-table-column
              label="实际盈亏金额(元)"
              width="160"
              align="right"
            ><template slot-scope="detail"><span
              :class="getLossClass(getDetailDifferencePrice(detail.row))"
            >{{ formatPrice(getDetailDifferencePrice(detail.row)) }}</span></template></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('no')"
        label="单号"
        prop="no"
        min-width="180"
        fixed="left"
      ><template slot-scope="scope">单号：<el-button
        type="text"
        @click="openDetail(scope.row.id)"
      >{{
        scope.row.no
      }}</el-button></template></el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('status')"
        label="盘库状态"
        prop="status"
        width="110"
        align="center"
        fixed="left"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.WMS_ORDER_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        v-if="isTableColumnVisible('warehouse')"
        label="仓库"
        prop="warehouseName"
        min-width="180"
      />
      <el-table-column
        v-if="isTableColumnVisible('quantityAmount')"
        label="盈亏/金额(元)"
        min-width="200"
      ><template slot-scope="scope"><div class="amount-line">
                                      <span>盈亏数：</span><span :class="getLossClass(scope.row.totalQuantity)">{{
                                        formatQuantity(scope.row.totalQuantity)
                                      }}</span>
                                    </div>
        <div class="amount-line">
          <span>总金额：</span><span>{{ formatPrice(scope.row.totalPrice) }}</span>
        </div>
        <div class="amount-line">
          <span>实际金额：</span><span>{{ formatPrice(scope.row.actualPrice) }}</span>
        </div>
        <div class="amount-line">
          <span>盈亏金额：</span><span :class="getLossClass(getDifferencePrice(scope.row))">{{
            formatPrice(getDifferencePrice(scope.row))
          }}</span>
        </div></template></el-table-column>
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
        prop="remark"
        min-width="160"
      />
      <el-table-column
        label="操作"
        align="center"
        width="190"
        fixed="right"
      ><template slot-scope="scope"><el-button
        v-hasPermi="['wms:check-order:query']"
        type="text"
        size="mini"
        @click="openDetail(scope.row.id)"
      >详情</el-button><el-button
        v-hasPermi="['wms:check-order:query']"
        type="text"
        size="mini"
        @click="handlePrint(scope.row.id)"
      >打印</el-button><el-button
        v-hasPermi="['wms:check-order:update']"
        type="text"
        size="mini"
        :disabled="!canUpdateCheckOrder(scope.row.status)"
        @click="openForm('update', scope.row.id)"
      >修改</el-button><el-button
        v-hasPermi="['wms:check-order:delete']"
        type="text"
        size="mini"
        :disabled="!canDeleteCheckOrder(scope.row.status)"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <check-order-form
      ref="form"
      @success="getList"
    />
    <check-order-detail ref="detail" />
    <check-order-print ref="print" />
  </div>
</template>

<script>
import { CheckOrderApi } from '@/api/wms/order/check'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  OrderDeleteStatusList,
  OrderStatusEnum,
  OrderUpdateStatusList
} from '@/views/wms/utils/constants'
import {
  formatPrice,
  formatQuantity,
  getLossClass,
  PRICE_PRECISION,
  QUANTITY_PRECISION,
  roundPrice
} from '@/views/wms/utils/format'
import { formatDate } from '@/utils'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import CheckOrderForm from './CheckOrderForm.vue'
import CheckOrderDetail from './CheckOrderDetail.vue'
import CheckOrderPrint from './CheckOrderPrint.vue'

export default {
  name: 'WmsCheckOrder',
  components: {
    WarehouseSelect,
    UserSelectV2,
    CheckOrderForm,
    CheckOrderDetail,
    CheckOrderPrint
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
      tableColumnOptions: [
        { label: '单号', value: 'no' },
        { label: '盘库状态', value: 'status' },
        { label: '仓库', value: 'warehouse' },
        { label: '盈亏/金额', value: 'quantityAmount' },
        { label: '操作信息', value: 'operateInfo' },
        { label: '备注', value: 'remark' }
      ],
      checkedTableColumns: [
        'no',
        'status',
        'warehouse',
        'quantityAmount',
        'operateInfo',
        'remark'
      ],
      queryParams: this.getDefaultQueryParams(),
      PRICE_PRECISION,
      QUANTITY_PRECISION,
      OrderStatusEnum
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatPrice,
    formatQuantity,
    getLossClass,
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        status: undefined,
        warehouseId: undefined,
        orderTime: [],
        totalQuantityMin: undefined,
        totalQuantityMax: undefined,
        totalPriceMin: undefined,
        totalPriceMax: undefined,
        actualPriceMin: undefined,
        actualPriceMax: undefined,
        creator: undefined,
        updater: undefined,
        createTime: [],
        updateTime: []
      }
    },
    formatNullableDate(value, format) {
      if (!value) return '-'
      return formatDate(value, format) || '-'
    },
    isTableColumnVisible(column) {
      return this.checkedTableColumns.indexOf(column) >= 0
    },
    canUpdateCheckOrder(status) {
      return OrderUpdateStatusList.indexOf(Number(status)) >= 0
    },
    canDeleteCheckOrder(status) {
      return OrderDeleteStatusList.indexOf(Number(status)) >= 0
    },
    getDifferencePrice(row) {
      return roundPrice(
        Number(row.actualPrice || 0) - Number(row.totalPrice || 0)
      )
    },
    getDetailDifferenceQuantity(detail) {
      return Number(detail.checkQuantity || 0) - Number(detail.quantity || 0)
    },
    getDetailActualPrice(detail) {
      if (
        detail.checkQuantity === undefined ||
        detail.checkQuantity === null ||
        detail.price === undefined ||
        detail.price === null
      ) { return undefined }
      return roundPrice(Number(detail.checkQuantity) * Number(detail.price))
    },
    getDetailDifferencePrice(detail) {
      if (detail.price === undefined || detail.price === null) return undefined
      return roundPrice(
        this.getDetailDifferenceQuantity(detail) * Number(detail.price)
      )
    },
    getList() {
      this.loading = true
      return CheckOrderApi.getCheckOrderPage(this.queryParams)
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
      this.getList()
    },
    handleExpandChange(row, expandedRows) {
      if (!row.id || !expandedRows.some((item) => item.id === row.id)) return
      this.$delete(this.detailMap, row.id)
      return CheckOrderApi.getCheckOrderDetailListByOrderId(row.id).then(
        (response) => {
          this.$set(this.detailMap, row.id, response.data)
        }
      )
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
        .confirm('确认删除该盘库单吗？')
        .then(() => CheckOrderApi.deleteCheckOrder(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal
        .confirm('是否确认导出所有盘库单数据项？')
        .then(() => {
          this.exportLoading = true
          return CheckOrderApi.exportCheckOrder(this.queryParams)
        })
        .then((data) => this.$download.excel(data, '盘库单.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
}
</script>

<style scoped>
.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 240px;
}
.range-input .el-input-number {
  width: 105px;
}
.column-settings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.amount-line {
  display: flex;
  justify-content: space-between;
  line-height: 24px;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.text-red-500 {
  color: #f56c6c;
}
</style>
