<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="80%"
    append-to-body
  >
    <el-alert
      v-if="kind === 'notice' && status != null"
      :title="'仅展示状态为【' + getDictDataLabel(DICT_TYPE.MES_WM_SALES_NOTICE_STATUS, status) + '】的发货通知单'"
      type="info"
      :closable="false"
      show-icon
      class="filter-alert"
    />
    <el-row
      v-if="kind === 'stock'"
      :gutter="20"
    >
      <el-col
        :span="4"
        :xs="24"
      >
        <MdItemTypeTree
          ref="typeTree"
          @node-click="handleNodeClick"
        />
      </el-col>
      <el-col
        :span="20"
        :xs="24"
      >
        <el-alert
          v-if="batchId != null"
          title="已按批次预过滤"
          type="info"
          :closable="false"
          show-icon
          class="filter-alert"
        />
        <el-form
          :inline="true"
          :model="queryParams"
          label-width="68px"
          size="small"
          @submit.native.prevent
        >
          <el-form-item label="物料"><MdItemSelect
            v-model="queryParams.itemId"
            style="width: 220px"
          /></el-form-item>
          <el-form-item label="供应商"><MdVendorSelect
            v-model="queryParams.vendorId"
            style="width: 220px"
          /></el-form-item>
          <el-form-item label="批次号"><el-input
            v-model="queryParams.batchCode"
            placeholder="请输入批次号"
            clearable
            @keyup.enter.native="handleQuery"
          /></el-form-item>
          <el-form-item label="仓库"><WmWarehouseSelect
            v-model="queryParams.warehouseId"
            style="width: 220px"
            @change="handleWarehouseChange"
          /></el-form-item>
          <el-form-item label="库区"><WmWarehouseLocationSelect
            v-model="queryParams.locationId"
            :warehouse-id="queryParams.warehouseId"
            style="width: 220px"
            @change="handleLocationChange"
          /></el-form-item>
          <el-form-item label="库位"><WmWarehouseAreaSelect
            v-model="queryParams.areaId"
            :location-id="queryParams.locationId"
            style="width: 220px"
          /></el-form-item>
          <el-form-item><el-button
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button><el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button></el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-form
      v-else-if="kind === 'notice'"
      :inline="true"
      :model="queryParams"
      label-width="100px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="通知单编号"><el-input
        v-model="queryParams.code"
        placeholder="请输入通知单编号"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="通知单名称"><el-input
        v-model="queryParams.name"
        placeholder="请输入通知单名称"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="销售订单编号"><el-input
        v-model="queryParams.salesOrderCode"
        placeholder="请输入销售订单编号"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item label="客户"><MdClientSelect
        v-model="queryParams.clientId"
        style="width: 220px"
      /></el-form-item>
      <el-form-item
        v-if="status == null"
        label="单据状态"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择单据状态"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item><el-button
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button></el-form-item>
    </el-form>

    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      row-key="id"
      highlight-current-row
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column
        width="50"
        align="center"
      >
        <template #default="scope"><el-radio
          v-model="selectedRadioId"
          :label="scope.row.id"
          class="radio-no-label"
          @change="handleRadioChange(scope.row)"
        >&nbsp;</el-radio></template>
      </el-table-column>
      <template v-if="kind === 'notice'">
        <el-table-column
          label="通知单编号"
          align="center"
          prop="code"
          width="180"
        />
        <el-table-column
          label="通知单名称"
          align="left"
          prop="name"
          min-width="150"
        />
        <el-table-column
          label="销售订单编号"
          align="center"
          prop="salesOrderCode"
          width="160"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="clientName"
          width="120"
        />
        <el-table-column
          label="发货日期"
          align="center"
          prop="salesDate"
          width="120"
        ><template #default="scope">{{ parseTime(scope.row.salesDate, '{y}-{m}-{d}') }}</template></el-table-column>
        <el-table-column
          label="收货人"
          align="center"
          prop="recipientName"
          width="100"
        />
        <el-table-column
          label="联系方式"
          align="center"
          prop="recipientTelephone"
          width="130"
        />
        <el-table-column
          label="收货地址"
          align="center"
          prop="recipientAddress"
          min-width="200"
        />
        <el-table-column
          label="单据状态"
          align="center"
          prop="status"
          width="100"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.MES_WM_SALES_NOTICE_STATUS"
          :value="scope.row.status"
        /></template></el-table-column>
      </template>
      <template v-else-if="kind === 'notice-line'">
        <el-table-column
          label="物料编码"
          align="center"
          prop="itemCode"
          width="150"
        />
        <el-table-column
          label="物料名称"
          align="left"
          prop="itemName"
          min-width="200"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          min-width="120"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitMeasureName"
          width="80"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          width="130"
        />
        <el-table-column
          label="发货数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="是否检验"
          align="center"
          prop="oqcCheckFlag"
          width="90"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.oqcCheckFlag"
        /></template></el-table-column>
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          min-width="120"
        />
      </template>
      <template v-else>
        <el-table-column
          label="产品物料编码"
          align="center"
          prop="itemCode"
          min-width="120"
        />
        <el-table-column
          label="产品物料名称"
          align="center"
          prop="itemName"
          min-width="140"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          min-width="120"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitMeasureName"
          min-width="80"
        />
        <el-table-column
          label="入库批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="仓库"
          align="center"
          prop="warehouseName"
          min-width="100"
        />
        <el-table-column
          label="库区"
          align="center"
          prop="locationName"
          min-width="100"
        />
        <el-table-column
          label="库位"
          align="center"
          prop="areaName"
          min-width="100"
        />
        <el-table-column
          label="在库数量"
          align="center"
          prop="quantity"
          min-width="100"
        />
        <el-table-column
          label="入库日期"
          align="center"
          prop="receiptTime"
          width="180"
        ><template #default="scope">{{ parseTime(scope.row.receiptTime) }}</template></el-table-column>
      </template>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="confirmSelect"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions, getDictDataLabel } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { WmSalesNoticeApi } from '@/api/mes/wm/salesnotice'
import { WmSalesNoticeLineApi } from '@/api/mes/wm/salesnotice/line'
import { WmMaterialStockApi } from '@/api/mes/wm/materialstock'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdItemTypeTree from '@/views/mes/md/item/type/components/MdItemTypeTree.vue'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'

function defaultQuery() {
  return {
    pageNo: 1,
    pageSize: 10,
    code: undefined,
    name: undefined,
    salesOrderCode: undefined,
    clientId: undefined,
    status: undefined,
    noticeId: undefined,
    itemTypeId: undefined,
    itemId: undefined,
    vendorId: undefined,
    batchCode: undefined,
    batchId: undefined,
    warehouseId: undefined,
    locationId: undefined,
    areaId: undefined,
    frozen: false,
    virtualFilter: undefined
  }
}

export default {
  name: 'ProductSalesEntitySelectDialog',
  components: {
    MdClientSelect,
    MdItemSelect,
    MdItemTypeTree,
    MdVendorSelect,
    WmWarehouseSelect,
    WmWarehouseLocationSelect,
    WmWarehouseAreaSelect
  },
  props: {
    kind: { type: String, required: true },
    status: { type: Number, default: undefined },
    noticeId: { type: Number, default: undefined },
    itemId: { type: Number, default: undefined },
    batchId: { type: Number, default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
      statusOptions: getIntDictOptions(DICT_TYPE.MES_WM_SALES_NOTICE_STATUS),
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedRadioId: undefined,
      currentRadioRow: undefined,
      preSelectedIds: [],
      queryParams: defaultQuery()
    }
  },
  computed: {
    dialogTitle() {
      if (this.kind === 'notice') return '发货通知单选择'
      if (this.kind === 'notice-line') return '发货通知单行选择'
      return '库存物资选择'
    }
  },
  methods: {
    parseTime,
    getDictDataLabel,
    requestPage() {
      if (this.kind === 'notice') return WmSalesNoticeApi.getSalesNoticePage(this.queryParams)
      if (this.kind === 'notice-line') return WmSalesNoticeLineApi.getSalesNoticeLinePage(this.queryParams)
      return WmMaterialStockApi.getMaterialStockPage(this.queryParams)
    },
    async getList() {
      this.loading = true
      try {
        const response = await this.requestPage()
        this.list = response.data.list
        this.total = response.data.total
        await this.$nextTick()
        this.applyPreSelection()
      } finally {
        this.loading = false
      }
    },
    applyPreSelection() {
      if (this.preSelectedIds.length === 0) return
      const match = this.list.find(row => this.preSelectedIds.includes(row.id))
      if (match) {
        this.selectedRadioId = match.id
        this.currentRadioRow = match
      }
    },
    handleRowClick(row) {
      this.selectedRadioId = row.id
      this.currentRadioRow = row
    },
    handleRadioChange(row) {
      this.currentRadioRow = row
    },
    handleRowDblClick(row) {
      this.handleRowClick(row)
      this.confirmSelect()
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    handleNodeClick(data) {
      this.queryParams.itemTypeId = data && data.id
      this.handleQuery()
    },
    handleWarehouseChange() {
      this.queryParams.locationId = undefined
      this.queryParams.areaId = undefined
    },
    handleLocationChange() {
      this.queryParams.areaId = undefined
    },
    resetQuery() {
      if (this.kind === 'notice') {
        this.queryParams.code = undefined
        this.queryParams.name = undefined
        this.queryParams.salesOrderCode = undefined
        this.queryParams.clientId = undefined
        this.queryParams.status = this.status
      } else if (this.kind === 'stock') {
        this.queryParams.itemTypeId = undefined
        this.queryParams.itemId = this.itemId
        this.queryParams.vendorId = undefined
        this.queryParams.batchCode = undefined
        this.queryParams.batchId = this.batchId
        this.queryParams.warehouseId = undefined
        this.queryParams.locationId = undefined
        this.queryParams.areaId = undefined
        this.queryParams.virtualFilter = 'exclude'
        if (this.$refs.typeTree) this.$refs.typeTree.reset()
      }
      return this.handleQuery()
    },
    confirmSelect() {
      if (!this.currentRadioRow) {
        this.$modal.msgWarning('请选择一条数据')
        return
      }
      this.$emit('selected', [this.currentRadioRow])
      this.dialogVisible = false
    },
    async open(selectedIds) {
      this.dialogVisible = true
      this.queryParams = defaultQuery()
      this.queryParams.status = this.status
      this.queryParams.noticeId = this.noticeId
      this.queryParams.itemId = this.itemId
      this.queryParams.batchId = this.batchId
      this.queryParams.virtualFilter = 'exclude'
      this.selectedRadioId = undefined
      this.currentRadioRow = undefined
      this.preSelectedIds = selectedIds || []
      await this.$nextTick()
      if (this.$refs.typeTree) this.$refs.typeTree.reset()
      await this.getList()
    }
  }
}
</script>

<style scoped>
.filter-alert { margin-bottom: 10px; }
.radio-no-label /deep/ .el-radio__label { display: none; }
</style>
