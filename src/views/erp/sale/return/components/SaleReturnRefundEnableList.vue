<!-- 可退款的销售退货单列表 -->
<template>
  <el-dialog
    title="选择销售退货（仅展示可退款）"
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
        label="退货单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入退货单号"
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
        label="退货时间"
        prop="returnTime"
      >
        <el-date-picker
          v-model="queryParams.returnTime"
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
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        width="48"
        label="选择"
        type="selection"
      />
      <el-table-column
        min-width="180"
        label="退货单号"
        align="center"
        prop="no"
      />
      <el-table-column
        label="客户"
        align="center"
        prop="customerName"
        min-width="120"
      />
      <el-table-column
        label="产品信息"
        align="center"
        prop="productNames"
        min-width="200"
      />
      <el-table-column
        label="退货时间"
        align="center"
        prop="returnTime"
        width="120"
      >
        <template slot-scope="scope">{{ formatDate(scope.row.returnTime) }}</template>
      </el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="creatorName"
        min-width="100"
      />
      <el-table-column
        label="应退金额"
        align="center"
        prop="totalPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="已退金额"
        align="center"
        prop="refundPrice"
        width="115"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="未退金额"
        align="center"
        width="115"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.refundPrice === scope.row.totalPrice">0</span>
          <el-tag
            v-else
            type="danger"
          >
            {{ erpPriceInputFormatter(scope.row.totalPrice - scope.row.refundPrice) }}
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
        :disabled="selectionList.length === 0"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { SaleReturnApi } from '@/api/erp/sale/return'
import { erpPriceInputFormatter, erpPriceTableColumnFormatter } from '@/utils'

export default {
  name: 'SaleReturnPaymentEnableList',
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      productList: [],
      selectionList: [],
      customerId: undefined,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        productId: undefined,
        returnTime: [],
        refundEnable: true,
        customerId: undefined
      }
    }
  },
  methods: {
    erpPriceInputFormatter,
    erpPriceTableColumnFormatter,
    open(customerId) {
      this.dialogVisible = true
      this.customerId = customerId
      this.$nextTick(() => {
        if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
        this.queryParams.customerId = this.customerId
        this.handleQuery()
        getProductSimpleList()
          .then((response) => {
            this.productList = response.data
          })
      })
    },
    getList() {
      this.loading = true
      return SaleReturnApi.getSaleReturnPage(this.queryParams)
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
      this.queryParams.customerId = this.customerId
      this.handleQuery()
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.selectionList = []
      this.getList()
    },
    handleSelectionChange(rows) {
      this.selectionList = rows || []
    },
    submitForm() {
      try {
        this.$emit('success', this.selectionList)
      } finally {
        this.dialogVisible = false
      }
    },
    formatDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
