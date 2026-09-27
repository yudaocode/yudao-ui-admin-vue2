<template>
  <div class="crm-contract-list">
    <div class="contract-list-toolbar">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openForm"
      >创建合同</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      border
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="合同名称"
        prop="name"
        min-width="160"
      >
        <template slot-scope="scope"><el-link
          type="primary"
          :underline="false"
          @click="openDetail(scope.row.id)"
        >{{ scope.row.name }}</el-link></template>
      </el-table-column>
      <el-table-column
        label="合同编号"
        prop="no"
        min-width="140"
      />
      <el-table-column
        label="客户名称"
        prop="customerName"
        min-width="140"
      />
      <el-table-column
        label="合同金额（元）"
        prop="totalPrice"
        min-width="130"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="开始时间"
        prop="startTime"
        min-width="150"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="结束时间"
        prop="endTime"
        min-width="150"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="状态"
        prop="auditStatus"
        width="100"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.CRM_AUDIT_STATUS"
        :value="scope.row.auditStatus"
      /></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <ContractForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as ContractApi from '@/api/crm/contract'
import { BizTypeEnum } from '@/api/crm/permission'
import ContractForm from '../ContractForm.vue'
import { DICT_TYPE } from '@/utils/dict'

import { erpPriceTableColumnFormatter, dateFormatter } from '@/utils'

export default {
  name: 'CrmContractList',
  components: { ContractForm },
  props: {
    bizType: { type: Number, default: undefined },
    bizId: { type: [Number, String], default: undefined }
  },
  data() {
    return { DICT_TYPE, loading: false, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, customerId: undefined, businessId: undefined }}
  },
  computed: {
    scopeKey() { return String(this.bizType) + ':' + String(this.bizId) }
  },
  watch: {
    scopeKey: { immediate: true, handler: 'handleQuery' }
  },
  methods: {
    erpPriceTableColumnFormatter,
    dateFormatter,
    async getList() {
      if (!this.bizId || !this.bizType) return
      this.loading = true
      try {
        const query = Object.assign({}, this.queryParams, { customerId: undefined, businessId: undefined })
        if (Number(this.bizType) === BizTypeEnum.CRM_CUSTOMER) query.customerId = this.bizId
        else if (Number(this.bizType) === BizTypeEnum.CRM_BUSINESS) query.businessId = this.bizId
        else return
        const response = Number(this.bizType) === BizTypeEnum.CRM_CUSTOMER
          ? await ContractApi.getContractPageByCustomer(query)
          : await ContractApi.getContractPageByBusiness(query)
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally { this.loading = false }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    openForm() { this.$refs.form.open('create') },
    openDetail(id) { this.$router.push({ name: 'CrmContractDetail', params: { id }}).catch(() => {}) }
  }
}
</script>

<style scoped>
.contract-list-toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
</style>
