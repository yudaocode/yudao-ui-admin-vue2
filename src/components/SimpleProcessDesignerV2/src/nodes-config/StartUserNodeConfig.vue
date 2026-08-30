<template>
  <el-drawer
    :visible.sync="visible"
    :append-to-body="true"
    size="550px"
    :before-close="handleBeforeClose"
  >
    <div slot="title" class="start-user-config-title">
      <el-input
        v-if="editingName"
        v-model="draft.name"
        size="small"
        maxlength="30"
        @blur="finishNameEdit"
      />
      <span v-else>
        {{ drawerTitle }}
        <i class="el-icon-edit" title="编辑节点名称" @click="editingName = true" />
      </span>
    </div>

    <div class="start-user-config">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="权限" name="user">
          <div class="start-user-permission-summary">
            <template v-if="!startUserIds.length && !startDeptIds.length">
              全部成员可以发起流程
            </template>
            <template v-else-if="startUserIds.length">
              <span v-if="startUserIds.length === 1">{{ userNames(startUserIds) }} 可发起流程</span>
              <el-tooltip v-else effect="dark" placement="top" :content="userNames(startUserIds)">
                <span>{{ userNames(startUserIds.slice(0, 2)) }} 等 {{ startUserIds.length }} 人可发起流程</span>
              </el-tooltip>
            </template>
            <template v-else>
              <span v-if="startDeptIds.length === 1">{{ deptNames(startDeptIds) }} 可发起流程</span>
              <el-tooltip v-else effect="dark" placement="top" :content="deptNames(startDeptIds)">
                <span>{{ deptNames(startDeptIds.slice(0, 2)) }} 等 {{ startDeptIds.length }} 个部门可发起流程</span>
              </el-tooltip>
            </template>
          </div>
          <el-alert
            title="发起人范围由模型创建页的用户/部门权限决定"
            type="info"
            :closable="false"
            show-icon
            class="start-user-permission-help"
          />
        </el-tab-pane>

        <el-tab-pane v-if="isNormalForm" label="表单字段权限" name="fields">
          <div class="field-setting-desc">字段权限（默认可编辑）</div>
          <div class="permission-actions">
            <el-button size="mini" @click="setAllPermission(FieldPermissionType.READ)">全部只读</el-button>
            <el-button size="mini" @click="setAllPermission(FieldPermissionType.WRITE)">全部可编辑</el-button>
            <el-button size="mini" @click="setAllPermission(FieldPermissionType.NONE)">全部隐藏</el-button>
          </div>
          <div v-for="item in fieldsPermission" :key="item.field" class="permission-row">
            <span class="permission-field">{{ item.title || item.field }}</span>
            <el-radio-group v-model="item.permission">
              <el-radio :label="FieldPermissionType.READ">只读</el-radio>
              <el-radio :label="FieldPermissionType.WRITE">编辑</el-radio>
              <el-radio :label="FieldPermissionType.NONE">隐藏</el-radio>
            </el-radio-group>
          </div>
          <div v-if="!fieldsPermission.length" class="empty-tip">当前表单暂无可配置字段</div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="drawer-footer">
      <el-button type="primary" @click="saveConfig">确 定</el-button>
      <el-button @click="cancelConfig">取 消</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { FieldPermissionType, START_USER_BUTTON_SETTING, NodeType } from '../consts'
import { BpmModelFormType } from '@/utils/constants'
import { clone, parseFields } from './components/node-config-utils'

function unwrap(value) {
  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value
  }
  return value
}

export default {
  name: 'StartUserNodeConfig',
  props: {
    flowNode: { type: Object, required: true }
  },
  inject: {
    startUserIdsRef: { from: 'startUserIds', default: () => [] },
    startDeptIdsRef: { from: 'startDeptIds', default: () => [] },
    userListRef: { from: 'userList', default: () => ({ value: [] }) },
    deptListRef: { from: 'deptList', default: () => ({ value: [] }) },
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) },
    formTypeRef: { from: 'formType', default: () => ({ value: undefined }) }
  },
  data() {
    return {
      visible: false,
      editingName: false,
      activeTab: 'user',
      draftNodeId: this.flowNode && this.flowNode.id,
      draft: this.createDraft(this.flowNode),
      fieldsPermission: [],
      FieldPermissionType,
      NodeType,
      BpmModelFormType
    }
  },
  computed: {
    drawerTitle() {
      return `${this.draft.name || '发起人'}配置`
    },
    startUserIds() {
      const value = unwrap(this.startUserIdsRef)
      return Array.isArray(value) ? value : []
    },
    startDeptIds() {
      const value = unwrap(this.startDeptIdsRef)
      return Array.isArray(value) ? value : []
    },
    userList() {
      const value = unwrap(this.userListRef)
      return Array.isArray(value) ? value : []
    },
    deptList() {
      const value = unwrap(this.deptListRef)
      return Array.isArray(value) ? value : []
    },
    formFields() {
      const value = unwrap(this.formFieldsRef)
      return parseFields(Array.isArray(value) ? value : [])
    },
    formType() {
      return Number(unwrap(this.formTypeRef))
    },
    isNormalForm() {
      return this.formType === BpmModelFormType.NORMAL
    }
  },
  watch: {
    flowNode: {
      deep: true,
      handler(value) {
        if (!this.visible && value && value.id !== this.draftNodeId) this.prepareDraft(value)
      }
    },
    formFieldsRef: {
      deep: true,
      handler() {
        if (!this.visible) this.refreshFieldsPermission()
      }
    },
    formTypeRef: {
      deep: true,
      handler() {
        if (!this.visible) this.refreshFieldsPermission()
      }
    }
  },
  methods: {
    createDraft(node) {
      const draft = clone(node || {})
      if (!draft.name) draft.name = '发起人'
      if (Number(draft.type) !== NodeType.START_USER_NODE) draft.type = NodeType.START_USER_NODE
      return draft
    },
    prepareDraft(node) {
      const source = node || this.flowNode
      this.draft = this.createDraft(source)
      this.draftNodeId = source && source.id
      this.activeTab = 'user'
      this.editingName = false
      this.refreshFieldsPermission()
    },
    openDrawer() {
      if (!this.draft || this.draftNodeId !== (this.flowNode && this.flowNode.id)) {
        this.prepareDraft(this.flowNode)
      } else {
        // Re-read permissions on every open so a form edited in the parent
        // page immediately contributes its current field list.
        this.refreshFieldsPermission()
      }
      this.visible = true
    },
    showStartUserNodeConfig(node) {
      this.prepareDraft(node || this.flowNode)
    },
    finishNameEdit() {
      this.editingName = false
      if (!String(this.draft.name || '').trim()) this.draft.name = '发起人'
    },
    refreshFieldsPermission() {
      const current = Array.isArray(this.draft && this.draft.fieldsPermission)
        ? this.draft.fieldsPermission
        : []
      this.fieldsPermission = this.formFields.map((field) => {
        const found = current.find((item) => String(item.field) === String(field.field))
        const permission = found && found.permission !== undefined
          ? String(found.permission)
          : FieldPermissionType.WRITE
        return { field: field.field, title: field.title, permission }
      })
    },
    setAllPermission(permission) {
      this.fieldsPermission.forEach((item) => { item.permission = permission })
    },
    userNames(ids) {
      return ids.map((id) => {
        const item = this.userList.find((entry) => String(entry.id) === String(id))
        return item ? (item.nickname || item.name || id) : id
      }).join(',')
    },
    deptNames(ids) {
      return ids.map((id) => {
        const item = this.deptList.find((entry) => String(entry.id) === String(id))
        return item ? (item.name || id) : id
      }).join(',')
    },
    saveConfig() {
      this.finishNameEdit()
      this.$set(this.flowNode, 'name', this.draft.name)
      // The start node has no candidateParam. Its visible state and button
      // contract are required by BpmSimpleModelNodeVO even when no form is
      // selected, so always write these two fields explicitly.
      this.$set(this.flowNode, 'showText', '已设置')
      this.$set(this.flowNode, 'fieldsPermission', clone(this.fieldsPermission))
      this.$set(this.flowNode, 'buttonsSetting', clone(START_USER_BUTTON_SETTING))
      this.visible = false
      return true
    },
    cancelConfig() {
      this.visible = false
      this.editingName = false
    },
    async handleBeforeClose(done) {
      const success = await this.saveConfig()
      if (success) done()
    }
  }
}
</script>

<style scoped>
.start-user-config {
  padding: 0 20px 70px;
}

.start-user-config-title {
  padding-right: 24px;
  font-weight: 600;
}

.start-user-config-title .el-icon-edit {
  margin-left: 8px;
  cursor: pointer;
  color: #409eff;
}

.start-user-permission-summary {
  min-height: 40px;
  padding: 14px 4px;
  line-height: 22px;
  color: #606266;
}

.start-user-permission-help {
  margin-top: 12px;
}

.field-setting-desc {
  margin-bottom: 10px;
  color: #606266;
}

.permission-actions {
  margin-bottom: 10px;
}

.permission-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.permission-field {
  flex: 1;
  min-width: 160px;
}

.empty-tip {
  padding: 20px 0;
  color: #909399;
  text-align: center;
}

.drawer-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 20px;
  text-align: right;
  background: #fff;
  border-top: 1px solid #ebeef5;
}
</style>
