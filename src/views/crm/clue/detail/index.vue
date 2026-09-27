<template>
  <div class="app-container crm-clue-detail">
    <clue-details-header
      :clue="clue"
      :loading="loading"
    >
      <el-button
        v-if="permissionReady && canWrite"
        v-hasPermi="['crm:clue:update']"
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
      <el-button
        v-if="permissionReady && isOwner && !clue.transformStatus"
        type="success"
        size="small"
        @click="handleTransform"
      >转化为客户</el-button>
      <el-button
        v-if="clue.transformStatus"
        type="success"
        size="small"
        disabled
      >已转化客户</el-button>
    </clue-details-header>
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="跟进记录"
          name="follow"
        >
          <follow-up-list
            v-if="clue.id"
            :biz-id="clueId"
            :biz-type="BizTypeEnum.CRM_CLUE"
          />
        </el-tab-pane>
        <el-tab-pane
          label="基本信息"
          name="info"
        ><clue-details-info :clue="clue" /></el-tab-pane>
        <el-tab-pane
          label="团队成员"
          name="permission"
        >
          <permission-list
            v-if="clue.id"
            ref="permissionList"
            :biz-id="clue.id"
            :biz-type="BizTypeEnum.CRM_CLUE"
            :show-action="true"
            @permission-change="handlePermissionChange"
            @quit-team="close"
          />
        </el-tab-pane>
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
      </el-tabs>
    </el-card>
    <clue-form
      ref="form"
      @success="getClue"
    />
    <clue-transfer-form
      ref="transferForm"
      @success="close"
    />
  </div>
</template>

<script>
import * as ClueApi from '@/api/crm/clue'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import { dateFormatter } from '@/utils'
import FollowUpList from '@/views/crm/followup/index.vue'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import ClueForm from '../ClueForm'
import ClueDetailsHeader from './ClueDetailsHeader'
import ClueDetailsInfo from './ClueDetailsInfo'
import ClueTransferForm from './ClueTransferForm'

export default {
  name: 'CrmClueDetail',
  components: {
    ClueForm,
    ClueDetailsHeader,
    ClueDetailsInfo,
    ClueTransferForm,
    FollowUpList,
    PermissionList
  },
  data() {
    return {
      BizTypeEnum,
      clueId: undefined,
      clue: {},
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
    this.clueId = this.$route.params.id
    if (!this.clueId) {
      this.$modal.msgWarning('参数错误，线索不能为空！')
      this.close()
      return
    }
    this.getClue()
  },
  methods: {
    dateFormatter,
    async getClue() {
      if (!this.clueId) return
      this.loading = true
      try {
        this.clue = (await ClueApi.getClue(this.clueId)).data
        await this.getOperateLog()
      } finally { this.loading = false }
    },
    async getOperateLog() {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          bizType: BizTypeEnum.CRM_CLUE,
          bizId: this.clueId
        })).data
        this.logList = data.list
      } finally { this.logLoading = false }
    },
    openForm() { this.$refs.form.open('update', this.clueId) },
    openTransfer() { this.$refs.transferForm.open(this.clueId) },
    handlePermissionChange(state) {
      this.permissionState = Object.assign({}, this.permissionState, state || {})
    },
    close() {
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmClue' }).catch(() => {})
    },
    handleTransform() {
      this.$modal.confirm('确定将“' + (this.clue.name || this.clueId) + '”转化为客户吗？').then(() => ClueApi.transformClue(this.clueId)).then(() => {
        this.$modal.msgSuccess('转化成功')
        this.getClue()
      }).catch(() => {})
    }
  }
}
</script>
