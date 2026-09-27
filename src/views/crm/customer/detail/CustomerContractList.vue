<template>
  <section
    class="customer-contract-list"
    aria-label="客户合同"
  >
    <el-row
      type="flex"
      justify="end"
      class="list-toolbar"
    >
      <el-button
        size="small"
        type="primary"
        icon="el-icon-plus"
        @click="openForm"
      >
        创建合同
      </el-button>
    </el-row>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      border
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="合同名称"
        fixed="left"
        prop="name"
        min-width="160"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            :underline="false"
            @click="openDetail(scope.row.id)"
          >
            {{ scope.row.name || '-' }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        label="合同编号"
        prop="no"
        min-width="150"
      />
      <el-table-column
        label="客户名称"
        prop="customerName"
        min-width="130"
      />
      <el-table-column
        label="合同金额（元）"
        prop="totalPrice"
        min-width="140"
      >
        <template slot-scope="scope">{{ formatMoney(scope.row.totalPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="开始时间"
        prop="startTime"
        min-width="160"
      >
        <template slot-scope="scope">{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') || '-' }}</template>
      </el-table-column>
      <el-table-column
        label="结束时间"
        prop="endTime"
        min-width="160"
      >
        <template slot-scope="scope">{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') || '-' }}</template>
      </el-table-column>
      <el-table-column
        label="状态"
        prop="auditStatus"
        width="100"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.CRM_AUDIT_STATUS"
            :value="scope.row.auditStatus"
          />
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
    <contract-form
      ref="form"
      @success="getList"
    />
  </section>
</template>

<script>
import { getContractPageByCustomer } from '@/api/crm/contract'
import ContractForm from '@/views/crm/contract/ContractForm.vue'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'CrmCustomerContractList',
  components: { ContractForm },
  props: {
    customerId: { type: [Number, String], required: true }
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, customerId: undefined },
      requestSequence: 0
    }
  },
  watch: {
    customerId: { immediate: true, handler: 'handleQuery' }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    handleQuery() {
      this.queryParams.pageNo = 1
      if (this.customerId !== undefined && this.customerId !== null && this.customerId !== '') this.getList()
    },
    async getList() {
      const requestId = ++this.requestSequence
      this.queryParams.customerId = this.customerId
      this.loading = true
      try {
        const data = (await getContractPageByCustomer(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = data.list
        this.total = data.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    openForm() {
      this.$refs.form.open('create')
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmContractDetail', params: { id }}).catch(() => {})
    },
    formatMoney(value) {
      const price = Number(value)
      return Number.isFinite(price) ? price.toFixed(2) : '-'
    }
  }
}
</script>

<style scoped>
.list-toolbar { margin-bottom: 12px; }
</style>
