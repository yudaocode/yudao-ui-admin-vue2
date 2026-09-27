<template>
  <section
    class="crm-permission-list"
    aria-label="团队成员"
  >
    <el-row
      v-if="showAction"
      type="flex"
      justify="end"
      class="permission-toolbar"
    >
      <el-button
        v-if="validateOwnerUser"
        type="primary"
        size="small"
        @click="openForm"
      >
        <i class="el-icon-plus" /> 新增
      </el-button>
      <el-button
        v-if="validateOwnerUser"
        size="small"
        @click="handleUpdate"
      >
        <i class="el-icon-edit" /> 编辑
      </el-button>
      <el-button
        v-if="validateOwnerUser"
        size="small"
        @click="handleDelete"
      >
        <i class="el-icon-delete" /> 移除
      </el-button>
      <el-button
        v-if="!validateOwnerUser && currentUserPermission"
        type="danger"
        size="small"
        @click="handleQuit"
      >退出团队</el-button>
    </el-row>

    <el-table
      ref="table"
      v-loading="loading"
      :data="list"
      stripe
      border
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="showAction"
        type="selection"
        width="55"
      />
      <el-table-column
        align="center"
        label="姓名"
        prop="nickname"
        min-width="120"
      />
      <el-table-column
        align="center"
        label="部门"
        prop="deptName"
        min-width="140"
      />
      <el-table-column
        align="center"
        label="岗位"
        prop="postNames"
        min-width="160"
      >
        <template slot-scope="scope">{{ formatPostNames(scope.row.postNames) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="权限级别"
        prop="level"
        width="120"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.CRM_PERMISSION_LEVEL"
            :value="scope.row.level"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="加入时间"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) || '-' }}</template>
      </el-table-column>
    </el-table>

    <crm-permission-form
      ref="form"
      @success="getList"
    />
  </section>
</template>

<script>
import * as PermissionApi from '@/api/crm/permission'
import { PermissionLevelEnum } from '@/api/crm/permission'
import { getCurrentUserId } from '@/utils/auth'
import { DICT_TYPE } from '@/utils/dict'
import CrmPermissionForm from './PermissionForm.vue'

export default {
  name: 'CrmPermissionList',
  components: { CrmPermissionForm },
  props: {
    bizType: { type: Number, required: true },
    bizId: { type: [Number, String], default: undefined },
    showAction: { type: Boolean, default: true }
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      list: [],
      multipleSelection: [],
      requestSequence: 0
    }
  },
  computed: {
    currentUserId() {
      return getCurrentUserId()
    },
    currentUserPermission() {
      return this.list.find(item => String(item.userId) === String(this.currentUserId))
    },
    validateOwnerUser() {
      return Boolean(
        this.currentUserPermission &&
        Number(this.currentUserPermission.level) === PermissionLevelEnum.OWNER
      )
    },
    validateWrite() {
      if (!this.currentUserPermission) return false
      return [PermissionLevelEnum.OWNER, PermissionLevelEnum.WRITE]
        .includes(Number(this.currentUserPermission.level))
    },
    isPool() {
      return !this.list.some(item => Number(item.level) === PermissionLevelEnum.OWNER)
    }
  },
  watch: {
    bizId: {
      immediate: true,
      handler(value) {
        this.multipleSelection = []
        if (value === undefined || value === null || value === '') {
          this.list = []
          this.emitPermissionState(false)
          return
        }
        this.getList()
      }
    },
    bizType() {
      if (this.bizId !== undefined && this.bizId !== null && this.bizId !== '') this.getList()
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      this.emitPermissionState(false)
      try {
        const data = (await PermissionApi.getPermissionList({
          bizType: this.bizType,
          bizId: this.bizId
        })).data
        if (requestId !== this.requestSequence) return
        this.list = data
      } finally {
        if (requestId === this.requestSequence) {
          this.loading = false
          this.$nextTick(() => this.emitPermissionState(true))
        }
      }
    },
    handleSelectionChange(selection) {
      if (selection.some(item => Number(item.level) === PermissionLevelEnum.OWNER)) {
        this.$message.warning('不能选择负责人！')
        this.multipleSelection = []
        this.$nextTick(() => this.$refs.table && this.$refs.table.clearSelection())
        return
      }
      this.multipleSelection = selection
    },
    openForm() {
      this.$refs.form.open('create', this.bizType, this.bizId)
    },
    handleUpdate() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择团队成员后操作！')
        return
      }
      if (this.multipleSelection.length > 1) {
        this.$message.warning('编辑团队成员时只能选择一个！')
        return
      }
      const permission = this.multipleSelection[0]
      this.$refs.form.open0(
        'update',
        this.bizType,
        this.bizId,
        permission.id,
        permission.level
      )
    },
    handleDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择团队成员后操作！')
        return
      }
      const ids = this.multipleSelection.map(item => item.id)
      this.$modal.confirm('是否确认移除选中的团队成员？')
        .then(() => PermissionApi.deletePermissionBatch(ids))
        .then(() => {
          this.$modal.msgSuccess('移除团队成员成功')
          this.multipleSelection = []
          return this.getList()
        })
        .catch(() => {})
    },
    handleQuit() {
      if (!this.currentUserPermission) return
      if (Number(this.currentUserPermission.level) === PermissionLevelEnum.OWNER) {
        this.$message.warning('负责人不能退出团队！')
        return
      }
      this.$modal.confirm('是否确认退出当前团队？')
        .then(() => PermissionApi.deleteSelfPermission(this.currentUserPermission.id))
        .then(() => {
          this.$modal.msgSuccess('退出团队成功')
          this.$emit('quit-team')
        })
        .catch(() => {})
    },
    formatPostNames(value) {
      return Array.isArray(value) ? value.join('、') : (value || '-')
    },
    emitPermissionState(ready) {
      this.$emit('permission-change', {
        ready,
        validateOwnerUser: this.validateOwnerUser,
        validateWrite: this.validateWrite,
        isPool: this.isPool
      })
    }
  }
}
</script>

<style scoped>
.permission-toolbar { margin-bottom: 12px; }
</style>
