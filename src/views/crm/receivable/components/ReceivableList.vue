<template>
  <el-card
    shadow="never"
    class="receivable-list"
  >
    <div class="toolbar"><el-button
      type="primary"
      size="small"
      @click="openForm('create')"
    >创建回款</el-button></div>
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
        width="170"
      />
      <el-table-column
        label="客户"
        prop="customerName"
        width="140"
      />
      <el-table-column
        label="合同"
        prop="contract.no"
        width="170"
      />
      <el-table-column
        label="回款日期"
        prop="returnTime"
        width="150"
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
        label="回款金额（元）"
        prop="price"
        width="150"
        :formatter="erpPriceTableColumnFormatter"
      />
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
        label="操作"
        fixed="right"
        width="140"
      ><template slot-scope="scope"><el-button
        v-hasPermi="['crm:receivable:update']"
        type="text"
        size="mini"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['crm:receivable:delete']"
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
    <receivable-form
      ref="form"
      @success="getList"
    />
  </el-card>
</template>

<script>
import * as ReceivableApi from '@/api/crm/receivable'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter2, erpPriceTableColumnFormatter } from '@/utils'
import ReceivableForm from '../ReceivableForm.vue'

export default {
  name: 'CrmReceivableList',
  components: { ReceivableForm },
  props: { customerId: { type: [Number, String], default: undefined }, contractId: { type: [Number, String], default: undefined }},
  data() { return { DICT_TYPE, loading: false, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, customerId: undefined, contractId: undefined }} },
  watch: { customerId: 'handleQuery', contractId: 'handleQuery' },
  created() { this.getList() },
  methods: {
    dateFormatter2,
    erpPriceTableColumnFormatter,
    async getList() {
      this.loading = true
      this.queryParams.customerId = this.customerId
      this.queryParams.contractId = this.contractId
      try { const data = (await ReceivableApi.getReceivablePageByCustomer(this.queryParams)).data; this.list = data.list; this.total = data.total } finally { this.loading = false }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    openForm(type, id) { this.$refs.form.open(type, id, { customerId: this.customerId, contractId: this.contractId }) },
    createReceivable(planData) { this.$refs.form.open('create', undefined, planData) },
    handleDelete(row) { this.$modal.confirm('是否确认删除回款“' + (row.no || row.id) + '”？').then(() => ReceivableApi.deleteReceivable(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
