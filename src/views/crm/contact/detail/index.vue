<template>
  <div class="app-container crm-contact-detail">
    <contact-details-header
      :contact="contact"
      :loading="loading"
    >
      <el-button
        v-if="permissionReady && canWrite"
        type="primary"
        size="small"
        @click="openForm"
      >编辑</el-button>
      <el-button
        v-if="permissionReady && isOwner"
        type="primary"
        size="small"
        @click="openTransfer"
      >转移</el-button>
    </contact-details-header>
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="跟进记录"
          name="follow"
        >
          <follow-up-list
            v-if="contact.id"
            :biz-id="contactId"
            :biz-type="BizTypeEnum.CRM_CONTACT"
          />
        </el-tab-pane>
        <el-tab-pane
          label="详细资料"
          name="info"
        ><contact-details-info :contact="contact" /></el-tab-pane>
        <el-tab-pane
          label="操作日志"
          name="logs"
        ><el-table
          v-loading="logLoading"
          :data="logList"
          stripe
          border
        ><el-table-column
          label="操作人"
          prop="userName"
          width="140"
        /><el-table-column
          label="操作内容"
          prop="action"
          min-width="260"
        /><el-table-column
          label="操作时间"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        /></el-table></el-tab-pane>
        <el-tab-pane
          label="团队成员"
          name="permission"
        >
          <permission-list
            v-if="contact.id"
            ref="permissionList"
            :biz-id="contact.id"
            :biz-type="BizTypeEnum.CRM_CONTACT"
            :show-action="true"
            @permission-change="handlePermissionChange"
            @quit-team="close"
          />
        </el-tab-pane>
        <el-tab-pane
          label="商机"
          name="business"
          lazy
        >
          <business-list
            v-if="contact.id"
            :biz-id="contact.id"
            :biz-type="BizTypeEnum.CRM_CONTACT"
            :contact-id="contact.id"
            :customer-id="contact.customerId"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <contact-form
      ref="form"
      @success="getContact"
    />
    <contact-transfer-form
      ref="transferForm"
      @success="close"
    />
  </div>
</template>
<script>
import * as ContactApi from '@/api/crm/contact'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import { dateFormatter } from '@/utils'
import FollowUpList from '@/views/crm/followup/index.vue'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import ContactForm from '../ContactForm'
import ContactDetailsHeader from './ContactDetailsHeader'
import ContactDetailsInfo from './ContactDetailsInfo'
import ContactTransferForm from './ContactTransferForm'
import BusinessList from '@/views/crm/business/components/BusinessList.vue'
export default {
  name: 'CrmContactDetail',
  components: {
    ContactForm,
    ContactDetailsHeader,
    ContactDetailsInfo,
    ContactTransferForm,
    BusinessList,
    FollowUpList,
    PermissionList
  },
  data() {
    return {
      BizTypeEnum,
      contactId: undefined,
      contact: {},
      loading: false,
      activeTab: 'follow',
      logLoading: false,
      logList: [],
      permissionState: {
        ready: false,
        validateOwnerUser: false,
        validateWrite: false,
        isPool: false
      }
    }
  },
  computed: {
    permissionReady() { return this.permissionState.ready },
    isOwner() { return this.permissionState.validateOwnerUser },
    canWrite() { return this.permissionState.validateWrite }
  },
  created() {
    this.contactId = this.$route.params.id
    if (!this.contactId) {
      this.$modal.msgWarning('参数错误，联系人不能为空！')
      this.close()
      return
    }
    this.getContact()
  },
  methods: {
    dateFormatter,
    async getContact() { if (!this.contactId) return; this.loading = true; try { this.contact = (await ContactApi.getContact(this.contactId)).data; await this.getOperateLog() } finally { this.loading = false } },
    async getOperateLog() { this.logLoading = true; try { const data = (await getOperateLogPage({ bizType: BizTypeEnum.CRM_CONTACT, bizId: this.contactId })).data; this.logList = data.list } finally { this.logLoading = false } },
    openForm() { this.$refs.form.open('update', this.contactId) },
    openTransfer() { this.$refs.transferForm.open(this.contactId) },
    handlePermissionChange(state) {
      this.permissionState = Object.assign({}, this.permissionState, state || {})
    },
    close() {
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmContact' }).catch(() => {})
    }
  }
}
</script>
