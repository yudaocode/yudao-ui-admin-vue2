<template>
  <el-dialog
    title="选择采购订单（仅展示可退货）"
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
        label="订单单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入订单单号"
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
      v-loading="loading"
      :data="list"
      border
      stripe
    >
      <el-table-column
        label="选择"
        align="center"
        width="65"
      >
        <template slot-scope="scope">
          <el-radio
            v-model="currentRowValue"
            :label="scope.row.id"
            @change="handleCurrentChange(scope.row)"
          >&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        label="订单单号"
        prop="no"
        min-width="160"
      />
      <el-table-column
        label="供应商"
        prop="supplierName"
        min-width="120"
      />
      <el-table-column
        label="产品信息"
        prop="productNames"
        min-width="200"
      />
      <el-table-column
        label="订单时间"
        prop="orderTime"
        width="120"
      >
        <template slot-scope="scope">{{ formatDate(scope.row.orderTime) }}</template>
      </el-table-column>
      <el-table-column
        label="创建人"
        prop="creatorName"
        min-width="100"
      />
      <el-table-column
        label="总数量"
        prop="totalCount"
        width="100"
      >
        <template slot-scope="scope">{{ formatCount(scope.row.totalCount) }}</template>
      </el-table-column>
      <el-table-column
        label="入库数量"
        prop="inCount"
        width="100"
      >
        <template slot-scope="scope">{{ formatCount(scope.row.inCount) }}</template>
      </el-table-column>
      <el-table-column
        label="退货数量"
        prop="returnCount"
        width="100"
      >
        <template slot-scope="scope">{{ formatCount(scope.row.returnCount) }}</template>
      </el-table-column>
      <el-table-column
        label="金额合计"
        prop="totalProductPrice"
        width="115"
      >
        <template slot-scope="scope">{{ formatPrice(scope.row.totalProductPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="含税金额"
        prop="totalPrice"
        width="115"
      >
        <template slot-scope="scope">{{ formatPrice(scope.row.totalPrice) }}</template>
      </el-table-column>
    </el-table>
    <pagination
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
        :disabled="!currentRow"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { getPurchaseOrderPage } from '@/api/erp/purchase/order'

export default {
  name: 'PurchaseOrderReturnEnableList',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      productList: [],
      currentRow: null,
      currentRowValue: null,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        productId: undefined,
        orderTime: [],
        returnEnable: true
      }
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.currentRow = null
      this.currentRowValue = null
      this.$nextTick(() => {
        this.resetQuery()
        getProductSimpleList().then((response) => {
          this.productList = response.data
        })
      })
    },
    getList() {
      this.loading = true
      return getPurchaseOrderPage(this.queryParams).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.currentRow = null
      this.currentRowValue = null
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleCurrentChange(row) {
      this.currentRow = row
    },
    submitForm() {
      if (!this.currentRow) return
      this.$emit('success', this.currentRow)
      this.dialogVisible = false
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? '' : date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    },
    formatCount(value) {
      return value === undefined || value === null ? '' : Number(value).toFixed(3)
    },
    formatPrice(value) {
      return value === undefined || value === null ? '' : Number(value).toFixed(2)
    }
  }
}
</script>

<style scoped>
.dialog-footer { text-align: right; }
</style>
