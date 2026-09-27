<!-- 可付款的采购入库单列表 -->
<template>
  <el-dialog
    title="选择采购入库（仅展示可付款）"
    :visible.sync="dialogVisible"
    width="1080px"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="入库单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入入库单号"
          style="width: 160px"
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
          style="width: 160px"
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
        label="入库时间"
        prop="inTime"
      >
        <el-date-picker
          v-model="queryParams.inTime"
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
      </el-form-item>
    </el-form>

    <el-table
      ref="table"
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
        label="入库单号"
        align="center"
        prop="no"
        min-width="180"
      />
      <el-table-column
        label="供应商"
        align="center"
        prop="supplierName"
        min-width="120"
      />
      <el-table-column
        label="产品信息"
        align="center"
        prop="productNames"
        min-width="200"
      />
      <el-table-column
        label="入库时间"
        align="center"
        prop="inTime"
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
        label="应付金额"
        align="center"
        prop="totalPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="已付金额"
        align="center"
        prop="paymentPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="未付金额"
        align="center"
        width="115"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.paymentPrice === scope.row.totalPrice">0</span>
          <el-tag
            v-else
            type="danger"
          >
            {{ erpPriceInputFormatter(scope.row.totalPrice - scope.row.paymentPrice) }}
          </el-tag>
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
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :disabled="!selectionList.length"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { PurchaseInApi } from '@/api/erp/purchase/in'
import { dateFormatter2, erpPriceInputFormatter, erpPriceTableColumnFormatter } from '@/utils'

export default {
  name: 'PurchaseInPaymentEnableList',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      productList: [],
      selectionList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        productId: undefined,
        inTime: [],
        paymentEnable: true,
        supplierId: undefined
      }
    }
  },
  methods: {
    dateFormatter2,
    erpPriceInputFormatter,
    erpPriceTableColumnFormatter,
    open(supplierId) {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.queryParams.supplierId = supplierId
        this.resetQuery()
        getProductSimpleList()
          .then((response) => {
            this.productList = response.data
          })
      })
    },
    handleSelectionChange(rows) {
      this.selectionList = rows || []
    },
    submitForm() {
      this.$emit('success', this.selectionList)
      this.dialogVisible = false
    },
    getList() {
      this.loading = true
      return PurchaseInApi.getPurchaseInPage(this.queryParams)
        .then((response) => {
          this.list = response.data.list
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.selectionList = []
      if (this.$refs.table) this.$refs.table.clearSelection()
      this.getList()
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
