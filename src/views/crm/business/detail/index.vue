<template>
  <div
    v-loading="loading"
    class="app-container crm-business-detail"
  >
    <business-details-header :business="business">
      <el-button
        v-if="permissionReady && canWrite"
        type="primary"
        size="small"
        @click="openForm('update', business.id)"
      >编辑</el-button>
      <el-button
        v-if="permissionReady && canWrite"
        type="success"
        size="small"
        :disabled="Boolean(business.endStatus)"
        @click="openStatusForm"
      >变更商机状态</el-button>
      <el-button
        v-if="permissionReady && isOwner"
        type="primary"
        size="small"
        @click="openTransfer"
      >转移</el-button>
    </business-details-header>
    <el-card
      shadow="never"
      class="detail-tabs"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="跟进记录"
          name="follow"
        >
          <follow-up-list
            v-if="business.id"
            :biz-id="businessId"
            :biz-type="BizTypeEnum.CRM_BUSINESS"
          />
        </el-tab-pane>
        <el-tab-pane
          label="详细资料"
          name="info"
        ><business-details-info :business="business" /></el-tab-pane>
        <el-tab-pane
          label="联系人"
          name="contact"
          lazy
        >
          <contact-list
            v-if="business.id"
            :biz-id="business.id"
            :biz-type="BizTypeEnum.CRM_BUSINESS"
            :business-id="business.id"
            :customer-id="business.customerId"
          />
        </el-tab-pane>
        <el-tab-pane
          label="产品"
          name="product"
        ><business-product-list :business="business" /></el-tab-pane>
        <el-tab-pane
          label="合同"
          name="contract"
          lazy
        >
          <contract-list
            v-if="business.id"
            :biz-id="business.id"
            :biz-type="BizTypeEnum.CRM_BUSINESS"
          />
        </el-tab-pane>
        <el-tab-pane
          label="操作日志"
          name="log"
        >
          <el-table
            v-loading="logLoading"
            :data="logList"
            stripe
            border
          >
            <el-table-column
              label="操作人"
              prop="userName"
              width="140"
            />
            <el-table-column
              label="操作内容"
              prop="action"
              min-width="260"
            />
            <el-table-column
              label="操作时间"
              prop="createTime"
              width="180"
              :formatter="dateFormatter"
            />
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          label="团队成员"
          name="permission"
        >
          <permission-list
            v-if="business.id"
            ref="permissionList"
            :biz-id="business.id"
            :biz-type="BizTypeEnum.CRM_BUSINESS"
            :show-action="true"
            @permission-change="handlePermissionChange"
            @quit-team="close"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <business-form
      ref="form"
      @success="getBusiness"
    />
    <business-update-status-form
      ref="statusForm"
      @success="getBusiness"
    />
    <crm-transfer-form
      ref="transferForm"
      :biz-type="BizTypeEnum.CRM_BUSINESS"
      @success="close"
    />
  </div>
</template>

<script>
import * as BusinessApi from '@/api/crm/business'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import { dateFormatter } from '@/utils'
import FollowUpList from '@/views/crm/followup/index.vue'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import CrmTransferForm from '@/views/crm/permission/components/TransferForm.vue'
import ContactList from '@/views/crm/contact/components/ContactList.vue'
import ContractList from '@/views/crm/contract/components/ContractList.vue'
import BusinessForm from '../BusinessForm.vue'
import BusinessUpdateStatusForm from '../BusinessUpdateStatusForm.vue'
import BusinessDetailsHeader from './BusinessDetailsHeader.vue'
import BusinessDetailsInfo from './BusinessDetailsInfo.vue'
import BusinessProductList from './BusinessProductList.vue'

export default {
  name: 'CrmBusinessDetail',
  components: {
    BusinessForm,
    BusinessUpdateStatusForm,
    BusinessDetailsHeader,
    BusinessDetailsInfo,
    BusinessProductList,
    ContactList,
    ContractList,
    FollowUpList,
    PermissionList,
    CrmTransferForm
  },
  data() {
    return {
      BizTypeEnum,
      businessId: undefined,
      loading: false,
      logLoading: false,
      logList: [],
      activeTab: 'follow',
      business: {},
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
    this.businessId = this.$route.params.id
    if (!this.businessId) {
      this.$modal.msgWarning('参数错误，商机不能为空！')
      this.close()
      return
    }
    this.getBusiness()
  },
  methods: {
    dateFormatter,
    async getBusiness() {
      if (!this.businessId) return
      this.loading = true
      try {
        this.business = (await BusinessApi.getBusiness(this.businessId)).data
        await this.getOperateLog()
      } finally {
        this.loading = false
      }
    },
    async getOperateLog() {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          bizType: BizTypeEnum.CRM_BUSINESS,
          bizId: this.businessId
        })).data
        this.logList = data.list
      } finally {
        this.logLoading = false
      }
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openStatusForm() { this.$refs.statusForm.open(this.business) },
    openTransfer() { this.$refs.transferForm.open(this.business.id) },
    handlePermissionChange(state) {
      this.permissionState = Object.assign({}, this.permissionState, state || {})
    },
    close() {
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmBusiness' }).catch(() => {})
    }
  }
}
</script>
