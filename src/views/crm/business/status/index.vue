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
    ><el-form-item><el-button
      v-hasPermi="['crm:business-status:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    ><el-table-column
      label="状态组名"
      prop="name"
    /><el-table-column
      label="应用部门"
      prop="deptNames"
    ><template slot-scope="scope">{{ scope.row.deptNames && scope.row.deptNames.length ? scope.row.deptNames.join(' ') : '全公司' }}</template></el-table-column><el-table-column
      label="创建人"
      prop="creator"
    /><el-table-column
      label="创建时间"
      prop="createTime"
      width="180"
    ><template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column><el-table-column
      label="操作"
      width="130"
    ><template slot-scope="scope"><el-button
      v-hasPermi="['crm:business-status:update']"
      type="text"
      size="mini"
      @click="openForm('update', scope.row.id)"
    >编辑</el-button><el-button
      v-hasPermi="['crm:business-status:delete']"
      type="text"
      size="mini"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <business-status-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getBusinessStatusPage, deleteBusinessStatus } from '@/api/crm/business/status'
import BusinessStatusForm from './BusinessStatusForm.vue'

export default {
  name: 'CrmBusinessStatus',
  components: { BusinessStatusForm },
  data() { return { loading: false, list: [], total: 0, queryParams: { pageNo: 1, pageSize: 10 }} },
  created() { this.getList() },
  methods: {
    getList() { this.loading = true; return getBusinessStatusPage(this.queryParams).then(response => { const data = response.data; this.list = data.list; this.total = data.total }).finally(() => { this.loading = false }) },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleDelete(id) { this.$modal.confirm('确认删除该商机状态组吗？').then(() => deleteBusinessStatus(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>
