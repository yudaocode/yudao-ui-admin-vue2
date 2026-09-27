<template>
  <section
    class="customer-business-list"
    aria-label="客户商机"
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
        创建商机
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
        label="商机名称"
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
        label="商机金额"
        prop="totalPrice"
        min-width="120"
      >
        <template slot-scope="scope">{{ formatPrice(scope.row.totalPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="客户名称"
        prop="customerName"
        min-width="130"
      />
      <el-table-column
        label="商机组"
        prop="statusTypeName"
        min-width="130"
      />
      <el-table-column
        label="商机阶段"
        prop="statusName"
        min-width="120"
      />
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
  </section>
</template>

<script>
import { getBusinessPageByCustomer } from '@/api/crm/business'
import BusinessForm from '@/views/crm/business/BusinessForm.vue'

export default {
  name: 'CrmCustomerBusinessList',
  components: { BusinessForm },
  props: {
    customerId: { type: [Number, String], required: true }
  },
  data() {
    return {
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
        const data = (await getBusinessPageByCustomer(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = data.list
        this.total = data.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    openForm() {
      this.$refs.form.open('create', undefined, this.customerId)
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    },
    formatPrice(value) {
      const price = Number(value)
      return Number.isFinite(price) ? price.toFixed(2) : '-'
    }
  }
}
</script>

<style scoped>
.list-toolbar { margin-bottom: 12px; }
</style>
