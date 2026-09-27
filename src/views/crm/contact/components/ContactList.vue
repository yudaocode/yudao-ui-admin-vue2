<template>
  <div class="crm-contact-list">
    <div class="list-actions">
      <el-button
        icon="el-icon-user"
        @click="openForm"
      >创建联系人</el-button>
      <el-button
        v-if="queryParams.businessId"
        v-hasPermi="['crm:contact:create-business']"
        icon="el-icon-circle-plus-outline"
        @click="openContactModal"
      >关联</el-button>
      <el-button
        v-if="queryParams.businessId"
        v-hasPermi="['crm:contact:delete-business']"
        icon="el-icon-remove-outline"
        @click="deleteContactBusinessList"
      >解除关联</el-button>
    </div>

    <el-card shadow="never">
      <el-table
        ref="contactTable"
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="queryParams.businessId"
          type="selection"
          width="55"
        />
        <el-table-column
          align="center"
          fixed="left"
          label="姓名"
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
          align="center"
          label="手机号"
          prop="mobile"
          min-width="120"
        />
        <el-table-column
          align="center"
          label="职位"
          prop="post"
          min-width="100"
        />
        <el-table-column
          align="center"
          label="直属上级"
          prop="parentName"
          min-width="110"
        />
        <el-table-column
          align="center"
          label="是否关键决策人"
          prop="master"
          min-width="130"
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
    </el-card>

    <contact-form
      ref="form"
      @success="getList"
    />
    <contact-list-modal
      ref="contactModal"
      :customer-id="customerId"
      @success="createContactBusinessList"
    />
  </div>
</template>

<script>
import * as ContactApi from '@/api/crm/contact'
import { BizTypeEnum } from '@/api/crm/permission'
import { DICT_TYPE } from '@/utils/dict'
import ContactForm from '../ContactForm.vue'
import ContactListModal from './ContactListModal.vue'

export default {
  name: 'CrmContactList',
  components: { ContactForm, ContactListModal },
  props: {
    bizType: { type: Number, required: true },
    bizId: { type: [Number, String], required: true },
    customerId: { type: [Number, String], default: undefined },
    businessId: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      total: 0,
      list: [],
      selectedRows: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        customerId: undefined,
        businessId: undefined
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
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      this.queryParams.customerId = undefined
      this.queryParams.businessId = undefined
      try {
        let response
        if (Number(this.bizType) === BizTypeEnum.CRM_CUSTOMER) {
          this.queryParams.customerId = this.bizId
          response = await ContactApi.getContactPageByCustomer(this.queryParams)
        } else if (Number(this.bizType) === BizTypeEnum.CRM_BUSINESS) {
          this.queryParams.businessId = this.bizId
          response = await ContactApi.getContactPageByBusiness(this.queryParams)
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
      this.$refs.form.open('create', undefined, this.customerId, this.businessId)
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmContactDetail', params: { id }}).catch(() => {})
    },
    openContactModal() {
      this.$refs.contactModal.open()
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    async createContactBusinessList(contactIds) {
      const ids = (contactIds || []).concat(this.selectedRows.map(row => row.id))
      await ContactApi.createContactBusinessList2({
        businessId: this.bizId,
        contactIds: Array.from(new Set(ids))
      })
      this.$modal.msgSuccess('关联联系人成功')
      this.handleQuery()
    },
    async deleteContactBusinessList() {
      const contactIds = this.selectedRows.map(row => row.id)
      if (contactIds.length === 0) {
        this.$modal.msgError('未选择联系人')
        return
      }
      await ContactApi.deleteContactBusinessList2({ businessId: this.bizId, contactIds })
      this.$modal.msgSuccess('取关联系人成功')
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.crm-contact-list .list-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
