<template>
  <div class="app-container crm-receivable-plan-detail">
    <receivable-plan-details-header
      :receivable-plan="receivablePlan"
      :loading="loading"
    >
      <el-button
        v-if="permissionReady && canWrite"
        type="primary"
        size="small"
        @click="openForm('update', receivablePlan.id)"
      >编辑</el-button>
    </receivable-plan-details-header>
    <el-card
      shadow="never"
      class="detail-tabs"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="详细资料"
          name="info"
        ><receivable-plan-details-info :receivable-plan="receivablePlan" /></el-tab-pane>
        <el-tab-pane
          label="操作日志"
          name="logs"
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
            v-if="receivablePlan.id"
            ref="permissionList"
            :biz-id="receivablePlan.id"
            :biz-type="BizTypeEnum.CRM_RECEIVABLE_PLAN"
            :show-action="true"
            @permission-change="handlePermissionChange"
            @quit-team="close"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <receivable-plan-form
      ref="form"
      @success="getReceivablePlan"
    />
  </div>
</template>

<script>
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import { dateFormatter } from '@/utils'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import ReceivablePlanForm from '../ReceivablePlanForm.vue'
import ReceivablePlanDetailsHeader from './ReceivablePlanDetailsHeader.vue'
import ReceivablePlanDetailsInfo from './ReceivablePlanDetailsInfo.vue'

export default {
  name: 'CrmReceivablePlanDetail',
  components: {
    ReceivablePlanForm,
    ReceivablePlanDetailsHeader,
    ReceivablePlanDetailsInfo,
    PermissionList
  },
  data() {
    return {
      BizTypeEnum,
      receivablePlanId: undefined,
      receivablePlan: {},
      loading: false,
      activeTab: 'info',
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
    canWrite() { return this.permissionState.validateWrite }
  },
  created() {
    const rawId = this.$route.params.id
    this.receivablePlanId = rawId ? Number(rawId) : undefined
    if (!this.receivablePlanId) {
      this.$modal.msgWarning('参数错误，回款计划不能为空！')
      this.close()
      return
    }
    this.getReceivablePlan()
  },
  methods: {
    dateFormatter,
    async getReceivablePlan() {
      if (!this.receivablePlanId) return
      this.loading = true
      try {
        this.receivablePlan = (await ReceivablePlanApi.getReceivablePlan(this.receivablePlanId)).data
        await this.getOperateLog()
      } finally {
        this.loading = false
      }
    },
    async getOperateLog() {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          bizType: BizTypeEnum.CRM_RECEIVABLE_PLAN,
          bizId: this.receivablePlanId
        })).data
        this.logList = data.list
      } finally {
        this.logLoading = false
      }
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handlePermissionChange(state) {
      this.permissionState = Object.assign({}, this.permissionState, state || {})
    },
    close() {
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmReceivablePlan' }).catch(() => {})
    }
  }
}
</script>
