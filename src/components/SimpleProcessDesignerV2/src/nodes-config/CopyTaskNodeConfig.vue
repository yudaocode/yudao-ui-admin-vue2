<template>
  <el-drawer
    :visible.sync="visible"
    :append-to-body="true"
    size="580px"
    :before-close="handleBeforeClose"
  >
    <div slot="title" class="copy-task-config-title">
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

    <div class="copy-task-config">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="抄送人" name="user">
          <el-form ref="copyForm" :model="draft" :rules="rules" label-position="top" size="small">
            <el-form-item label="抄送人设置" prop="candidateStrategy">
              <el-radio-group v-model="draft.candidateStrategy" @change="changeCandidateStrategy">
                <el-radio v-for="item in copyUserStrategies" :key="item.value" :label="item.value">
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.ROLE)"
              label="指定角色"
              prop="roleIds"
            >
              <el-select v-model="draft.roleIds" filterable clearable multiple style="width: 100%">
                <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="isDepartmentStrategy"
              label="指定部门"
              prop="deptIds"
            >
              <el-select v-model="draft.deptIds" filterable clearable multiple style="width: 100%">
                <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.POST)"
              label="指定岗位"
              prop="postIds"
            >
              <el-select v-model="draft.postIds" filterable clearable multiple style="width: 100%">
                <el-option v-for="item in postList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.USER)"
              label="指定用户"
              prop="userIds"
            >
              <el-select v-model="draft.userIds" filterable clearable multiple style="width: 100%">
                <el-option
                  v-for="item in userList"
                  :key="item.id"
                  :label="item.nickname || item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.USER_GROUP)"
              label="指定用户组"
              prop="userGroups"
            >
              <el-select v-model="draft.userGroups" filterable clearable multiple style="width: 100%">
                <el-option v-for="item in userGroupList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.FORM_USER)"
              label="表单内用户字段"
              prop="formUser"
            >
              <el-select v-model="draft.formUser" filterable clearable style="width: 100%">
                <el-option
                  v-for="item in userFieldList"
                  :key="item.field"
                  :label="item.title"
                  :value="item.field"
                  :disabled="!item.required"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.FORM_DEPT_LEADER)"
              label="表单内部门字段"
              prop="formDept"
            >
              <el-select v-model="draft.formDept" filterable clearable style="width: 100%">
                <el-option
                  v-for="item in deptFieldList"
                  :key="item.field"
                  :label="item.title"
                  :value="item.field"
                  :disabled="!item.required"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-if="requiresDeptLevel" label="部门负责人来源层级" prop="deptLevel">
              <el-select v-model="draft.deptLevel" filterable clearable style="width: 100%">
                <el-option v-for="item in multiLevelDeptOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="strategyIs(CandidateStrategy.EXPRESSION)"
              label="流程表达式"
              prop="expression"
            >
              <el-input v-model="draft.expression" type="textarea" :rows="3" clearable />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane v-if="isNormalForm" label="表单字段权限" name="fields">
          <div class="field-setting-desc">字段权限（抄送节点默认只读）</div>
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
import {
  CandidateStrategy,
  CANDIDATE_STRATEGY,
  FieldPermissionType,
  MULTI_LEVEL_DEPT,
  NodeType
} from '../consts'
import { BpmModelFormType } from '@/utils/constants'
import { clone, parseFields, parseCandidateIdList } from './components/node-config-utils'

function unwrap(value) {
  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value
  }
  return value
}

function toIdList(value) {
  return parseCandidateIdList(value)
}

function parseCandidateParam(data) {
  if (!data || data.candidateParam === undefined || data.candidateParam === null || data.candidateParam === '') return
  const param = String(data.candidateParam)
  const parts = param.split('|')
  switch (Number(data.candidateStrategy)) {
    case CandidateStrategy.USER: data.userIds = toIdList(param); break
    case CandidateStrategy.ROLE: data.roleIds = toIdList(param); break
    case CandidateStrategy.POST: data.postIds = toIdList(param); break
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER: data.deptIds = toIdList(param); break
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER:
      data.deptIds = toIdList(parts[0]); data.deptLevel = Number(parts[1]); break
    case CandidateStrategy.USER_GROUP: data.userGroups = toIdList(param); break
    case CandidateStrategy.FORM_USER: data.formUser = param; break
    case CandidateStrategy.FORM_DEPT_LEADER:
      data.formDept = parts[0] || ''; data.deptLevel = Number(parts[1]); break
    case CandidateStrategy.EXPRESSION: data.expression = param; break
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER:
      data.deptLevel = Number(param); break
    default: break
  }
}

function buildCandidateParam(data) {
  if (!data) return undefined
  const ids = (value) => (Array.isArray(value) ? value : []).join(',')
  switch (Number(data.candidateStrategy)) {
    case CandidateStrategy.USER: return ids(data.userIds)
    case CandidateStrategy.ROLE: return ids(data.roleIds)
    case CandidateStrategy.POST: return ids(data.postIds)
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER: return ids(data.deptIds)
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER: return `${ids(data.deptIds)}|${data.deptLevel || ''}`
    case CandidateStrategy.USER_GROUP: return ids(data.userGroups)
    case CandidateStrategy.FORM_USER: return data.formUser || ''
    case CandidateStrategy.FORM_DEPT_LEADER: return `${data.formDept || ''}|${data.deptLevel || ''}`
    case CandidateStrategy.EXPRESSION: return data.expression || ''
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER:
      return data.deptLevel ? String(data.deptLevel) : ''
    default: return undefined
  }
}

function candidateKeys(strategy) {
  switch (Number(strategy)) {
    case CandidateStrategy.USER: return ['userIds']
    case CandidateStrategy.ROLE: return ['roleIds']
    case CandidateStrategy.POST: return ['postIds']
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER:
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER: return ['deptIds', 'deptLevel']
    case CandidateStrategy.USER_GROUP: return ['userGroups']
    case CandidateStrategy.FORM_USER: return ['formUser']
    case CandidateStrategy.FORM_DEPT_LEADER: return ['formDept', 'deptLevel']
    case CandidateStrategy.EXPRESSION: return ['expression']
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER: return ['deptLevel']
    default: return []
  }
}

function clearCandidateControls(data, strategy) {
  const active = candidateKeys(strategy)
  const arrayKeys = ['userIds', 'roleIds', 'deptIds', 'postIds', 'userGroups']
  arrayKeys.forEach((key) => {
    if (active.indexOf(key) < 0) data[key] = []
  })
  const textKeys = ['formUser', 'formDept', 'expression']
  textKeys.forEach((key) => {
    if (active.indexOf(key) < 0) data[key] = ''
  })
  if (active.indexOf('deptLevel') < 0) data.deptLevel = undefined
  else if (!data.deptLevel || Number(data.deptLevel) <= 0) data.deptLevel = 1
}

export default {
  name: 'CopyTaskNodeConfig',
  props: {
    flowNode: { type: Object, required: true }
  },
  inject: {
    roleListRef: { from: 'roleList', default: () => ({ value: [] }) },
    postListRef: { from: 'postList', default: () => ({ value: [] }) },
    userListRef: { from: 'userList', default: () => ({ value: [] }) },
    deptListRef: { from: 'deptList', default: () => ({ value: [] }) },
    userGroupListRef: { from: 'userGroupList', default: () => ({ value: [] }) },
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
      CandidateStrategy,
      FieldPermissionType,
      NodeType,
      BpmModelFormType,
      multiLevelDeptOptions: MULTI_LEVEL_DEPT,
      candidateStrategies: CANDIDATE_STRATEGY,
      rules: {
        candidateStrategy: [{ required: true, message: '抄送人设置不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    drawerTitle() {
      return `${this.draft.name || '抄送人'}配置`
    },
    roleList() {
      const value = unwrap(this.roleListRef)
      return Array.isArray(value) ? value : []
    },
    postList() {
      const value = unwrap(this.postListRef)
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
    userGroupList() {
      const value = unwrap(this.userGroupListRef)
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
    },
    copyUserStrategies() {
      // Vue3 deliberately hides only START_USER for copy nodes; retain the
      // other start-user strategies because their candidateParam is supported
      // by the backend converter.
      return this.candidateStrategies.filter((item) => item.value !== CandidateStrategy.START_USER)
    },
    isDepartmentStrategy() {
      return [CandidateStrategy.DEPT_MEMBER, CandidateStrategy.DEPT_LEADER, CandidateStrategy.MULTI_LEVEL_DEPT_LEADER]
        .indexOf(Number(this.draft.candidateStrategy)) >= 0
    },
    requiresDeptLevel() {
      return [CandidateStrategy.MULTI_LEVEL_DEPT_LEADER, CandidateStrategy.START_USER_DEPT_LEADER,
        CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER, CandidateStrategy.FORM_DEPT_LEADER]
        .indexOf(Number(this.draft.candidateStrategy)) >= 0
    },
    userFieldList() {
      return this.formFields.filter((item) => item.type === 'UserSelect')
    },
    deptFieldList() {
      return this.formFields.filter((item) => item.type === 'DeptSelect')
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
    strategyIs(strategy) {
      return Number(this.draft.candidateStrategy) === Number(strategy)
    },
    createDraft(node) {
      const data = clone(node || {})
      if (!data.name) data.name = '抄送人'
      if (Number(data.type) !== NodeType.COPY_TASK_NODE) data.type = NodeType.COPY_TASK_NODE
      if (data.candidateStrategy === undefined || data.candidateStrategy === null) {
        data.candidateStrategy = CandidateStrategy.USER
      }
      const arrayKeys = ['userIds', 'roleIds', 'deptIds', 'postIds', 'userGroups']
      arrayKeys.forEach((key) => {
        if (!Array.isArray(data[key])) data[key] = []
      })
      if (data.formUser === undefined || data.formUser === null) data.formUser = ''
      if (data.formDept === undefined || data.formDept === null) data.formDept = ''
      if (data.expression === undefined || data.expression === null) data.expression = ''
      data.deptLevel = Number(data.deptLevel) > 0 ? Number(data.deptLevel) : 1
      parseCandidateParam(data)
      return data
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
      if (!this.draft || this.draftNodeId !== (this.flowNode && this.flowNode.id)) this.prepareDraft(this.flowNode)
      else this.refreshFieldsPermission()
      this.visible = true
    },
    showCopyTaskNodeConfig(node) {
      this.prepareDraft(node || this.flowNode)
    },
    finishNameEdit() {
      this.editingName = false
      if (!String(this.draft.name || '').trim()) this.draft.name = '抄送人'
    },
    changeCandidateStrategy(strategy) {
      clearCandidateControls(this.draft, strategy)
      this.activeTab = 'user'
      if (this.$refs.copyForm && this.$refs.copyForm.clearValidate) this.$refs.copyForm.clearValidate()
    },
    refreshFieldsPermission() {
      const current = Array.isArray(this.draft && this.draft.fieldsPermission)
        ? this.draft.fieldsPermission
        : []
      this.fieldsPermission = this.formFields.map((field) => {
        const found = current.find((item) => String(item.field) === String(field.field))
        const permission = found && found.permission !== undefined
          ? String(found.permission)
          : FieldPermissionType.READ
        return { field: field.field, title: field.title, permission }
      })
    },
    setAllPermission(permission) {
      this.fieldsPermission.forEach((item) => { item.permission = permission })
    },
    findNames(list, ids) {
      return (ids || []).map((id) => {
        const item = list.find((entry) => String(entry.id) === String(id))
        return item ? (item.nickname || item.name || id) : id
      }).join(',')
    },
    buildShowText() {
      const strategy = Number(this.draft.candidateStrategy)
      if (strategy === CandidateStrategy.USER && this.draft.userIds.length) return `指定成员：${this.findNames(this.userList, this.draft.userIds)}`
      if (strategy === CandidateStrategy.ROLE && this.draft.roleIds.length) return `指定角色：${this.findNames(this.roleList, this.draft.roleIds)}`
      if (strategy === CandidateStrategy.POST && this.draft.postIds.length) return `指定岗位：${this.findNames(this.postList, this.draft.postIds)}`
      if (strategy === CandidateStrategy.DEPT_MEMBER && this.draft.deptIds.length) return `部门成员：${this.findNames(this.deptList, this.draft.deptIds)}`
      if (strategy === CandidateStrategy.DEPT_LEADER && this.draft.deptIds.length) return `部门负责人：${this.findNames(this.deptList, this.draft.deptIds)}`
      if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER && this.draft.deptIds.length) return `多级部门负责人：${this.findNames(this.deptList, this.draft.deptIds)}`
      if (strategy === CandidateStrategy.USER_GROUP && this.draft.userGroups.length) return `指定用户组：${this.findNames(this.userGroupList, this.draft.userGroups)}`
      if (strategy === CandidateStrategy.FORM_USER && this.draft.formUser) return `表单用户：${this.draft.formUser}`
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER && this.draft.formDept) return '表单内部门负责人'
      if (strategy === CandidateStrategy.EXPRESSION && String(this.draft.expression || '').trim()) return `流程表达式：${this.draft.expression}`
      if (strategy === CandidateStrategy.APPROVE_USER_SELECT) return '审批人自选'
      if (strategy === CandidateStrategy.START_USER_SELECT) return '发起人自选'
      if (strategy === CandidateStrategy.START_USER) return '发起人本人'
      if (strategy === CandidateStrategy.START_USER_DEPT_LEADER) return '发起人部门负责人'
      if (strategy === CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER) return '发起人连续部门负责人'
      return ''
    },
    validateCandidate() {
      const strategy = Number(this.draft.candidateStrategy)
      if (!strategy) return '请选择抄送人策略'
      const has = (key) => Array.isArray(this.draft[key]) && this.draft[key].length > 0
      if (strategy === CandidateStrategy.USER && !has('userIds')) return '请选择用户'
      if (strategy === CandidateStrategy.ROLE && !has('roleIds')) return '请选择角色'
      if (strategy === CandidateStrategy.POST && !has('postIds')) return '请选择岗位'
      if (strategy === CandidateStrategy.USER_GROUP && !has('userGroups')) return '请选择用户组'
      if ([CandidateStrategy.DEPT_MEMBER, CandidateStrategy.DEPT_LEADER].indexOf(strategy) >= 0 && !has('deptIds')) return '请选择部门'
      if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER && (!has('deptIds') || Number(this.draft.deptLevel) <= 0)) return '请选择部门和有效层级'
      if ([CandidateStrategy.START_USER_DEPT_LEADER, CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER].indexOf(strategy) >= 0 && Number(this.draft.deptLevel) <= 0) return '请选择有效部门层级'
      if (strategy === CandidateStrategy.FORM_USER && !this.draft.formUser) return '请选择表单内用户字段'
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER && (!this.draft.formDept || Number(this.draft.deptLevel) <= 0)) return '请选择表单部门字段和有效层级'
      if (strategy === CandidateStrategy.EXPRESSION && !String(this.draft.expression || '').trim()) return '请输入流程表达式'
      if (this.copyUserStrategies.every((item) => Number(item.value) !== strategy)) return '请选择有效的抄送人策略'
      return ''
    },
    saveConfig() {
      this.finishNameEdit()
      const error = this.validateCandidate()
      if (error) {
        this.$message.warning(error)
        return false
      }
      const candidateParam = buildCandidateParam(this.draft)
      const text = this.buildShowText()
      if (!text) {
        this.$message.warning('请完善抄送人配置')
        return false
      }
      this.$set(this.flowNode, 'name', this.draft.name)
      this.$set(this.flowNode, 'candidateStrategy', Number(this.draft.candidateStrategy))
      if (candidateParam === undefined || candidateParam === '') {
        if (Object.prototype.hasOwnProperty.call(this.flowNode, 'candidateParam')) this.$delete(this.flowNode, 'candidateParam')
      } else {
        this.$set(this.flowNode, 'candidateParam', candidateParam)
      }
      this.$set(this.flowNode, 'showText', text)
      this.$set(this.flowNode, 'fieldsPermission', clone(this.fieldsPermission))
      this.visible = false
      return true
    },
    cancelConfig() {
      this.visible = false
      this.editingName = false
    },
    async handleBeforeClose(done) {
      const success = this.saveConfig()
      if (success) done()
    }
  }
}
</script>

<style scoped>
.copy-task-config {
  padding: 0 20px 70px;
}

.copy-task-config-title {
  padding-right: 24px;
  font-weight: 600;
}

.copy-task-config-title .el-icon-edit {
  margin-left: 8px;
  cursor: pointer;
  color: #409eff;
}

.copy-task-config .el-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  line-height: 30px;
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
