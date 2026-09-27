<template>
  <section
    class="customer-contact-list"
    aria-label="客户联系人"
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
        创建联系人
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
        label="姓名"
        fixed="left"
        prop="name"
        min-width="140"
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
        label="手机号"
        prop="mobile"
        min-width="130"
      />
      <el-table-column
        label="职位"
        prop="post"
        min-width="110"
      />
      <el-table-column
        label="直属上级"
        prop="parentName"
        min-width="130"
      />
      <el-table-column
        label="关键决策人"
        prop="master"
        width="110"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.master"
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
    <contact-form
      ref="form"
      @success="getList"
    />
  </section>
</template>

<script>
import { getContactPageByCustomer } from '@/api/crm/contact'
import ContactForm from '@/views/crm/contact/ContactForm.vue'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'CrmCustomerContactList',
  components: { ContactForm },
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
        const data = (await getContactPageByCustomer(this.queryParams)).data
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
      this.$router.push({ name: 'CrmContactDetail', params: { id }}).catch(() => {})
    }
  }
}
</script>

<style scoped>
.list-toolbar { margin-bottom: 12px; }
</style>
