<template>
  <div
    v-loading="loading"
    class="app-container crm-contract-detail"
  >
    <contract-details-header :contract="contract">
      <el-button
        v-if="permissionReady && canWrite"
        type="primary"
        size="small"
        @click="openForm('update', contract.id)"
      >编辑</el-button>
      <el-button
        v-if="permissionReady && isOwner"
        type="primary"
        size="small"
        @click="openTransfer"
      >转移</el-button>
    </contract-details-header>
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
            v-if="contract.id"
            :biz-id="contract.id"
            :biz-type="BizTypeEnum.CRM_CONTRACT"
          />
        </el-tab-pane>
        <el-tab-pane
          label="基本信息"
          name="info"
        ><contract-details-info :contract="contract" /></el-tab-pane>
        <el-tab-pane
          label="产品"
          name="product"
        ><contract-product-list :contract="contract" /></el-tab-pane>
        <el-tab-pane
          label="回款"
          name="receivable"
          lazy
        >
          <template v-if="contract.id">
            <receivable-plan-list
              :contract-id="contract.id"
              :customer-id="contract.customerId"
              @createReceivable="createReceivable"
            />
            <receivable-list
              ref="receivableList"
              :contract-id="contract.id"
              :customer-id="contract.customerId"
            />
          </template>
        </el-tab-pane>
        <el-tab-pane
          label="团队成员"
          name="permission"
        >
          <permission-list
            v-if="contract.id"
            ref="permissionList"
            :biz-id="contract.id"
            :biz-type="BizTypeEnum.CRM_CONTRACT"
            :show-action="true"
            @permission-change="handlePermissionChange"
            @quit-team="close"
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
      </el-tabs>
    </el-card>
    <contract-form
      ref="form"
      @success="getContractData"
    />
    <crm-transfer-form
      ref="transferForm"
      :biz-type="BizTypeEnum.CRM_CONTRACT"
      @success="close"
    />
  </div>
</template>

<script>
import * as ContractApi from '@/api/crm/contract'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import { dateFormatter } from '@/utils'
import FollowUpList from '@/views/crm/followup/index.vue'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import CrmTransferForm from '@/views/crm/permission/components/TransferForm.vue'
import ReceivableList from '@/views/crm/receivable/components/ReceivableList.vue'
import ReceivablePlanList from '@/views/crm/receivable/plan/components/ReceivablePlanList.vue'
import ContractForm from '../ContractForm.vue'
import ContractDetailsHeader from './ContractDetailsHeader.vue'
import ContractDetailsInfo from './ContractDetailsInfo.vue'
import ContractProductList from './ContractProductList.vue'

export default {
  name: 'CrmContractDetail',
  components: {
    ContractForm,
    ContractDetailsHeader,
    ContractDetailsInfo,
    ContractProductList,
    FollowUpList,
    PermissionList,
    CrmTransferForm,
    ReceivableList,
    ReceivablePlanList
  },
  props: {
    id: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      BizTypeEnum,
      contractId: undefined,
      loading: false,
      logLoading: false,
      logList: [],
      activeTab: 'follow',
      contract: {},
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
    const rawId = this.id || this.$route.params.id
    this.contractId = rawId ? Number(rawId) : undefined
    if (!this.contractId) {
      this.$modal.msgWarning('参数错误，合同不能为空！')
      this.close()
      return
    }
    this.getContractData()
  },
  methods: {
    dateFormatter,
    openForm(type, id) { this.$refs.form.open(type, id) },
    openTransfer() { this.$refs.transferForm.open(this.contract.id) },
    async getContractData() {
      if (!this.contractId) return
      this.loading = true
      try {
        this.contract = (await ContractApi.getContract(this.contractId)).data
        await this.getOperateLog()
      } finally {
        this.loading = false
      }
    },
    async getOperateLog() {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          bizType: BizTypeEnum.CRM_CONTRACT,
          bizId: this.contractId
        })).data
        this.logList = data.list
      } finally {
        this.logLoading = false
      }
    },
    createReceivable(planData) {
      this.$refs.receivableList.createReceivable(planData)
    },
    handlePermissionChange(state) {
      this.permissionState = Object.assign({}, this.permissionState, state || {})
    },
    close() {
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmContract' }).catch(() => {})
    }
  }
}
</script>
