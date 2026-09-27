<template>
  <div class="app-container crm-receivable-plan-page">
    <doc-alert
      title="【回款】回款管理、回款计划"
      url="https://doc.iocoder.cn/crm/receivable/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />
    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="78px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="客户名称"
          prop="customerId"
        ><el-select
          v-model="queryParams.customerId"
          clearable
          filterable
          placeholder="请选择客户"
          style="width: 220px"
        ><el-option
          v-for="item in customerList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item>
        <el-form-item
          label="合同编号"
          prop="contractNo"
        ><el-input
          v-model="queryParams.contractNo"
          clearable
          placeholder="请输入合同编号"
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
            v-hasPermi="['crm:receivable-plan:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['crm:receivable-plan:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          label="我负责的"
          name="1"
        />
        <el-tab-pane
          label="下属负责的"
          name="3"
        />
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="客户名称"
          prop="customerName"
          width="150"
        />
        <el-table-column
          label="合同编号"
          prop="contractNo"
          width="180"
        />
        <el-table-column
          label="期数"
          prop="period"
          width="80"
        >
          <template slot-scope="scope"><el-link
            type="primary"
            :underline="false"
            @click="openDetail(scope.row.id)"
          >{{ scope.row.period || '-' }}</el-link></template>
        </el-table-column>
        <el-table-column
          label="计划回款金额（元）"
          prop="price"
          width="160"
        ><template slot-scope="scope">{{ formatMoney(scope.row.price) }}</template></el-table-column>
        <el-table-column
          label="计划回款日期"
          prop="returnTime"
          width="160"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="提前几天提醒"
          prop="remindDays"
          width="130"
        />
        <el-table-column
          label="提醒日期"
          prop="remindTime"
          width="160"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="回款方式"
          prop="returnType"
          width="130"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE"
          :value="scope.row.returnType"
        /></template></el-table-column>
        <el-table-column
          label="负责人"
          prop="ownerUserName"
          width="120"
        />
        <el-table-column
          label="备注"
          prop="remark"
          min-width="160"
        />
        <el-table-column
          label="实际回款金额（元）"
          width="160"
        ><template slot-scope="scope">{{ formatMoney(scope.row.receivable && scope.row.receivable.price || 0) }}</template></el-table-column>
        <el-table-column
          label="实际回款日期"
          width="160"
        ><template slot-scope="scope">{{ dateFormatter2(scope.row, null, scope.row.receivable && scope.row.receivable.returnTime) }}</template></el-table-column>
        <el-table-column
          label="未回款金额（元）"
          width="160"
        ><template slot-scope="scope">{{ formatMoney(Number(scope.row.price || 0) - Number(scope.row.receivable && scope.row.receivable.price || 0)) }}</template></el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="230"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:receivable:create']"
              type="text"
              size="mini"
              :disabled="!!scope.row.receivableId"
              @click="openReceivableForm(scope.row)"
            >创建回款</el-button>
            <el-button
              v-hasPermi="['crm:receivable-plan:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['crm:receivable-plan:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row)"
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
    </el-card>
    <receivable-plan-form
      ref="form"
      @success="getList"
    />
    <receivable-form
      ref="receivableForm"
      @success="getList"
    />
  </div>
</template>

<script>
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import * as CustomerApi from '@/api/crm/customer'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils'
import ReceivablePlanForm from './ReceivablePlanForm.vue'
import ReceivableForm from '../ReceivableForm.vue'

export default {
  name: 'CrmReceivablePlan',
  components: { ReceivablePlanForm, ReceivableForm },
  data() { return { DICT_TYPE, loading: false, exportLoading: false, total: 0, list: [], customerList: [], activeName: '1', queryParams: { pageNo: 1, pageSize: 10, sceneType: '1', customerId: undefined, contractNo: undefined }} },
  created() {
    this.getList()
    CustomerApi.getCustomerSimpleList().then(response => { this.customerList = (response).data })
  },
  methods: {
    dateFormatter2,
    formatMoney(value) { const number = Number(value); return Number.isFinite(number) ? number.toFixed(2) : '-' },
    async getList() {
      this.loading = true
      try {
        const data = (await ReceivablePlanApi.getReceivablePlanPage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally { this.loading = false }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.queryParams.customerId = undefined
      this.queryParams.contractNo = undefined
      this.handleQuery()
    },
    handleTabClick(tab) { this.queryParams.sceneType = String(tab.name || (tab.$props && tab.$props.name) || this.activeName); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openReceivableForm(row) { this.$refs.receivableForm.open('create', undefined, row) },
    openDetail(id) { this.$router.push({ name: 'CrmReceivablePlanDetail', params: { id }}).catch(() => {}) },
    openCustomerDetail(id) { if (id) this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {}) },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除第 ' + (row.period || row.id) + ' 期回款计划？').then(() => ReceivablePlanApi.deleteReceivablePlan(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前回款计划数据？').then(() => { this.exportLoading = true; return ReceivablePlanApi.exportReceivablePlan(this.queryParams) }).then(response => { this.$download.excel(response.data, '回款计划.xls') }).catch(() => {}).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
