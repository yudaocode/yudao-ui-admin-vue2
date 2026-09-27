<template>
  <div class="crm-business-list">
    <div class="list-actions">
      <el-button
        icon="el-icon-s-opportunity"
        @click="openForm"
      >创建商机</el-button>
      <el-button
        v-if="queryParams.contactId"
        v-hasPermi="['crm:contact:create-business']"
        icon="el-icon-circle-plus-outline"
        @click="openBusinessModal"
      >关联</el-button>
      <el-button
        v-if="queryParams.contactId"
        v-hasPermi="['crm:contact:delete-business']"
        icon="el-icon-remove-outline"
        @click="deleteContactBusinessList"
      >解除关联</el-button>
    </div>

    <el-card shadow="never">
      <el-table
        ref="businessTable"
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="queryParams.contactId"
          type="selection"
          width="55"
        />
        <el-table-column
          label="商机名称"
          fixed="left"
          align="center"
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
          align="center"
          prop="price"
          width="120"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="customerName"
          min-width="140"
        />
        <el-table-column
          label="商机组"
          align="center"
          prop="statusTypeName"
          min-width="120"
        />
        <el-table-column
          label="商机阶段"
          align="center"
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
    </el-card>

    <business-form
      ref="form"
      @success="getList"
    />
    <business-list-modal
      ref="businessModal"
      :customer-id="customerId"
      @success="createContactBusinessList"
    />
  </div>
</template>

<script>
import * as BusinessApi from '@/api/crm/business'
import * as ContactApi from '@/api/crm/contact'
import { BizTypeEnum } from '@/api/crm/permission'
import { erpPriceTableColumnFormatter } from '@/utils'
import BusinessForm from '../BusinessForm.vue'
import BusinessListModal from './BusinessListModal.vue'

export default {
  name: 'CrmBusinessList',
  components: { BusinessForm, BusinessListModal },
  props: {
    bizType: { type: Number, required: true },
    bizId: { type: [Number, String], required: true },
    customerId: { type: [Number, String], default: undefined },
    contactId: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      selectedRows: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        customerId: undefined,
        contactId: undefined
      }
    }
  },
  computed: {
    scopeKey() {
      return String(this.bizType) + ':' + String(this.bizId)
    }
  },
  watch: {
    scopeKey: { immediate: true, handler: 'handleQuery' }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    erpPriceTableColumnFormatter,
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      this.queryParams.customerId = undefined
      this.queryParams.contactId = undefined
      try {
        let response
        if (Number(this.bizType) === BizTypeEnum.CRM_CUSTOMER) {
          this.queryParams.customerId = this.bizId
          response = await BusinessApi.getBusinessPageByCustomer(this.queryParams)
        } else if (Number(this.bizType) === BizTypeEnum.CRM_CONTACT) {
          this.queryParams.contactId = this.bizId
          response = await BusinessApi.getBusinessPageByContact(this.queryParams)
        } else {
          if (requestId === this.requestSequence) {
            this.list = []
            this.total = 0
          }
          return
        }
        if (requestId !== this.requestSequence) return
        const data = (response).data
        this.list = data.list
        this.total = data.total
        this.selectedRows = []
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      if (!this.bizId || !this.bizType) return
      this.queryParams.pageNo = 1
      this.getList()
    },
    openForm() {
      this.$refs.form.open('create', null, this.customerId, this.contactId)
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    },
    openBusinessModal() {
      this.$refs.businessModal.open()
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    async createContactBusinessList(businessIds) {
      const ids = (businessIds || []).concat(this.selectedRows.map(row => row.id))
      await ContactApi.createContactBusinessList({
        contactId: this.bizId,
        businessIds: Array.from(new Set(ids))
      })
      this.$modal.msgSuccess('关联商机成功')
      this.handleQuery()
    },
    async deleteContactBusinessList() {
      const businessIds = this.selectedRows.map(row => row.id)
      if (businessIds.length === 0) {
        this.$modal.msgError('未选择商机')
        return
      }
      await ContactApi.deleteContactBusinessList({ contactId: this.bizId, businessIds })
      this.$modal.msgSuccess('取关商机成功')
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.crm-business-list .list-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
