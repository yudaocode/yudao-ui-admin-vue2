<template>
  <div class="app-container crm-receivable-detail">
    <receivable-details-header
      :receivable="receivable"
      :loading="loading"
    >
      <el-button
        v-if="permissionReady && canWrite"
        type="primary"
        size="small"
        @click="openForm('update', receivable.id)"
      >编辑</el-button>
    </receivable-details-header>
    <el-card
      shadow="never"
      class="detail-tabs"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="详细资料"
          name="info"
        ><receivable-details-info :receivable="receivable" /></el-tab-pane>
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
            v-if="receivable.id"
            ref="permissionList"
            :biz-id="receivable.id"
            :biz-type="BizTypeEnum.CRM_RECEIVABLE"
            :show-action="true"
            @permission-change="handlePermissionChange"
            @quit-team="close"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <receivable-form
      ref="form"
      @success="getReceivable"
    />
  </div>
</template>

<script>
import * as ReceivableApi from '@/api/crm/receivable'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import { dateFormatter } from '@/utils'
import PermissionList from '@/views/crm/permission/components/PermissionList.vue'
import ReceivableForm from '../ReceivableForm.vue'
import ReceivableDetailsHeader from './ReceivableDetailsHeader.vue'
import ReceivableDetailsInfo from './ReceivableDetailsInfo.vue'

export default {
  name: 'CrmReceivableDetail',
  components: { ReceivableForm, ReceivableDetailsHeader, ReceivableDetailsInfo, PermissionList },
  props: {
    id: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      BizTypeEnum,
      receivableId: undefined,
      receivable: {},
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
    const rawId = this.id || this.$route.params.id
    this.receivableId = rawId ? Number(rawId) : undefined
    if (!this.receivableId) {
      this.$modal.msgWarning('参数错误，回款不能为空！')
      this.close()
      return
    }
    this.getReceivable()
  },
  methods: {
    dateFormatter,
    async getReceivable() {
      if (!this.receivableId) return
      this.loading = true
      try {
        this.receivable = (await ReceivableApi.getReceivable(this.receivableId)).data
        await this.getOperateLog()
      } finally {
        this.loading = false
      }
    },
    async getOperateLog() {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          bizType: BizTypeEnum.CRM_RECEIVABLE,
          bizId: this.receivableId
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
      this.$router.push({ name: 'CrmReceivable' }).catch(() => {})
    }
  }
}
</script>
