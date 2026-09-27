<template>
  <div class="app-container">
    <doc-alert
      title="【财务】采购付款、销售收款"
      url="https://doc.iocoder.cn/sale/finance-payment-receipt/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="76px"
      size="small"
    >
      <el-form-item
        label="付款单号"
        prop="no"
      >
        <el-input
          v-model="queryParams.no"
          clearable
          placeholder="请输入付款单号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="付款时间"
        prop="paymentTime"
      >
        <el-date-picker
          v-model="queryParams.paymentTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
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
        ><el-option
          v-for="item in supplierList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select>
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
        ><el-option
          v-for="item in userList"
          :key="item.id"
          :label="item.nickname"
          :value="item.id"
        /></el-select>
      </el-form-item>
      <el-form-item
        label="财务人员"
        prop="financeUserId"
      >
        <el-select
          v-model="queryParams.financeUserId"
          clearable
          filterable
          placeholder="请选择财务人员"
        ><el-option
          v-for="item in userList"
          :key="item.id"
          :label="item.nickname"
          :value="item.id"
        /></el-select>
      </el-form-item>
      <el-form-item
        label="付款账户"
        prop="accountId"
      >
        <el-select
          v-model="queryParams.accountId"
          clearable
          filterable
          placeholder="请选择付款账户"
        ><el-option
          v-for="item in accountList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择状态"
        ><el-option
          v-for="item in statusDictDatas"
          :key="item.value"
          :label="item.label"
          :value="Number(item.value)"
        /></el-select>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="queryParams.remark"
        clearable
        placeholder="请输入备注"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="采购单号"
        prop="bizNo"
      ><el-input
        v-model="queryParams.bizNo"
        clearable
        placeholder="请输入采购单号"
        @keyup.enter.native="handleQuery"
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
        <el-button
          v-hasPermi="['erp:finance-payment:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:finance-payment:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-hasPermi="['erp:finance-payment:delete']"
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
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="48"
      />
      <el-table-column
        label="付款单号"
        prop="no"
        min-width="160"
        align="center"
      />
      <el-table-column
        label="供应商"
        prop="supplierName"
        min-width="120"
        align="center"
      />
      <el-table-column
        label="付款时间"
        prop="paymentTime"
        width="120"
        align="center"
      ><template slot-scope="scope">{{ formatDate(scope.row.paymentTime) }}</template></el-table-column>
      <el-table-column
        label="创建人"
        prop="creatorName"
        min-width="100"
        align="center"
      />
      <el-table-column
        label="财务人员"
        prop="financeUserName"
        min-width="100"
        align="center"
      />
      <el-table-column
        label="付款账户"
        prop="accountName"
        min-width="120"
        align="center"
      />
      <el-table-column
        label="合计付款"
        prop="totalPrice"
        width="115"
        align="center"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="优惠金额"
        prop="discountPrice"
        width="115"
        align="center"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="实际付款"
        prop="paymentPrice"
        width="115"
        align="center"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="状态"
        prop="status"
        width="90"
        align="center"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.ERP_AUDIT_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="操作"
        width="250"
        fixed="right"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['erp:finance-payment:query']"
            size="mini"
            type="text"
            @click="openForm('detail', scope.row.id)"
          >详情</el-button>
          <el-button
            v-hasPermi="['erp:finance-payment:update']"
            size="mini"
            type="text"
            :disabled="scope.row.status === 20"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === 10"
            v-hasPermi="['erp:finance-payment:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 20)"
          >审批</el-button>
          <el-button
            v-else
            v-hasPermi="['erp:finance-payment:update-status']"
            size="mini"
            type="text"
            @click="handleUpdateStatus(scope.row.id, 10)"
          >反审批</el-button>
          <el-button
            v-hasPermi="['erp:finance-payment:delete']"
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
    <FinancePaymentForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import download from '@/plugins/download'
import { FinancePaymentApi } from '@/api/erp/finance/payment'
import { getSupplierSimpleList } from '@/api/erp/purchase/supplier'
import { getSimpleUserList } from '@/api/system/user'
import { getAccountSimpleList } from '@/api/erp/finance/account'
import { erpPriceTableColumnFormatter } from '@/utils'
import FinancePaymentForm from './FinancePaymentForm.vue'

export default {
  name: 'ErpFinancePayment',
  components: { FinancePaymentForm },
  data() {
    return {
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.ERP_AUDIT_STATUS),
      loading: true,
      exportLoading: false,
      list: [],
      total: 0,
      selectionList: [],
      supplierList: [],
      userList: [],
      accountList: [],
      queryParams: { pageNo: 1, pageSize: 10, no: undefined, paymentTime: [], supplierId: undefined, creator: undefined, financeUserId: undefined, accountId: undefined, status: undefined, remark: undefined, bizNo: undefined }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    erpPriceTableColumnFormatter,
    loadOptions() {
      return Promise.all([getSupplierSimpleList(), getSimpleUserList(), getAccountSimpleList()]).then(([supplier, user, account]) => {
        this.supplierList = supplier.data
        this.userList = user.data
        this.accountList = account.data
      })
    },
    getList() {
      this.loading = true
      return FinancePaymentApi.getFinancePaymentPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleSelectionChange(rows) { this.selectionList = rows || [] },
    handleDelete(ids) {
      const values = (ids || []).filter(id => id !== undefined && id !== null)
      if (!values.length) return
      this.$modal.confirm('是否确认删除选中的付款单数据项?').then(() => FinancePaymentApi.deleteFinancePayment(values)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {})
    },
    handleUpdateStatus(id, status) {
      const action = status === 20 ? '审批' : '反审批'
      this.$modal.confirm('确定' + action + '该付款单吗？').then(() => FinancePaymentApi.updateFinancePaymentStatus(id, status)).then(() => { this.$modal.msgSuccess(action + '成功'); this.getList() }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有付款单数据项?').then(() => { this.exportLoading = true; return FinancePaymentApi.exportFinancePayment(this.queryParams) }).then(response => download.excel(response.data, '付款单.xls')).catch(() => {}).finally(() => { this.exportLoading = false })
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
