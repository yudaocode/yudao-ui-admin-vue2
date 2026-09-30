<template>
  <div class="app-container crm-receivable-page">
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
        label-width="68px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="回款编号"
          prop="no"
        >
          <el-input
            v-model="queryParams.no"
            clearable
            placeholder="请输入回款编号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="客户名称"
          prop="customerId"
        >
          <el-select
            v-model="queryParams.customerId"
            clearable
            filterable
            placeholder="请选择客户"
            style="width: 220px"
            @keyup.enter.native="handleQuery"
          >
            <el-option
              v-for="item in customerList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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
            v-hasPermi="['crm:receivable:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['crm:receivable:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
          <el-button
            type="info"
            plain
            icon="el-icon-date"
            @click="$router.push({ name: 'CrmReceivablePlanCanonicalSmoke' }).catch(() => {})"
          >回款计划</el-button>
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
          label="我参与的"
          name="2"
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
          label="回款编号"
          prop="no"
          fixed="left"
          width="180"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >{{ scope.row.no || '-' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="客户名称"
          prop="customerName"
          width="140"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openCustomerDetail(scope.row.customerId)"
            >{{ scope.row.customerName || '-' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="合同编号"
          prop="contract.no"
          width="180"
        >
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.contractId"
              type="primary"
              :underline="false"
              @click="openContractDetail(scope.row.contractId)"
            >{{ (scope.row.contract && scope.row.contract.no) || scope.row.contractNo || '-' }}</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          label="回款日期"
          prop="returnTime"
          width="150"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="回款金额（元）"
          prop="price"
          width="140"
        >
          <template slot-scope="scope">{{ formatMoney(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column
          label="回款方式"
          prop="returnType"
          width="130"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE"
            :value="scope.row.returnType"
          /></template>
        </el-table-column>
        <el-table-column
          label="合同金额（元）"
          prop="contract.totalPrice"
          width="140"
        >
          <template slot-scope="scope">{{ formatMoney(scope.row.contract && scope.row.contract.totalPrice) }}</template>
        </el-table-column>
        <el-table-column
          label="负责人"
          prop="ownerUserName"
          width="120"
        />
        <el-table-column
          label="所属部门"
          prop="ownerUserDeptName"
          width="120"
        />
        <el-table-column
          label="备注"
          prop="remark"
          min-width="180"
        />
        <el-table-column
          label="更新时间"
          prop="updateTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="创建人"
          prop="creatorName"
          width="120"
        />
        <el-table-column
          label="回款状态"
          prop="auditStatus"
          fixed="right"
          width="120"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_AUDIT_STATUS"
            :value="scope.row.auditStatus"
          /></template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="230"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:receivable:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-if="scope.row.auditStatus === 0"
              v-hasPermi="['crm:receivable:update']"
              type="text"
              size="mini"
              @click="handleSubmit(scope.row)"
            >提交审核</el-button>
            <el-button
              v-else
              v-hasPermi="['crm:receivable:update']"
              type="text"
              size="mini"
              @click="handleProcessDetail(scope.row)"
            >查看审批</el-button>
            <el-button
              v-hasPermi="['crm:receivable:delete']"
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

    <receivable-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as ReceivableApi from '@/api/crm/receivable'
import * as CustomerApi from '@/api/crm/customer'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter, dateFormatter2 } from '@/utils'
import ReceivableForm from './ReceivableForm.vue'

export default {
  name: 'CrmReceivable',
  components: { ReceivableForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      customerList: [],
      activeName: '1',
      queryParams: { pageNo: 1, pageSize: 10, sceneType: '1', no: undefined, customerId: undefined }
    }
  },
  created() {
    this.getList()
    CustomerApi.getCustomerSimpleList().then(response => { this.customerList = (response).data })
  },
  methods: {
    dateFormatter,
    dateFormatter2,
    formatMoney(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : '-'
    },
    async getList() {
      this.loading = true
      try {
        const data = (await ReceivableApi.getReceivablePage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally { this.loading = false }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.queryParams.no = undefined
      this.queryParams.customerId = undefined
      this.handleQuery()
    },
    handleTabClick(tab) {
      this.queryParams.sceneType = String(tab.name || (tab.$props && tab.$props.name) || this.activeName)
      this.handleQuery()
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openDetail(id) { this.$router.push({ name: 'CrmReceivableDetail', params: { id }}).catch(() => {}) },
    openCustomerDetail(id) { if (id) this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {}) },
    openContractDetail(id) { if (id) this.$router.push({ name: 'CrmContractDetail', params: { id }}).catch(() => {}) },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除回款“' + (row.no || row.id) + '”？').then(() => ReceivableApi.deleteReceivable(row.id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleSubmit(row) {
      this.$modal.confirm('您确定提交编号为【' + (row.no || row.id) + '】的回款审核吗？').then(() => ReceivableApi.submitReceivable(row.id)).then(() => {
        this.$modal.msgSuccess('提交审核成功')
        this.getList()
      }).catch(() => {})
    },
    handleProcessDetail(row) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.processInstanceId }}).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前回款数据？').then(() => {
        this.exportLoading = true
        return ReceivableApi.exportReceivable(this.queryParams)
      }).then(response => { this.$download.excel(response.data, '回款.xls') }).catch(() => {}).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
