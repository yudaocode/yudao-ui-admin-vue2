<template>
  <div
    v-loading="loading"
    class="app-container crm-customer-detail"
  >
    <customer-details-header
      :customer="customer"
      :loading="loading"
    >
      <el-button
        v-if="permissionReady && canWrite"
        v-hasPermi="['crm:customer:update']"
        type="primary"
        size="small"
        @click="openForm"
      >编辑</el-button>
      <el-button
        v-if="permissionReady && isOwner"
        type="primary"
        size="small"
        @click="transfer"
      >转移</el-button>
      <el-button
        v-if="permissionReady && canWrite"
        size="small"
        @click="handleUpdateDealStatus"
      >更改成交状态</el-button>
      <el-button
        v-if="customer.lockStatus && permissionReady && isOwner"
        size="small"
        @click="handleUnlock"
      >解锁</el-button>
      <el-button
        v-if="!customer.lockStatus && permissionReady && isOwner"
        size="small"
        @click="handleLock"
      >锁定</el-button>
      <el-button
        v-if="customer.id && !customer.ownerUserId"
        type="primary"
        size="small"
        @click="handleReceive"
      >领取</el-button>
      <el-button
        v-if="customer.id && !customer.ownerUserId"
        type="primary"
        size="small"
        @click="handleDistributeForm"
      >分配</el-button>
      <el-button
        v-if="customer.ownerUserId && permissionReady && isOwner"
        size="small"
        @click="handlePutPool"
      >放入公海</el-button>
    </customer-details-header>

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
            v-if="customer.id"
            ref="followUpList"
            :biz-id="customerId"
            :biz-type="BizTypeEnum.CRM_CUSTOMER"
          />
        </el-tab-pane>
        <el-tab-pane
          label="基本信息"
          name="info"
        >
          <customer-details-info :customer="customer" />
        </el-tab-pane>
        <el-tab-pane
          label="联系人"
          name="contact"
          lazy
        >
          <customer-contact-list
            v-if="customer.id"
            :customer-id="customerId"
          />
        </el-tab-pane>
        <el-tab-pane
          label="团队成员"
          name="permission"
        >
          <permission-list
            v-if="customer.id"
            ref="permissionList"
            :biz-id="customerId"
            :biz-type="BizTypeEnum.CRM_CUSTOMER"
            :show-action="!isPool"
            @permission-change="handlePermissionChange"
            @quit-team="close"
          />
        </el-tab-pane>
        <el-tab-pane
          label="商机"
          name="business"
          lazy
        >
          <customer-business-list
            v-if="customer.id"
            :customer-id="customerId"
          />
        </el-tab-pane>
        <el-tab-pane
          label="合同"
          name="contract"
          lazy
        >
          <customer-contract-list
            v-if="customer.id"
            :customer-id="customerId"
          />
        </el-tab-pane>
        <el-tab-pane
          label="回款"
          name="receivable"
          lazy
        >
          <template v-if="customer.id">
            <receivable-plan-list
              :customer-id="customerId"
              @createReceivable="createReceivable"
            />
            <receivable-list
              ref="receivableList"
              :customer-id="customerId"
            />
          </template>
        </el-tab-pane>
        <el-tab-pane
          label="操作日志"
          name="log"
        >
          <el-empty
            v-if="!logLoading && logList.length === 0"
            description="暂无操作日志"
          />
          <el-timeline
            v-else
            v-loading="logLoading"
            class="operate-log-list"
          >
            <el-timeline-item
              v-for="log in logList"
              :key="log.id || (log.createTime + '-' + log.action)"
              :timestamp="parseTime(log.createTime)"
              placement="top"
            >
              <el-tag
                size="small"
                type="success"
              >{{ log.userName || '-' }}</el-tag>
              <span class="log-action">{{ log.action || '-' }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <customer-form
      ref="form"
      @success="getCustomer"
    />
    <customer-distribute-form
      ref="distributeForm"
      @success="getCustomer"
    />
    <crm-transfer-form
      ref="transferForm"
      :biz-type="BizTypeEnum.CRM_CUSTOMER"
      @success="close"
    />
  </div>
</template>

<script>
import * as CustomerApi from '@/api/crm/customer'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import CustomerForm from '@/views/crm/customer/CustomerForm.vue'
import CustomerDistributeForm from '@/views/crm/customer/pool/CustomerDistributeForm.vue'
import ReceivableList from '@/views/crm/receivable/components/ReceivableList.vue'
import ReceivablePlanList from '@/views/crm/receivable/plan/components/ReceivablePlanList.vue'
import FollowUpList from '@/views/crm/followup/index.vue'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import CrmTransferForm from '@/views/crm/permission/components/TransferForm.vue'
import CustomerDetailsInfo from './CustomerDetailsInfo.vue'
import CustomerDetailsHeader from './CustomerDetailsHeader.vue'
import CustomerContactList from './CustomerContactList.vue'
import CustomerBusinessList from './CustomerBusinessList.vue'
import CustomerContractList from './CustomerContractList.vue'

export default {
  name: 'CrmCustomerDetail',
  components: {
    CustomerForm,
    CustomerDistributeForm,
    CustomerDetailsInfo,
    CustomerDetailsHeader,
    CustomerContactList,
    CustomerBusinessList,
    CustomerContractList,
    ReceivableList,
    ReceivablePlanList,
    FollowUpList,
    PermissionList,
    CrmTransferForm
  },
  data() {
    return {
      BizTypeEnum,
      customerId: undefined,
      customer: {},
      loading: false,
      logLoading: false,
      logList: [],
      activeTab: 'follow',
      permissionState: {
        ready: false,
        validateOwnerUser: false,
        validateWrite: false,
        isPool: false
      },
      requestSequence: 0
    }
  },
  computed: {
    permissionReady() {
      return this.permissionState.ready
    },
    isOwner() {
      return this.permissionState.validateOwnerUser
    },
    canWrite() {
      return this.permissionState.validateWrite
    },
    isPool() {
      return this.permissionState.isPool
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(value) {
        if (value === undefined || value === null || value === '') {
          this.$message.warning('参数错误，客户不能为空！')
          this.close()
          return
        }
        this.customerId = value
        this.permissionState = {
          ready: false,
          validateOwnerUser: false,
          validateWrite: false,
          isPool: false
        }
        this.getCustomer()
      }
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async getCustomer() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const [customerResponse] = await Promise.all([
          CustomerApi.getCustomer(this.customerId),
          this.getOperateLog(requestId)
        ])
        if (requestId !== this.requestSequence) return
        this.customer = (customerResponse).data
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    async getOperateLog(parentRequestId) {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          pageNo: 1,
          pageSize: 100,
          bizType: BizTypeEnum.CRM_CUSTOMER,
          bizId: this.customerId
        })).data
        if (parentRequestId !== this.requestSequence) return
        this.logList = data.list
      } finally {
        if (parentRequestId === this.requestSequence) this.logLoading = false
      }
    },
    openForm() {
      this.$refs.form.open('update', this.customerId)
    },
    transfer() {
      this.$refs.transferForm.open(this.customerId)
    },
    handleUpdateDealStatus() {
      const dealStatus = !this.customer.dealStatus
      this.$modal.confirm('确定更新成交状态为【' + (dealStatus ? '已成交' : '未成交') + '】吗？')
        .then(() => CustomerApi.updateCustomerDealStatus(this.customerId, dealStatus))
        .then(() => {
          this.$modal.msgSuccess('更新成交状态成功')
          return this.getCustomer()
        })
        .catch(() => {})
    },
    handleLock() {
      this.updateLockStatus(true)
    },
    handleUnlock() {
      this.updateLockStatus(false)
    },
    updateLockStatus(lockStatus) {
      const action = lockStatus ? '锁定' : '解锁'
      this.$modal.confirm('确定' + action + '客户【' + (this.customer.name || this.customerId) + '】吗？')
        .then(() => CustomerApi.lockCustomer(this.customerId, lockStatus))
        .then(() => {
          this.$modal.msgSuccess(action + '客户成功')
          return this.getCustomer()
        })
        .catch(() => {})
    },
    handleReceive() {
      this.$modal.confirm('确定领取客户【' + (this.customer.name || this.customerId) + '】吗？')
        .then(() => CustomerApi.receiveCustomer([this.customerId]))
        .then(() => {
          this.$modal.msgSuccess('领取客户成功')
          return this.getCustomer()
        })
        .catch(() => {})
    },
    handleDistributeForm() {
      this.$refs.distributeForm.open(this.customerId)
    },
    handlePutPool() {
      this.$modal.confirm('确定将客户【' + (this.customer.name || this.customerId) + '】放入公海吗？')
        .then(() => CustomerApi.putCustomerPool(this.customerId))
        .then(() => {
          this.$modal.msgSuccess('客户放入公海成功')
          this.close()
        })
        .catch(() => {})
    },
    createReceivable(planData) {
      const list = this.$refs.receivableList
      if (list && list.$refs && list.$refs.form) {
        list.$refs.form.open('create', undefined, planData)
      }
    },
    handlePermissionChange(state) {
      this.permissionState = Object.assign({}, this.permissionState, state || {})
    },
    close() {
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmCustomer' }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.detail-tabs { min-height: 320px; }
.operate-log-list { padding: 18px 20px 0; }
.log-action { margin-left: 10px; color: #606266; }
</style>
