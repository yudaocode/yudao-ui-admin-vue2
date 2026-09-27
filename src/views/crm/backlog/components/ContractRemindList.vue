<template>
  <section
    class="backlog-list"
    aria-label="即将到期的合同"
  >
    <el-card
      shadow="never"
      class="filter-card"
    >
      <div class="list-title">即将到期的合同</div>
      <el-form
        :inline="true"
        :model="queryParams"
        label-width="78px"
        size="small"
      >
        <el-form-item label="到期状态">
          <el-select
            v-model="queryParams.expiryType"
            placeholder="状态"
            @change="handleQuery"
          >
            <el-option
              v-for="option in CONTRACT_EXPIRY_TYPE"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <contract-backlog-table
        :loading="loading"
        :list="list"
        @open-detail="openDetail"
        @open-customer="openCustomerDetail"
        @open-contact="openContactDetail"
        @open-business="openBusinessDetail"
        @open-process="handleProcessDetail"
      />
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </section>
</template>

<script>
import * as ContractApi from '@/api/crm/contract'
import ContractBacklogTable from './ContractBacklogTable.vue'
import { CONTRACT_EXPIRY_TYPE } from './common'

export default {
  name: 'CrmContractRemindList',
  components: { ContractBacklogTable },
  data() {
    return {
      CONTRACT_EXPIRY_TYPE,
      loading: false,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sceneType: 1,
        expiryType: 1
      }
    }
  },
  created() {
    this.getList()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const page = (await ContractApi.getContractPage(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = page.list
        this.total = page.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    push(name, id) {
      if (!id) return
      this.$router.push({ name, params: { id }}).catch(() => {})
    },
    openDetail(id) { this.push('CrmContractDetail', id) },
    openCustomerDetail(id) { this.push('CrmCustomerDetail', id) },
    openContactDetail(id) { this.push('CrmContactDetail', id) },
    openBusinessDetail(id) { this.push('CrmBusinessDetail', id) },
    handleProcessDetail(row) {
      if (!row || !row.processInstanceId) return
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: row.processInstanceId }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.list-title { margin-bottom: 18px; font-size: 18px; line-height: 24px; font-weight: 500; }
</style>
