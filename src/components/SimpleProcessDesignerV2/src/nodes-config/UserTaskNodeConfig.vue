<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    size="640px"
    :before-close="handleBeforeClose"
  >
    <div class="user-task-config">
      <el-form ref="configForm" :model="draft" label-width="128px" label-position="top" size="small">
        <el-form-item v-if="isApprovalNode" label="审批类型">
          <el-radio-group v-model="draft.approveType">
            <el-radio v-for="item in approveTypes" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="!isApprovalNode || Number(draft.approveType) === ApproveType.USER">
          <el-form-item label="候选策略" prop="candidateStrategy" :rules="requiredRule('请选择候选策略')">
            <el-select
              v-model="draft.candidateStrategy"
              filterable
              clearable
              style="width: 100%"
              @change="changeCandidateStrategy"
            >
              <el-option
                v-for="item in candidateStrategies"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.ROLE"
            label="指定角色"
            prop="roleIds"
            :rules="requiredArrayRule('请选择角色')"
          >
            <el-select v-model="draft.roleIds" filterable clearable multiple style="width: 100%">
              <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="[CandidateStrategy.DEPT_MEMBER, CandidateStrategy.DEPT_LEADER, CandidateStrategy.MULTI_LEVEL_DEPT_LEADER].includes(Number(draft.candidateStrategy))"
            label="指定部门"
            prop="deptIds"
            :rules="requiredArrayRule('请选择部门')"
          >
            <el-select v-model="draft.deptIds" filterable clearable multiple style="width: 100%">
              <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.POST"
            label="指定岗位"
            prop="postIds"
            :rules="requiredArrayRule('请选择岗位')"
          >
            <el-select v-model="draft.postIds" filterable clearable multiple style="width: 100%">
              <el-option v-for="item in postList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.USER"
            label="指定用户"
            prop="userIds"
            :rules="requiredArrayRule('请选择用户')"
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
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.USER_GROUP"
            label="指定用户组"
            prop="userGroups"
            :rules="requiredArrayRule('请选择用户组')"
          >
            <el-select v-model="draft.userGroups" filterable clearable multiple style="width: 100%">
              <el-option v-for="item in userGroupList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.FORM_USER"
            label="表单内用户字段"
            prop="formUser"
            :rules="requiredRule('请选择表单内用户字段')"
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
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.FORM_DEPT_LEADER"
            label="表单内部门字段"
            prop="formDept"
            :rules="requiredRule('请选择表单内部门字段')"
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
          <el-form-item
            v-if="requiresDeptLevel"
            label="部门负责人来源层级"
            prop="deptLevel"
            :rules="positiveRule('请选择部门层级')"
          >
            <el-select v-model="draft.deptLevel" filterable clearable style="width: 100%">
              <el-option v-for="item in multiLevelDeptOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="Number(draft.candidateStrategy) === CandidateStrategy.EXPRESSION"
            label="流程表达式"
            prop="expression"
            :rules="requiredRule('请输入流程表达式')"
          >
            <el-input v-model="draft.expression" type="textarea" :rows="3" clearable />
          </el-form-item>

          <el-divider>多人{{ nodeTypeName }}方式</el-divider>
          <el-form-item label="审批方式" prop="approveMethod" :rules="requiredRule('请选择多人审批方式')">
            <el-radio-group v-model="draft.approveMethod" @change="approveMethodChanged">
              <div v-for="item in approveMethods" :key="item.value" class="radio-line">
                <el-radio :label="item.value">{{ item.label }}</el-radio>
                <el-input-number
                  v-if="Number(item.value) === ApproveMethodType.APPROVE_BY_RATIO && Number(draft.approveMethod) === ApproveMethodType.APPROVE_BY_RATIO"
                  v-model="draft.approveRatio"
                  :min="10"
                  :max="100"
                  :step="10"
                  size="mini"
                />
                <span v-if="Number(item.value) === ApproveMethodType.APPROVE_BY_RATIO && Number(draft.approveMethod) === ApproveMethodType.APPROVE_BY_RATIO">%</span>
              </div>
            </el-radio-group>
          </el-form-item>

          <template v-if="isApprovalNode">
            <el-divider content-position="left">审批人拒绝时</el-divider>
            <el-form-item label="拒绝处理" prop="rejectHandler.type" :rules="requiredRule('请选择拒绝处理')">
              <el-radio-group v-model="draft.rejectHandler.type">
                <el-radio v-for="item in rejectHandlerTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="Number(draft.rejectHandler.type) === RejectHandlerType.RETURN_USER_TASK"
              label="驳回节点"
              prop="rejectHandler.returnNodeId"
              :rules="requiredRule('请选择驳回节点')"
            >
              <el-select v-model="draft.rejectHandler.returnNodeId" filterable clearable style="width: 100%">
                <el-option v-for="item in returnTaskList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">审批人超时未处理时</el-divider>
            <el-form-item label="启用超时处理">
              <el-switch v-model="draft.timeoutHandler.enable" active-text="开启" inactive-text="关闭" @change="timeoutHandlerChange" />
            </el-form-item>
            <template v-if="draft.timeoutHandler.enable">
              <el-form-item label="执行动作" prop="timeoutHandler.type" :rules="requiredRule('请选择超时动作')">
                <el-radio-group v-model="draft.timeoutHandler.type" @change="timeoutHandlerTypeChanged">
                  <el-radio v-for="item in timeoutHandlerTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="超时时间" prop="timeoutDuration" :rules="positiveRule('请输入超时时间')">
                <el-input-number v-model="draft.timeoutDuration" :min="1" size="mini" />
                <el-select v-model="draft.timeoutUnit" style="width: 110px; margin-left: 8px" @change="timeoutUnitChanged">
                  <el-option v-for="item in timeUnitTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="Number(draft.timeoutHandler.type) === TimeoutHandlerType.REMINDER" label="最大提醒次数" prop="timeoutHandler.maxRemindCount" :rules="positiveRule('请输入提醒次数')">
                <el-input-number v-model="draft.timeoutHandler.maxRemindCount" :min="1" :max="10" size="mini" />
              </el-form-item>
            </template>
          </template>

          <el-divider>{{ nodeTypeName }}人为空时</el-divider>
          <el-form-item label="空处理策略" prop="assignEmptyHandler.type" :rules="requiredRule('请选择空处理策略')">
            <el-radio-group v-model="draft.assignEmptyHandler.type">
              <el-radio v-for="item in assignEmptyHandlerTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="Number(draft.assignEmptyHandler.type) === AssignEmptyHandlerType.ASSIGN_USER"
            label="指定用户"
            prop="assignEmptyHandler.userIds"
            :rules="requiredArrayRule('请选择指定用户')"
          >
            <el-select v-model="draft.assignEmptyHandler.userIds" filterable clearable multiple style="width: 100%">
              <el-option v-for="item in userList" :key="item.id" :label="item.nickname || item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <template v-if="isApprovalNode">
            <el-divider>审批人与发起人相同时</el-divider>
            <el-form-item label="处理方式" prop="assignStartUserHandlerType" :rules="requiredRule('请选择处理方式')">
              <el-radio-group v-model="draft.assignStartUserHandlerType">
                <el-radio v-for="item in assignStartUserHandlerTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-divider>任务附加设置</el-divider>
            <el-form-item label="需要签名">
              <el-switch v-model="draft.signEnable" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item label="审批意见必填">
              <el-switch v-model="draft.reasonRequire" active-text="必填" inactive-text="非必填" />
            </el-form-item>
          </template>
          <el-form-item label="跳过表达式">
            <el-input v-model="draft.skipExpression" type="textarea" :rows="2" placeholder="可选，如：${amount == 0}" />
          </el-form-item>
        </template>
      </el-form>

      <el-tabs v-model="activeTab" type="border-card" class="advanced-tabs">
        <el-tab-pane v-if="isApprovalNode" label="操作按钮" name="buttons">
          <div class="button-setting-title"><span>按钮</span><span>显示名称</span><span>启用</span></div>
          <div v-for="item in buttonsSetting" :key="item.id" class="button-setting-row">
            <span>{{ operationButtonName(item.id) }}</span>
            <el-input v-model="item.displayName" size="mini" class="button-name" />
            <el-switch v-model="item.enable" />
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="isNormalForm" label="表单字段权限" name="fields">
          <div class="permission-actions">
            <el-button size="mini" @click="setAllPermission(FieldPermissionType.READ)">全部只读</el-button>
            <el-button size="mini" @click="setAllPermission(FieldPermissionType.WRITE)">全部可编辑</el-button>
            <el-button size="mini" @click="setAllPermission(FieldPermissionType.NONE)">全部隐藏</el-button>
          </div>
          <div v-for="item in fieldsPermission" :key="item.field" class="permission-row">
            <span class="permission-field">{{ item.title }}</span>
            <el-radio-group v-model="item.permission">
              <el-radio :label="FieldPermissionType.READ">只读</el-radio>
              <el-radio :label="FieldPermissionType.WRITE">编辑</el-radio>
              <el-radio :label="FieldPermissionType.NONE">隐藏</el-radio>
            </el-radio-group>
          </div>
          <div v-if="!fieldsPermission.length" class="empty-tip">当前表单暂无可配置字段</div>
        </el-tab-pane>
        <el-tab-pane label="任务监听器" name="listeners">
          <UserTaskListener ref="listener" v-model="draft" :form-fields="listenerFormFields" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- Element UI 2.x Drawer has no Vue3-style footer slot; keep the
         action bar in the default slot so it is actually rendered. -->
    <div class="drawer-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="saveConfig">确 定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import {
  APPROVE_TYPE,
  ApproveType,
  APPROVE_METHODS,
  ApproveMethodType,
  ASSIGN_EMPTY_HANDLER_TYPES,
  AssignEmptyHandlerType,
  ASSIGN_START_USER_HANDLER_TYPES,
  CandidateStrategy,
  CANDIDATE_STRATEGY,
  FieldPermissionType,
  MULTI_LEVEL_DEPT,
  NodeType,
  OPERATION_BUTTON_NAME,
  DEFAULT_BUTTON_SETTING,
  TRANSACTOR_DEFAULT_BUTTON_SETTING,
  RejectHandlerType,
  REJECT_HANDLER_TYPES,
  TIMEOUT_HANDLER_TYPES,
  TimeoutHandlerType,
  TIME_UNIT_TYPES,
  TimeUnitType,
  ProcessVariableEnum
} from '../consts'
import { BpmModelFormType } from '@/utils/constants'
import { parseFormFields } from '@/components/FormCreate/src/utils'
import UserTaskListener from './components/UserTaskListener.vue'
import { parseCandidateIdList, parseIsoDuration } from './components/node-config-utils'

function clone(value) {
  if (Array.isArray(value)) return value.map((item) => clone(item))
  if (value && typeof value === 'object') {
    const result = {}
    Object.keys(value).forEach((key) => { result[key] = clone(value[key]) })
    return result
  }
  return value
}

function parseFields(rawFields) {
  const result = []
  ;(rawFields || []).forEach((field) => {
    try {
      const rule = typeof field === 'string' ? JSON.parse(field) : field
      if (rule && typeof rule === 'object') parseFormFields(rule, result)
    } catch (e) {
      // Keep valid fields available when one legacy rule is malformed.
    }
  })
  return result
}

function parseCandidateParam(data) {
  if (!data || data.candidateParam === undefined || data.candidateParam === null || data.candidateParam === '') return
  const param = String(data.candidateParam)
  const ids = (value) => parseCandidateIdList(value)
  switch (Number(data.candidateStrategy)) {
    case CandidateStrategy.USER: data.userIds = ids(param); break
    case CandidateStrategy.ROLE: data.roleIds = ids(param); break
    case CandidateStrategy.POST: data.postIds = ids(param); break
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER: data.deptIds = ids(param); break
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER: {
      const parts = param.split('|'); data.deptIds = ids(parts[0] || ''); data.deptLevel = Number(parts[1]); break
    }
    case CandidateStrategy.USER_GROUP: data.userGroups = ids(param); break
    case CandidateStrategy.FORM_USER: data.formUser = param; break
    case CandidateStrategy.FORM_DEPT_LEADER: {
      const parts = param.split('|'); data.formDept = parts[0] || ''; data.deptLevel = Number(parts[1]); break
    }
    case CandidateStrategy.EXPRESSION: data.expression = param; break
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER: data.deptLevel = Number(param); break
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
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER: return data.deptLevel ? String(data.deptLevel) : ''
    default: return undefined
  }
}

function durationIso(duration, unit) {
  const value = Number(duration) || 1
  if (Number(unit) === TimeUnitType.MINUTE) return `PT${value}M`
  if (Number(unit) === TimeUnitType.DAY) return `P${value}D`
  return `PT${value}H`
}

export default {
  name: 'UserTaskNodeConfig',
  components: { UserTaskListener },
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
      activeTab: 'buttons',
      draft: this.createDraft(this.flowNode),
      draftNodeId: this.flowNode.id,
      returnTaskList: [],
      fieldsPermission: [],
      BpmModelFormType,
      ApproveType,
      ApproveMethodType,
      CandidateStrategy,
      AssignEmptyHandlerType,
      RejectHandlerType,
      TimeoutHandlerType,
      FieldPermissionType,
      approveTypes: APPROVE_TYPE,
      approveMethods: APPROVE_METHODS,
      candidateStrategies: CANDIDATE_STRATEGY,
      multiLevelDeptOptions: MULTI_LEVEL_DEPT,
      assignEmptyHandlerTypes: ASSIGN_EMPTY_HANDLER_TYPES,
      assignStartUserHandlerTypes: ASSIGN_START_USER_HANDLER_TYPES,
      rejectHandlerTypes: REJECT_HANDLER_TYPES,
      timeoutHandlerTypes: TIMEOUT_HANDLER_TYPES,
      timeUnitTypes: TIME_UNIT_TYPES
    }
  },
  computed: {
    drawerTitle() { return `${this.draft.name || '节点'}配置` },
    roleList() { return this.roleListRef && this.roleListRef.value ? this.roleListRef.value : [] },
    postList() { return this.postListRef && this.postListRef.value ? this.postListRef.value : [] },
    userList() { return this.userListRef && this.userListRef.value ? this.userListRef.value : [] },
    deptList() { return this.deptListRef && this.deptListRef.value ? this.deptListRef.value : [] },
    userGroupList() { return this.userGroupListRef && this.userGroupListRef.value ? this.userGroupListRef.value : [] },
    formFieldList() { return parseFields(this.formFieldsRef && this.formFieldsRef.value) },
    userFieldList() {
      const list = this.formFieldList.filter((item) => item.type === 'UserSelect')
      if (!list.some((item) => item.field === ProcessVariableEnum.START_USER_ID)) {
        list.unshift({ field: ProcessVariableEnum.START_USER_ID, title: '发起人', required: true, type: 'UserSelect' })
      }
      return list
    },
    deptFieldList() { return this.formFieldList.filter((item) => item.type === 'DeptSelect') },
    isApprovalNode() { return Number(this.draft.type) === NodeType.USER_TASK_NODE },
    nodeTypeName() { return Number(this.draft.type) === NodeType.TRANSACTOR_NODE ? '办理' : '审批' },
    isNormalForm() { return Number(this.formTypeRef && this.formTypeRef.value) === BpmModelFormType.NORMAL },
    requiresDeptLevel() {
      return [CandidateStrategy.MULTI_LEVEL_DEPT_LEADER, CandidateStrategy.START_USER_DEPT_LEADER,
        CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER, CandidateStrategy.FORM_DEPT_LEADER]
        .includes(Number(this.draft.candidateStrategy))
    },
    listenerFormFields() { return this.formFieldList },
    buttonsSetting() { return this.draft.buttonsSetting || [] }
  },
  watch: {
    flowNode: {
      deep: true,
      handler(value) {
        if (!this.visible && value && value.id !== this.draftNodeId) this.prepareDraft(value)
      }
    },
    formTypeRef: {
      deep: true,
      handler() { this.refreshFieldsPermission() }
    },
    formFieldsRef: {
      deep: true,
      handler() { this.refreshFieldsPermission() }
    }
  },
  methods: {
    createDraft(node) {
      const data = clone(node || {})
      const isApproval = Number(data.type) === NodeType.USER_TASK_NODE
      const isUserNode = isApproval || Number(data.type) === NodeType.TRANSACTOR_NODE
      if (isUserNode && (data.candidateStrategy === undefined || data.candidateStrategy === null)) data.candidateStrategy = CandidateStrategy.USER
      // TransactorNodeConvert shares the same backend converter and therefore
      // also requires approveType, although its drawer does not expose the
      // auto approve/reject selector.
      if (isUserNode && (data.approveType === undefined || data.approveType === null)) data.approveType = ApproveType.USER
      if (isUserNode) {
        data.userIds = Array.isArray(data.userIds) ? data.userIds : []
        data.roleIds = Array.isArray(data.roleIds) ? data.roleIds : []
        data.deptIds = Array.isArray(data.deptIds) ? data.deptIds : []
        data.postIds = Array.isArray(data.postIds) ? data.postIds : []
        data.userGroups = Array.isArray(data.userGroups) ? data.userGroups : []
        data.formUser = data.formUser || ''
        data.formDept = data.formDept || ''
        data.expression = data.expression || ''
        data.deptLevel = Number(data.deptLevel) > 0 ? Number(data.deptLevel) : 1
        parseCandidateParam(data)
      }
      data.approveMethod = Number(data.approveMethod) || ApproveMethodType.SEQUENTIAL_APPROVE
      data.approveRatio = Number(data.approveRatio) || 100
      data.rejectHandler = data.rejectHandler || { type: RejectHandlerType.FINISH_PROCESS, returnNodeId: '' }
      if (!data.rejectHandler.type) data.rejectHandler.type = RejectHandlerType.FINISH_PROCESS
      data.timeoutHandler = data.timeoutHandler || { enable: false, type: TimeoutHandlerType.REMINDER, timeDuration: 'PT6H', maxRemindCount: 1 }
      if (data.timeoutHandler.enable === undefined || data.timeoutHandler.enable === null) data.timeoutHandler.enable = false
      data.timeoutHandler.type = Number(data.timeoutHandler.type) || TimeoutHandlerType.REMINDER
      const timeout = parseIsoDuration(data.timeoutHandler.timeDuration)
      data.timeoutDuration = timeout.duration
      data.timeoutUnit = timeout.unit
      data.timeoutHandler.timeDuration = data.timeoutHandler.timeDuration || durationIso(timeout.duration, timeout.unit)
      data.timeoutHandler.maxRemindCount = Number(data.timeoutHandler.maxRemindCount) || 1
      data.assignEmptyHandler = data.assignEmptyHandler || { type: AssignEmptyHandlerType.APPROVE, userIds: [] }
      data.assignEmptyHandler.type = Number(data.assignEmptyHandler.type) || AssignEmptyHandlerType.APPROVE
      if (!Array.isArray(data.assignEmptyHandler.userIds)) data.assignEmptyHandler.userIds = []
      data.assignStartUserHandlerType = Number(data.assignStartUserHandlerType) || 1
      data.signEnable = !!data.signEnable
      data.reasonRequire = !!data.reasonRequire
      data.skipExpression = data.skipExpression || ''
      const defaults = Number(data.type) === NodeType.TRANSACTOR_NODE ? TRANSACTOR_DEFAULT_BUTTON_SETTING : DEFAULT_BUTTON_SETTING
      data.buttonsSetting = Array.isArray(data.buttonsSetting) && data.buttonsSetting.length
        ? data.buttonsSetting
        : clone(defaults)
      data.name = data.name || (Number(data.type) === NodeType.TRANSACTOR_NODE ? '办理人' : '审批人')
      ;['Create', 'Assign', 'Complete'].forEach((type) => {
        const key = `task${type}Listener`
        const listener = data[key]
        data[`${key}Enable`] = listener ? !!listener.enable : false
        data[`${key}Path`] = listener && listener.path ? listener.path : ''
        data[key] = {
          header: listener && Array.isArray(listener.header) ? listener.header : [],
          body: listener && Array.isArray(listener.body) ? listener.body : []
        }
      })
      return data
    },
    prepareDraft(node) {
      this.draft = this.createDraft(node || this.flowNode)
      this.draftNodeId = (node || this.flowNode).id
      this.activeTab = this.isApprovalNode ? 'buttons' : (this.isNormalForm ? 'fields' : 'listeners')
      this.refreshFieldsPermission()
      this.returnTaskList = []
      this.$emit('find:return-task-nodes', this.returnTaskList)
    },
    openDrawer() {
      if (!this.draft || this.draftNodeId !== this.flowNode.id) this.prepareDraft(this.flowNode)
      this.visible = true
    },
    showUserTaskNodeConfig(node) { this.prepareDraft(node || this.flowNode) },
    finishNameEdit() {
      this.editingName = false
      if (!this.draft.name) this.draft.name = this.isApprovalNode ? '审批人' : '办理人'
    },
    requiredRule(message) { return [{ required: true, message, trigger: 'change' }] },
    requiredArrayRule(message) { return [{ required: true, type: 'array', min: 1, message, trigger: 'change' }] },
    positiveRule(message) { return [{ required: true, type: 'number', min: 1, message, trigger: 'change' }] },
    changeCandidateStrategy() {
      this.draft.userIds = []
      this.draft.roleIds = []
      this.draft.deptIds = []
      this.draft.postIds = []
      this.draft.userGroups = []
      this.draft.formUser = ''
      this.draft.formDept = ''
      this.draft.expression = ''
      this.draft.deptLevel = 1
      this.draft.approveMethod = ApproveMethodType.SEQUENTIAL_APPROVE
    },
    approveMethodChanged() {
      if (Number(this.draft.approveMethod) === ApproveMethodType.APPROVE_BY_RATIO) this.draft.approveRatio = 100
      this.clearValidate('approveRatio')
    },
    clearValidate(field) {
      if (this.$refs.configForm && this.$refs.configForm.clearValidate) this.$refs.configForm.clearValidate(field)
    },
    timeoutHandlerChange(value) {
      if (value) {
        this.draft.timeoutHandler.type = TimeoutHandlerType.REMINDER
        this.draft.timeoutDuration = 6
        this.draft.timeoutUnit = TimeUnitType.HOUR
        this.draft.timeoutHandler.maxRemindCount = 1
      }
    },
    timeoutHandlerTypeChanged(value) {
      if (Number(value) === TimeoutHandlerType.REMINDER && !this.draft.timeoutHandler.maxRemindCount) this.draft.timeoutHandler.maxRemindCount = 1
    },
    timeoutUnitChanged(value) {
      if (Number(value) === TimeUnitType.MINUTE) this.draft.timeoutDuration = 60
      if (Number(value) === TimeUnitType.HOUR) this.draft.timeoutDuration = 6
      if (Number(value) === TimeUnitType.DAY) this.draft.timeoutDuration = 1
    },
    refreshFieldsPermission() {
      const current = Array.isArray(this.draft.fieldsPermission) ? this.draft.fieldsPermission : []
      this.fieldsPermission = this.formFieldList.map((field) => {
        const found = current.find((item) => String(item.field) === String(field.field))
        return { field: field.field, title: field.title, permission: found ? found.permission : FieldPermissionType.READ }
      })
    },
    setAllPermission(permission) { this.fieldsPermission.forEach((item) => { item.permission = permission }) },
    operationButtonName(id) { return OPERATION_BUTTON_NAME.get(id) || `按钮${id}` },
    validateCandidate() {
      const strategy = Number(this.draft.candidateStrategy)
      if (!strategy) return '请选择候选策略'
      const nonEmpty = (key) => Array.isArray(this.draft[key]) && this.draft[key].length > 0
      if (strategy === CandidateStrategy.USER && !nonEmpty('userIds')) return '请选择用户'
      if (strategy === CandidateStrategy.ROLE && !nonEmpty('roleIds')) return '请选择角色'
      if (strategy === CandidateStrategy.POST && !nonEmpty('postIds')) return '请选择岗位'
      if (strategy === CandidateStrategy.USER_GROUP && !nonEmpty('userGroups')) return '请选择用户组'
      if ([CandidateStrategy.DEPT_MEMBER, CandidateStrategy.DEPT_LEADER].includes(strategy) && !nonEmpty('deptIds')) return '请选择部门'
      if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER && (!nonEmpty('deptIds') || Number(this.draft.deptLevel) <= 0)) return '请选择部门和有效层级'
      if ([CandidateStrategy.START_USER_DEPT_LEADER, CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER].includes(strategy) && Number(this.draft.deptLevel) <= 0) return '请选择有效部门层级'
      if (strategy === CandidateStrategy.FORM_USER && !this.draft.formUser) return '请选择表单内用户字段'
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER && (!this.draft.formDept || Number(this.draft.deptLevel) <= 0)) return '请选择表单部门字段和有效层级'
      if (strategy === CandidateStrategy.EXPRESSION && !String(this.draft.expression || '').trim()) return '请输入流程表达式'
      return ''
    },
    async validateForm() {
      const candidateError = this.validateCandidate()
      if (candidateError) return candidateError
      if (Number(this.draft.approveMethod) === ApproveMethodType.APPROVE_BY_RATIO && (Number(this.draft.approveRatio) < 10 || Number(this.draft.approveRatio) > 100)) return '通过比例必须在 10 到 100 之间'
      if (this.isApprovalNode) {
        if (Number(this.draft.rejectHandler.type) === RejectHandlerType.RETURN_USER_TASK && !this.draft.rejectHandler.returnNodeId) return '请选择驳回节点'
        if (this.draft.timeoutHandler.enable) {
          if (Number(this.draft.timeoutDuration) <= 0) return '请输入有效超时时间'
          if (Number(this.draft.timeoutHandler.type) === TimeoutHandlerType.REMINDER && Number(this.draft.timeoutHandler.maxRemindCount) <= 0) return '请输入有效提醒次数'
        }
      }
      if (Number(this.draft.assignEmptyHandler.type) === AssignEmptyHandlerType.ASSIGN_USER && !this.draft.assignEmptyHandler.userIds.length) return '请选择空处理指定用户'
      if (this.$refs.listener) {
        const listenerValid = await this.$refs.listener.validate()
        if (!listenerValid) return '请完善任务监听器配置'
      }
      return ''
    },
    applyDraftToNode() {
      const node = this.flowNode
      const data = clone(this.draft)
      delete data.timeoutDuration
      delete data.timeoutUnit
      data.candidateParam = buildCandidateParam(data)
      data.timeoutHandler = {
        enable: !!this.draft.timeoutHandler.enable,
        type: Number(this.draft.timeoutHandler.type) || TimeoutHandlerType.REMINDER,
        timeDuration: durationIso(this.draft.timeoutDuration, this.draft.timeoutUnit),
        maxRemindCount: Number(this.draft.timeoutHandler.type) === TimeoutHandlerType.REMINDER
          ? Number(this.draft.timeoutHandler.maxRemindCount) || 1
          : undefined
      }
      data.assignEmptyHandler = {
        type: Number(this.draft.assignEmptyHandler.type) || AssignEmptyHandlerType.APPROVE,
        userIds: Number(this.draft.assignEmptyHandler.type) === AssignEmptyHandlerType.ASSIGN_USER
          ? clone(this.draft.assignEmptyHandler.userIds)
          : undefined
      }
      data.fieldsPermission = clone(this.fieldsPermission)
      data.buttonsSetting = clone(this.buttonsSetting)
      ;['Create', 'Assign', 'Complete'].forEach((type) => {
        const key = `task${type}Listener`
        data[key] = {
          enable: !!this.draft[`${key}Enable`],
          path: this.draft[`${key}Path`] || '',
          header: clone(this.draft[key] && this.draft[key].header ? this.draft[key].header : []),
          body: clone(this.draft[key] && this.draft[key].body ? this.draft[key].body : [])
        }
        delete data[`${key}Enable`]
        delete data[`${key}Path`]
      })
      Object.keys(data).forEach((key) => { this.$set(node, key, data[key]) })
      this.$set(node, 'showText', this.buildShowText())
    },
    buildShowText() {
      const strategy = Number(this.draft.candidateStrategy)
      const findNames = (list, ids) => (ids || []).map((id) => {
        const item = list.find((entry) => String(entry.id) === String(id))
        return item ? (item.nickname || item.name) : id
      }).join(',')
      if (strategy === CandidateStrategy.USER) return `指定成员：${findNames(this.userList, this.draft.userIds)}`
      if (strategy === CandidateStrategy.ROLE) return `指定角色：${findNames(this.roleList, this.draft.roleIds)}`
      if (strategy === CandidateStrategy.POST) return `指定岗位：${findNames(this.postList, this.draft.postIds)}`
      if (strategy === CandidateStrategy.DEPT_MEMBER) return `部门成员：${findNames(this.deptList, this.draft.deptIds)}`
      if (strategy === CandidateStrategy.DEPT_LEADER) return `部门负责人：${findNames(this.deptList, this.draft.deptIds)}`
      if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) return `多级部门负责人：${findNames(this.deptList, this.draft.deptIds)}`
      if (strategy === CandidateStrategy.USER_GROUP) return `指定用户组：${findNames(this.userGroupList, this.draft.userGroups)}`
      if (strategy === CandidateStrategy.FORM_USER) return `表单用户：${this.draft.formUser}`
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER) return '表单内部门负责人'
      if (strategy === CandidateStrategy.EXPRESSION) return `流程表达式：${this.draft.expression}`
      if (strategy === CandidateStrategy.START_USER_SELECT) return '发起人自选'
      if (strategy === CandidateStrategy.APPROVE_USER_SELECT) return '审批人自选'
      if (strategy === CandidateStrategy.START_USER) return '发起人本人'
      if (strategy === CandidateStrategy.START_USER_DEPT_LEADER) return '发起人部门负责人'
      if (strategy === CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER) return '发起人连续部门负责人'
      return ''
    },
    async saveConfig() {
      this.finishNameEdit()
      this.$set(this.flowNode, 'name', this.draft.name)
      this.$set(this.flowNode, 'approveType', Number(this.draft.approveType) || ApproveType.USER)
      if (this.isApprovalNode && Number(this.draft.approveType) !== ApproveType.USER) {
        const approve = this.approveTypes.find((item) => Number(item.value) === Number(this.draft.approveType))
        this.flowNode.showText = approve ? approve.label : ''
        this.visible = false
        return true
      }
      const error = await this.validateForm()
      if (error) {
        this.$message.error(error)
        return false
      }
      const text = this.buildShowText()
      if (!text) {
        this.$message.error('请完善候选人配置')
        return false
      }
      this.applyDraftToNode()
      this.visible = false
      return true
    },
    async handleBeforeClose(done) {
      try {
        const success = await this.saveConfig()
        if (success) done()
      } catch (e) {
        // Keep the drawer open on an unexpected validation error.
        // eslint-disable-next-line no-console
        console.error('[BPM] 保存审批节点配置失败', e)
      }
    }
  }
}
</script>

<style scoped>
.user-task-config {
  padding: 0 20px 64px;
}

.radio-line {
  display: flex;
  align-items: center;
  min-height: 30px;
}

.radio-line .el-input-number {
  margin-left: 10px;
}

.advanced-tabs {
  margin-top: 14px;
}

.button-setting-title,
.button-setting-row {
  display: grid;
  grid-template-columns: 1fr 1fr 70px;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #ebeef5;
}

.button-setting-title {
  font-weight: 600;
  background: #f5f7fa;
}

.button-name {
  width: 180px;
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
  min-width: 180px;
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
