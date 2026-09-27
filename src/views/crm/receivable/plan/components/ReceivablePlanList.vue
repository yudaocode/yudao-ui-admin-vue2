<template>
  <el-card
    shadow="never"
    class="receivable-plan-list"
  >
    <div class="toolbar"><el-button
      type="primary"
      size="small"
      @click="openForm('create')"
    >创建回款计划</el-button></div>
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
      /><el-table-column
        label="合同编号"
        prop="contractNo"
        width="180"
      /><el-table-column
        label="期数"
        prop="period"
        width="80"
      />
      <el-table-column
        label="计划回款（元）"
        prop="price"
        width="150"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="计划回款日期"
        prop="returnTime"
        width="160"
        :formatter="dateFormatter2"
      /><el-table-column
        label="提前几天提醒"
        prop="remindDays"
        width="130"
      /><el-table-column
        label="提醒日期"
        prop="remindTime"
        width="160"
        :formatter="dateFormatter2"
      /><el-table-column
        label="负责人"
        prop="ownerUserName"
        width="120"
      />
      <el-table-column
        label="备注"
        prop="remark"
        min-width="160"
      /><el-table-column
        label="操作"
        fixed="right"
        width="210"
      ><template slot-scope="scope"><el-button
        v-hasPermi="['crm:receivable:create']"
        type="text"
        size="mini"
        :disabled="!!scope.row.receivableId"
        @click="$emit('createReceivable', scope.row)"
      >创建回款</el-button><el-button
        v-hasPermi="['crm:receivable-plan:update']"
        type="text"
        size="mini"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['crm:receivable-plan:delete']"
        type="text"
        size="mini"
        class="danger-text"
        @click="handleDelete(scope.row)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <receivable-plan-form
      ref="form"
      @success="getList"
    />
  </el-card>
</template>

<script>
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import { dateFormatter2, erpPriceTableColumnFormatter } from '@/utils'
import ReceivablePlanForm from '../ReceivablePlanForm.vue'

export default {
  name: 'CrmReceivablePlanList',
  components: { ReceivablePlanForm },
  props: { customerId: { type: [Number, String], default: undefined }, contractId: { type: [Number, String], default: undefined }},
  data() { return { loading: false, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, customerId: undefined, contractId: undefined }} },
  watch: { customerId: 'handleQuery', contractId: 'handleQuery' },
  created() { this.getList() },
  methods: {
    dateFormatter2,
    erpPriceTableColumnFormatter,
    async getList() {
      this.loading = true; this.queryParams.customerId = this.customerId; this.queryParams.contractId = this.contractId
      try { const data = (await ReceivablePlanApi.getReceivablePlanPageByCustomer(this.queryParams)).data; this.list = data.list; this.total = data.total } finally { this.loading = false }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    openForm(type, id) { this.$refs.form.open(type, id, this.customerId, this.contractId) },
    handleDelete(row) { this.$modal.confirm('是否确认删除第 ' + (row.period || row.id) + ' 期回款计划？').then(() => ReceivablePlanApi.deleteReceivablePlan(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
