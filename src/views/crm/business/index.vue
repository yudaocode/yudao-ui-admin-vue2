<template>
  <div class="app-container">
    <doc-alert
      title="【商机】商机管理、商机状态"
      url="https://doc.iocoder.cn/crm/business/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item
        label="商机名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        clearable
        placeholder="请输入商机名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item><el-button
        type="primary"
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['crm:business:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button><el-button
        v-hasPermi="['crm:business:export']"
        type="success"
        plain
        icon="el-icon-download"
        :loading="exportLoading"
        @click="handleExport"
      >导出</el-button></el-form-item>
    </el-form>
    <el-tabs
      v-model="activeName"
      @tab-click="handleTabClick"
    ><el-tab-pane
      label="我负责的"
      name="1"
    /><el-tab-pane
      label="我参与的"
      name="2"
    /><el-tab-pane
      label="下属负责的"
      name="3"
    /></el-tabs>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="商机名称"
        prop="name"
        fixed="left"
        width="160"
      ><template slot-scope="scope"><el-link
        type="primary"
        :underline="false"
        @click="openDetail(scope.row.id)"
      >{{ scope.row.name }}</el-link></template></el-table-column>
      <el-table-column
        label="客户名称"
        prop="customerName"
        width="130"
      ><template slot-scope="scope"><el-link
        type="primary"
        :underline="false"
        @click="openCustomerDetail(scope.row.customerId)"
      >{{ scope.row.customerName }}</el-link></template></el-table-column>
      <el-table-column
        label="商机金额（元）"
        prop="totalPrice"
        width="140"
      ><template slot-scope="scope">{{ formatPrice(scope.row.totalPrice) }}</template></el-table-column>
      <el-table-column
        label="预计成交日期"
        prop="dealTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.dealTime) }}</template></el-table-column>
      <el-table-column
        label="备注"
        prop="remark"
        width="180"
      /><el-table-column
        label="下次联系时间"
        prop="contactNextTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.contactNextTime) }}</template></el-table-column><el-table-column
        label="负责人"
        prop="ownerUserName"
        width="100"
      /><el-table-column
        label="所属部门"
        prop="ownerUserDeptName"
        width="120"
      /><el-table-column
        label="最后跟进时间"
        prop="contactLastTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.contactLastTime) }}</template></el-table-column><el-table-column
        label="更新时间"
        prop="updateTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.updateTime) }}</template></el-table-column><el-table-column
        label="创建时间"
        prop="createTime"
        width="180"
      ><template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column><el-table-column
        label="创建人"
        prop="creatorName"
        width="100"
      /><el-table-column
        label="商机状态组"
        prop="statusTypeName"
        width="140"
      /><el-table-column
        label="商机阶段"
        prop="statusName"
        width="120"
      />
      <el-table-column
        label="操作"
        fixed="right"
        width="130"
      ><template slot-scope="scope"><el-button
        v-hasPermi="['crm:business:update']"
        type="text"
        size="mini"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['crm:business:delete']"
        type="text"
        size="mini"
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
    <business-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getBusinessPage, deleteBusiness, exportBusiness } from '@/api/crm/business'
import BusinessForm from './BusinessForm.vue'

export default {
  name: 'CrmBusiness',
  components: { BusinessForm },
  data() { return { loading: false, exportLoading: false, list: [], total: 0, activeName: '1', queryParams: { pageNo: 1, pageSize: 10, sceneType: '1', name: undefined }} },
  created() { this.getList() },
  methods: {
    formatPrice(value) { return value === undefined || value === null ? '-' : Number(value).toFixed(2) },
    getList() { this.loading = true; return getBusinessPage(this.queryParams).then(response => { const data = response.data; this.list = data.list; this.total = data.total }).finally(() => { this.loading = false }) },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.queryParams.name = undefined; this.handleQuery() },
    handleTabClick(tab) { this.queryParams.sceneType = String(tab.name || this.activeName); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openDetail(id) { this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {}) },
    openCustomerDetail(id) { this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {}) },
    handleDelete(id) { this.$modal.confirm('确认删除该商机吗？').then(() => deleteBusiness(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) },
    handleExport() { this.$modal.confirm('是否确认导出所有商机数据项？').then(() => { this.exportLoading = true; return exportBusiness(this.queryParams) }).then(response => this.$download.excel(response.data, '商机.xls')).catch(() => {}).finally(() => { this.exportLoading = false }) }
  }
}
</script>
