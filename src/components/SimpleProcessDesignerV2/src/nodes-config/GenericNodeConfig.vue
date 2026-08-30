<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    :before-close="handleBeforeClose"
    size="560px"
  >
    <div class="generic-node-config">
      <el-form ref="form" :model="form" label-width="110px" size="small">
        <el-form-item label="节点名称">
          <el-input v-model="form.name" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="展示说明">
          <el-input
            v-model="form.showText"
            type="textarea"
            :rows="3"
            placeholder="流程图上展示的节点摘要，例如：指定成员：张三"
          />
        </el-form-item>

        <template v-if="isUserNode">
          <el-form-item v-if="isApprovalNode" label="审批类型">
            <el-select v-model="form.approveType" clearable placeholder="请选择审批类型">
              <el-option
                v-for="item in approveTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="候选策略">
            <el-select
              v-model="form.candidateStrategy"
              clearable
              placeholder="请选择候选策略"
              @change="handleCandidateStrategyChange"
            >
              <el-option
                v-for="item in candidateStrategies"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.USER" label="指定用户">
            <el-select v-model="form.userIds" multiple filterable clearable placeholder="请选择用户">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.nickname || item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.ROLE" label="指定角色">
            <el-select v-model="form.roleIds" multiple filterable clearable placeholder="请选择角色">
              <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="[
              CandidateStrategy.DEPT_MEMBER,
              CandidateStrategy.DEPT_LEADER,
              CandidateStrategy.MULTI_LEVEL_DEPT_LEADER
            ].includes(Number(form.candidateStrategy))"
            label="指定部门"
          >
            <el-select v-model="form.deptIds" multiple filterable clearable placeholder="请选择部门">
              <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.POST" label="指定岗位">
            <el-select v-model="form.postIds" multiple filterable clearable placeholder="请选择岗位">
              <el-option v-for="item in postList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.USER_GROUP" label="指定用户组">
            <el-select v-model="form.userGroups" multiple filterable clearable placeholder="请选择用户组">
              <el-option v-for="item in userGroupList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.FORM_USER" label="表单内用户字段">
            <el-select v-model="form.formUser" filterable clearable placeholder="请选择用户字段">
              <el-option
                v-for="item in userFieldList"
                :key="item.field"
                :label="item.title"
                :value="item.field"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.FORM_DEPT_LEADER" label="表单内部门字段">
            <el-select v-model="form.formDept" filterable clearable placeholder="请选择部门字段">
              <el-option
                v-for="item in deptFieldList"
                :key="item.field"
                :label="item.title"
                :value="item.field"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="requiresDeptLevel"
            label="部门层级"
          >
            <el-select v-model="form.deptLevel" clearable placeholder="请选择部门层级">
              <el-option
                v-for="item in multiLevelDeptOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.candidateStrategy === CandidateStrategy.EXPRESSION" label="流程表达式">
            <el-input
              v-model="form.expression"
              type="textarea"
              :rows="3"
              clearable
              placeholder="请输入流程表达式"
            />
          </el-form-item>
        </template>

        <template v-if="isConditionNode">
          <el-form-item label="默认分支">
            <el-switch v-model="form.conditionSetting.defaultFlow" />
          </el-form-item>
          <el-form-item label="条件类型">
            <el-select v-model="form.conditionSetting.conditionType" clearable placeholder="请选择条件类型">
              <el-option
                v-for="item in conditionTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="条件表达式">
            <el-input
              v-model="form.conditionSetting.conditionExpression"
              type="textarea"
              :rows="3"
              placeholder="例如：${amount > 1000}"
            />
          </el-form-item>
        </template>

        <template v-if="isTimerNode">
          <el-form-item label="延迟时长">
            <el-input-number v-model="form.delaySetting.timeDuration" :min="1" />
          </el-form-item>
          <el-form-item label="时间单位">
            <el-select v-model="form.delaySetting.timeUnit" clearable placeholder="请选择时间单位">
              <el-option v-for="item in timeUnitTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="isChildProcessNode">
          <el-form-item label="流程标识">
            <el-input v-model="form.childProcessSetting.calledProcessDefinitionKey" />
          </el-form-item>
          <el-form-item label="流程名称">
            <el-input v-model="form.childProcessSetting.calledProcessDefinitionName" />
          </el-form-item>
          <el-form-item label="异步启动">
            <el-switch v-model="form.childProcessSetting.async" />
          </el-form-item>
        </template>

        <template v-if="isTriggerNode">
          <HttpRequestSetting
            :setting="form.httpRequestSetting"
            :response-enable="true"
            form-item-prefix="httpRequestSetting"
            :form-fields="formFieldList"
          />
        </template>

        <el-form-item label="高级 JSON">
          <el-input
            v-model="jsonText"
            type="textarea"
            :rows="8"
            placeholder="可直接编辑完整节点 JSON，保存时会合并回节点"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="saveConfig">保 存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import {
  APPROVE_TYPE,
  CANDIDATE_STRATEGY,
  CONDITION_CONFIG_TYPES,
  MULTI_LEVEL_DEPT,
  ProcessVariableEnum,
  TIME_UNIT_TYPES,
  CandidateStrategy,
  NodeType
} from '../consts'
import { parseFormFields } from '@/components/FormCreate/src/utils'
import { normalizeNodeConfig } from './node-config-schema'
import HttpRequestSetting from './components/HttpRequestSetting.vue'
import { parseCandidateIdList } from './components/node-config-utils'

function clone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item))
  }
  if (value && typeof value === 'object') {
    const result = {}
    Object.keys(value).forEach((key) => {
      result[key] = clone(value[key])
    })
    return result
  }
  return value
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseFormCreateFields(formFields) {
  const result = []
  ;(formFields || []).forEach((field) => {
    try {
      const rule = typeof field === 'string' ? JSON.parse(field) : field
      if (rule && typeof rule === 'object') {
        parseFormFields(rule, result)
      }
    } catch (e) {
      // A malformed optional form rule must not prevent the node drawer from
      // opening; the complete rule remains available in the advanced JSON.
    }
  })
  return result
}

/**
 * Merge the JSON editor value over the form snapshot, recursively.  JSON is
 * the advanced source, so its nested keys must survive even when the form has
 * an older object at the same path.
 */
function mergeConfig(base, override) {
  if (!isObject(base) || !isObject(override)) {
    return clone(override)
  }
  const result = clone(base)
  Object.keys(override).forEach((key) => {
    const overrideValue = override[key]
    if (isObject(result[key]) && isObject(overrideValue)) {
      result[key] = mergeConfig(result[key], overrideValue)
    } else {
      result[key] = clone(overrideValue)
    }
  })
  return result
}

function valuesEqual(left, right) {
  if (left === right) {
    return true
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      return false
    }
    return left.every((item, index) => valuesEqual(item, right[index]))
  }
  if (isObject(left) || isObject(right)) {
    if (!isObject(left) || !isObject(right)) {
      return false
    }
    const keys = new Set([...Object.keys(left), ...Object.keys(right)])
    return Array.from(keys).every((key) => valuesEqual(left[key], right[key]))
  }
  return false
}

// The backend does not persist the convenience arrays shown by this Vue2
// form.  It persists one candidateParam string whose format depends on the
// selected strategy.  Keep the conversion local to the compatibility form so
// existing/imported models can still be edited without losing their assignee.
function parseCandidateParam(data) {
  if (!data || data.candidateParam === undefined || data.candidateParam === null || data.candidateParam === '') {
    return
  }
  const param = String(data.candidateParam)
  const toIds = (value) => parseCandidateIdList(value)
  const strategy = Number(data.candidateStrategy)
  switch (strategy) {
    case CandidateStrategy.USER:
      data.userIds = toIds(param)
      break
    case CandidateStrategy.ROLE:
      data.roleIds = toIds(param)
      break
    case CandidateStrategy.POST:
      data.postIds = toIds(param)
      break
    case CandidateStrategy.USER_GROUP:
      data.userGroups = toIds(param)
      break
    case CandidateStrategy.FORM_USER:
      data.formUser = param
      break
    case CandidateStrategy.EXPRESSION:
      data.expression = param
      break
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER:
      data.deptIds = toIds(param)
      break
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER:
      data.deptLevel = Number(param)
      break
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER: {
      const parts = param.split('|')
      data.deptIds = toIds(parts[0] || '')
      data.deptLevel = Number(parts[1])
      break
    }
    case CandidateStrategy.FORM_DEPT_LEADER: {
      const parts = param.split('|')
      data.formDept = parts[0] || ''
      data.deptLevel = Number(parts[1])
      break
    }
    default:
      break
  }
}

function buildCandidateParam(data) {
  if (!data) {
    return undefined
  }
  const ids = (value) => (Array.isArray(value) ? value : []).join(',')
  switch (Number(data.candidateStrategy)) {
    case CandidateStrategy.USER:
      return ids(data.userIds)
    case CandidateStrategy.ROLE:
      return ids(data.roleIds)
    case CandidateStrategy.POST:
      return ids(data.postIds)
    case CandidateStrategy.USER_GROUP:
      return ids(data.userGroups)
    case CandidateStrategy.FORM_USER:
      return data.formUser || ''
    case CandidateStrategy.EXPRESSION:
      return data.expression || ''
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER:
      return ids(data.deptIds)
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER:
      return data.deptLevel === undefined || data.deptLevel === null ? '' : String(data.deptLevel)
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER:
      return `${ids(data.deptIds)}|${data.deptLevel === undefined || data.deptLevel === null ? '' : data.deptLevel}`
    case CandidateStrategy.FORM_DEPT_LEADER:
      return `${data.formDept || ''}|${data.deptLevel === undefined || data.deptLevel === null ? '' : data.deptLevel}`
    default:
      return undefined
  }
}

function hasCandidateData(data) {
  if (!data) {
    return false
  }
  const strategy = Number(data.candidateStrategy)
  if ([
    CandidateStrategy.USER,
    CandidateStrategy.ROLE,
    CandidateStrategy.POST,
    CandidateStrategy.USER_GROUP,
    CandidateStrategy.DEPT_MEMBER,
    CandidateStrategy.DEPT_LEADER
  ].includes(strategy)) {
    const keys = {
      [CandidateStrategy.USER]: 'userIds',
      [CandidateStrategy.ROLE]: 'roleIds',
      [CandidateStrategy.POST]: 'postIds',
      [CandidateStrategy.USER_GROUP]: 'userGroups',
      [CandidateStrategy.DEPT_MEMBER]: 'deptIds',
      [CandidateStrategy.DEPT_LEADER]: 'deptIds'
    }
    return Array.isArray(data[keys[strategy]]) && data[keys[strategy]].length > 0
  }
  if (strategy === CandidateStrategy.FORM_USER || strategy === CandidateStrategy.EXPRESSION) {
    return !!(data.formUser || data.expression)
  }
  if (strategy === CandidateStrategy.FORM_DEPT_LEADER) {
    return !!data.formDept || (data.deptLevel !== undefined && data.deptLevel !== null)
  }
  if (
    strategy === CandidateStrategy.START_USER_DEPT_LEADER ||
    strategy === CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER
  ) {
    return data.deptLevel !== undefined && data.deptLevel !== null
  }
  if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) {
    return (Array.isArray(data.deptIds) && data.deptIds.length > 0) ||
      (data.deptLevel !== undefined && data.deptLevel !== null)
  }
  return false
}

const CANDIDATE_CONTROL_KEYS = [
  'candidateStrategy',
  'userIds',
  'roleIds',
  'deptIds',
  'postIds',
  'userGroups',
  'formUser',
  'expression',
  'deptLevel',
  'formDept'
]

const CANDIDATE_ARRAY_KEYS = ['userIds', 'roleIds', 'deptIds', 'postIds', 'userGroups']
const CANDIDATE_TEXT_KEYS = ['formUser', 'expression', 'formDept']

function requiresDeptLevel(strategy) {
  return [
    CandidateStrategy.MULTI_LEVEL_DEPT_LEADER,
    CandidateStrategy.START_USER_DEPT_LEADER,
    CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER,
    CandidateStrategy.FORM_DEPT_LEADER
  ].includes(Number(strategy))
}

function candidateKeysForStrategy(strategy) {
  switch (Number(strategy)) {
    case CandidateStrategy.USER:
      return ['userIds']
    case CandidateStrategy.ROLE:
      return ['roleIds']
    case CandidateStrategy.POST:
      return ['postIds']
    case CandidateStrategy.USER_GROUP:
      return ['userGroups']
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER:
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER:
      return ['deptIds', 'deptLevel']
    case CandidateStrategy.FORM_USER:
      return ['formUser']
    case CandidateStrategy.FORM_DEPT_LEADER:
      return ['formDept', 'deptLevel']
    case CandidateStrategy.EXPRESSION:
      return ['expression']
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER:
      return ['deptLevel']
    default:
      return []
  }
}

/** Clear values belonging to a previous strategy without touching the active
 * strategy's controls. This mirrors the Vue3 changeCandidateStrategy handler
 * and prevents hidden IDs from leaking into a newly selected strategy. */
function clearInactiveCandidateControls(data, strategy) {
  if (!data) {
    return
  }
  const activeKeys = candidateKeysForStrategy(strategy)
  CANDIDATE_ARRAY_KEYS.forEach((key) => {
    if (!activeKeys.includes(key)) {
      data[key] = []
    }
  })
  CANDIDATE_TEXT_KEYS.forEach((key) => {
    if (!activeKeys.includes(key)) {
      data[key] = ''
    }
  })
  if (!activeKeys.includes('deptLevel')) {
    data.deptLevel = undefined
  } else if (data.deptLevel === undefined || data.deptLevel === null || Number(data.deptLevel) <= 0) {
    data.deptLevel = 1
  }
}

function validateCandidateConfig(data) {
  const strategy = Number(data && data.candidateStrategy)
  const param = data && data.candidateParam
  const hasParam = param !== undefined && param !== null && String(param) !== ''
  const hasIds = (key) => Array.isArray(data && data[key]) && data[key].length > 0
  switch (strategy) {
    case CandidateStrategy.USER:
      return hasIds('userIds') || hasParam ? '' : '请至少选择一名用户'
    case CandidateStrategy.ROLE:
      return hasIds('roleIds') || hasParam ? '' : '请至少选择一个角色'
    case CandidateStrategy.POST:
      return hasIds('postIds') || hasParam ? '' : '请至少选择一个岗位'
    case CandidateStrategy.USER_GROUP:
      return hasIds('userGroups') || hasParam ? '' : '请至少选择一个用户组'
    case CandidateStrategy.DEPT_MEMBER:
    case CandidateStrategy.DEPT_LEADER:
      return hasIds('deptIds') || hasParam ? '' : '请至少选择一个部门'
    case CandidateStrategy.MULTI_LEVEL_DEPT_LEADER:
      return (hasIds('deptIds') || hasParam) && Number(data.deptLevel) > 0 ? '' : '请选择部门并设置有效的部门层级'
    case CandidateStrategy.START_USER_DEPT_LEADER:
    case CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER:
      return Number(data.deptLevel) > 0 || hasParam ? '' : '请设置有效的部门层级'
    case CandidateStrategy.FORM_USER:
      return data.formUser || hasParam ? '' : '请选择表单内用户字段'
    case CandidateStrategy.FORM_DEPT_LEADER:
      return (data.formDept || hasParam) && Number(data.deptLevel) > 0 ? '' : '请选择表单内部门字段并设置有效的部门层级'
    case CandidateStrategy.EXPRESSION:
      return data.expression || hasParam ? '' : '请输入流程表达式'
    default:
      return ''
  }
}

function candidateControlsChanged(current, snapshot) {
  return CANDIDATE_CONTROL_KEYS.some((key) => !valuesEqual(current && current[key], snapshot && snapshot[key]))
}

/**
 * Overlay only fields changed by controls after the drawer opened.  This
 * avoids copying the stale form snapshot over newer values typed in JSON.
 */
function applyChangedFields(target, current, snapshot) {
  if (!isObject(current) || !isObject(snapshot)) {
    return clone(current)
  }
  const result = isObject(target) ? target : {}
  Object.keys(current).forEach((key) => {
    const currentValue = current[key]
    const hasSnapshotValue = Object.prototype.hasOwnProperty.call(snapshot, key)
    const snapshotValue = snapshot[key]
    if (isObject(currentValue) && hasSnapshotValue && isObject(snapshotValue)) {
      // If JSON replaced this section with a scalar/null and controls did not
      // change it, leave the JSON value untouched. Create an object only when
      // a nested control actually changed and therefore needs to be applied.
      if (isObject(result[key])) {
        result[key] = applyChangedFields(result[key], currentValue, snapshotValue)
      } else if (!valuesEqual(currentValue, snapshotValue)) {
        result[key] = applyChangedFields({}, currentValue, snapshotValue)
      }
    } else if (!hasSnapshotValue || !valuesEqual(currentValue, snapshotValue)) {
      result[key] = clone(currentValue)
    }
  })
  // A control may remove an optional field altogether. Preserve that edit by
  // writing `undefined`; the caller's $set then clears any stale JSON value.
  Object.keys(snapshot).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(current, key) && Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] = undefined
    }
  })
  return result
}

export default {
  name: 'GenericNodeConfig',
  components: {
    HttpRequestSetting
  },
  props: {
    flowNode: {
      type: Object,
      required: true
    }
  },
  inject: {
    roleListRef: { from: 'roleList', default: () => ({ value: [] }) },
    postListRef: { from: 'postList', default: () => ({ value: [] }) },
    userListRef: { from: 'userList', default: () => ({ value: [] }) },
    deptListRef: { from: 'deptList', default: () => ({ value: [] }) },
    userGroupListRef: { from: 'userGroupList', default: () => ({ value: [] }) },
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) }
  },
  data() {
    const initialForm = this.createForm()
    return {
      CandidateStrategy,
      visible: false,
      form: initialForm,
      jsonText: '',
      formSnapshot: clone(initialForm)
    }
  },
  computed: {
    drawerTitle() {
      return `${this.form.name || '节点'}配置`
    },
    roleList() {
      return this.roleListRef && this.roleListRef.value ? this.roleListRef.value : []
    },
    postList() {
      return this.postListRef && this.postListRef.value ? this.postListRef.value : []
    },
    userList() {
      return this.userListRef && this.userListRef.value ? this.userListRef.value : []
    },
    deptList() {
      return this.deptListRef && this.deptListRef.value ? this.deptListRef.value : []
    },
    userGroupList() {
      return this.userGroupListRef && this.userGroupListRef.value ? this.userGroupListRef.value : []
    },
    formFieldList() {
      return parseFormCreateFields(this.formFieldsRef && this.formFieldsRef.value)
    },
    userFieldList() {
      const fields = this.formFieldList.filter((item) => item.type === 'UserSelect')
      if (!fields.some((item) => item.field === ProcessVariableEnum.START_USER_ID)) {
        fields.unshift({
          field: ProcessVariableEnum.START_USER_ID,
          title: '发起人',
          type: 'UserSelect',
          required: true
        })
      }
      return fields
    },
    deptFieldList() {
      return this.formFieldList.filter((item) => item.type === 'DeptSelect')
    },
    multiLevelDeptOptions() {
      return MULTI_LEVEL_DEPT
    },
    candidateStrategies() {
      return CANDIDATE_STRATEGY
    },
    approveTypes() {
      return APPROVE_TYPE
    },
    conditionTypes() {
      return CONDITION_CONFIG_TYPES
    },
    timeUnitTypes() {
      return TIME_UNIT_TYPES
    },
    isUserNode() {
      return this.form.type === NodeType.USER_TASK_NODE || this.form.type === NodeType.TRANSACTOR_NODE || this.form.type === NodeType.COPY_TASK_NODE
    },
    isApprovalNode() {
      return this.form.type === NodeType.USER_TASK_NODE || this.form.type === NodeType.TRANSACTOR_NODE
    },
    isConditionNode() {
      return this.form.type === NodeType.CONDITION_NODE
    },
    isTimerNode() {
      return this.form.type === NodeType.DELAY_TIMER_NODE
    },
    isChildProcessNode() {
      return this.form.type === NodeType.CHILD_PROCESS_NODE
    },
    isTriggerNode() {
      return this.form.type === NodeType.TRIGGER_NODE
    },
    isRouterNode() {
      return this.form.type === NodeType.ROUTER_BRANCH_NODE
    },
    requiresDeptLevel() {
      return requiresDeptLevel(this.form.candidateStrategy)
    }
  },
  methods: {
    createForm() {
      const data = clone(this.flowNode)
      const userNode = data.type === NodeType.USER_TASK_NODE ||
        data.type === NodeType.TRANSACTOR_NODE ||
        data.type === NodeType.COPY_TASK_NODE
      if (userNode && (data.candidateStrategy === undefined || data.candidateStrategy === null)) {
        data.candidateStrategy = CandidateStrategy.USER
      }
      if ((data.type === NodeType.USER_TASK_NODE || data.type === NodeType.TRANSACTOR_NODE) &&
        (data.approveType === undefined || data.approveType === null)) {
        data.approveType = APPROVE_TYPE[0].value
      }
      // Only materialize the nested setting that belongs to this node type.
      // BpmSimpleModelNodeVO validates these objects when present; sending an
      // empty delay/child/HTTP object on every unrelated node can therefore
      // fail model validation (and the delay converter can dereference null
      // fields). Existing advanced settings are preserved as-is.
      if (data.type === NodeType.CONDITION_NODE && !data.conditionSetting) {
        data.conditionSetting = {}
      }
      if (data.type === NodeType.DELAY_TIMER_NODE && !data.delaySetting) {
        data.delaySetting = {}
      }
      if (data.type === NodeType.CHILD_PROCESS_NODE && !data.childProcessSetting) {
        data.childProcessSetting = {}
      }
      if (data.type === NodeType.TRIGGER_NODE && !data.httpRequestSetting) {
        data.httpRequestSetting = data.triggerSetting && data.triggerSetting.httpRequestSetting
          ? clone(data.triggerSetting.httpRequestSetting)
          : {}
      }
      if (!Array.isArray(data.userIds)) data.userIds = []
      if (!Array.isArray(data.roleIds)) data.roleIds = []
      if (!Array.isArray(data.deptIds)) data.deptIds = []
      if (!Array.isArray(data.postIds)) data.postIds = []
      if (!Array.isArray(data.userGroups)) data.userGroups = []
      if (data.formUser === undefined || data.formUser === null) data.formUser = ''
      if (data.formDept === undefined || data.formDept === null) data.formDept = ''
      if (data.expression === undefined || data.expression === null) data.expression = ''
      // Existing models usually only have candidateParam.  Hydrate the
      // convenience fields before the snapshot is taken so a later control
      // edit can be distinguished from an explicit advanced-JSON edit.
      parseCandidateParam(data)
      return data
    },
    openDrawer() {
      this.form = this.createForm()
      this.formSnapshot = clone(this.form)
      this.jsonText = JSON.stringify(this.form, null, 2)
      this.visible = true
    },
    showUserTaskNodeConfig() {
      this.openDrawer()
    },
    handleCandidateStrategyChange(strategy) {
      // Vue3 clears mutually exclusive controls when the strategy changes.
      // Do the same here so a hidden user/role/dept selection cannot be
      // accidentally serialized for the newly selected strategy.
      const nextStrategy = Number(strategy)
      const data = clone(this.form)
      clearInactiveCandidateControls(data, nextStrategy)
      CANDIDATE_ARRAY_KEYS.forEach((key) => this.$set(this.form, key, data[key]))
      CANDIDATE_TEXT_KEYS.forEach((key) => this.$set(this.form, key, data[key]))
      this.$set(this.form, 'deptLevel', data.deptLevel)
    },
    handleBeforeClose(done) {
      done()
    },
    saveConfig() {
      // JSON is the advanced base; only values changed by controls since the
      // drawer opened are applied afterwards. This keeps stale jsonText from
      // overwriting controls while preserving newer nested JSON fields.
      const formConfig = clone(this.form)
      let merged = formConfig
      let jsonConfig
      if (this.jsonText && this.jsonText.trim()) {
        try {
          jsonConfig = JSON.parse(this.jsonText)
          if (!jsonConfig || Array.isArray(jsonConfig) || typeof jsonConfig !== 'object') {
            throw new Error('高级 JSON 必须是对象')
          }
          merged = mergeConfig(formConfig, jsonConfig)
          merged = applyChangedFields(merged, formConfig, this.formSnapshot)
        } catch (e) {
          this.$message.error('高级 JSON 格式不正确')
          return
        }
      }
      const strategyChanged = !valuesEqual(formConfig.candidateStrategy, this.formSnapshot.candidateStrategy)
      const candidateChanged = candidateControlsChanged(formConfig, this.formSnapshot) || strategyChanged
      const jsonCandidateParamChanged = jsonConfig &&
        Object.prototype.hasOwnProperty.call(jsonConfig, 'candidateParam') &&
        !valuesEqual(jsonConfig.candidateParam, this.formSnapshot.candidateParam)

      // A visible strategy change wins over stale JSON controls from the
      // drawer-opening snapshot. Preserve an explicitly edited JSON
      // candidateParam as an escape hatch for strategies not exposed by the
      // compatibility controls.
      if (strategyChanged && !jsonCandidateParamChanged) {
        clearInactiveCandidateControls(merged, merged.candidateStrategy)
      } else if (jsonCandidateParamChanged) {
        // Hydrate convenience controls from an explicitly edited advanced
        // candidateParam before rebuilding it below.
        parseCandidateParam(merged)
      }

      // Apply the candidate conversion even when the user clears the
      // advanced JSON editor. A changed visual selector must never leave the
      // old candidateParam behind.
      if (candidateChanged) {
        const candidateParam = buildCandidateParam(merged)
        const strategy = Number(merged.candidateStrategy)
        // For strategies whose fields are intentionally exposed only through
        // advanced JSON, retain an explicitly edited parameter. Otherwise the
        // visual controls are authoritative, including an intentional clear.
        const preserveExplicitParam = jsonCandidateParamChanged && !hasCandidateData(merged) &&
          !strategyChanged
        if (preserveExplicitParam) {
          merged.candidateParam = jsonConfig.candidateParam
        } else if (candidateParam === undefined || candidateParam === '') {
          // Keep the key enumerable so the assignment loop can clear an old
          // reactive value on flowNode (delete alone would leave it behind).
          merged.candidateParam = undefined
        } else {
          merged.candidateParam = candidateParam
        }
      }

      // Fail early for a human approval node instead of allowing a malformed
      // candidateParam to reach the backend deployment validator. Advanced
      // JSON remains an escape hatch when it supplies an explicit parameter.
      if (candidateChanged && this.isUserNode &&
        (this.form.approveType === undefined || Number(this.form.approveType) === APPROVE_TYPE[0].value)) {
        const candidateError = validateCandidateConfig(merged)
        if (candidateError) {
          this.$message.error(candidateError)
          return
        }
      }

      // Translate legacy visual controls to the current nested simple-model
      // DTO before writing back to the live node.  The adapter only touches
      // known legacy names and leaves advanced JSON fields intact.
      normalizeNodeConfig(merged)

      const nodeConfigError = this.validateNodeSpecificConfig(merged)
      if (nodeConfigError) {
        this.$message.error(nodeConfigError)
        return
      }

      Object.keys(merged).forEach((key) => {
        this.$set(this.flowNode, key, merged[key])
      })
      if (merged.candidateParam === undefined && Object.prototype.hasOwnProperty.call(this.flowNode, 'candidateParam')) {
        this.$delete(this.flowNode, 'candidateParam')
      }
      if (!this.flowNode.showText) {
        this.$set(this.flowNode, 'showText', this.buildShowText())
      }
      this.visible = false
    },
    validateNodeSpecificConfig(data) {
      if (!data) return '节点配置不能为空'
      const type = Number(data.type)
      if (type === NodeType.DELAY_TIMER_NODE) {
        const setting = data.delaySetting
        if (!setting || !setting.delayType || !String(setting.delayTime || '').trim()) {
          return '请设置有效的延迟类型和延迟时间'
        }
      }
      if (type === NodeType.TRIGGER_NODE) {
        const setting = data.triggerSetting
        if (!setting || !setting.type) {
          return '请选择触发器类型并完善触发器配置'
        }
        if ((Number(setting.type) === 1 || Number(setting.type) === 2) &&
          (!setting.httpRequestSetting || !String(setting.httpRequestSetting.url || '').trim())) {
          return '请输入触发器请求地址'
        }
      }
      if (type === NodeType.CHILD_PROCESS_NODE) {
        const setting = data.childProcessSetting
        if (!setting || !String(setting.calledProcessDefinitionKey || '').trim() ||
          !String(setting.calledProcessDefinitionName || '').trim()) {
          return '请填写被调用流程标识和名称'
        }
        if (typeof setting.async !== 'boolean' || typeof setting.skipStartUserNode !== 'boolean') {
          return '请完善子流程异步和跳过发起人设置'
        }
        if (!setting.startUserSetting || !setting.startUserSetting.type ||
          !setting.startUserSetting.emptyType) {
          return '请完善子流程发起人配置'
        }
      }
      return ''
    },
    buildShowText() {
      const names = []
      if (this.isApprovalNode && Number(this.form.approveType) !== APPROVE_TYPE[0].value) {
        const approveType = this.approveTypes.find((item) => Number(item.value) === Number(this.form.approveType))
        return approveType ? approveType.label : ''
      }
      const strategy = Number(this.form.candidateStrategy)
      if (this.form.userIds && this.form.userIds.length) {
        if (strategy === CandidateStrategy.USER) names.push('指定成员')
      }
      if (this.form.roleIds && this.form.roleIds.length) {
        if (strategy === CandidateStrategy.ROLE) names.push('指定角色')
      }
      if (this.form.deptIds && this.form.deptIds.length) {
        if (strategy === CandidateStrategy.DEPT_MEMBER) names.push('部门成员')
        if (strategy === CandidateStrategy.DEPT_LEADER) names.push('部门负责人')
        if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) names.push('多级部门负责人')
      }
      if (this.form.postIds && this.form.postIds.length) {
        if (strategy === CandidateStrategy.POST) names.push('指定岗位')
      }
      if (this.form.userGroups && this.form.userGroups.length && strategy === CandidateStrategy.USER_GROUP) {
        names.push('指定用户组')
      }
      if (strategy === CandidateStrategy.FORM_USER && this.form.formUser) {
        names.push(`表单用户：${this.form.formUser}`)
      }
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER && this.form.formDept) {
        names.push(`表单部门负责人：${this.form.formDept}`)
      }
      if (
        (strategy === CandidateStrategy.START_USER_DEPT_LEADER ||
          strategy === CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER) &&
        this.form.deptLevel
      ) {
        names.push('发起人部门负责人')
      }
      if (strategy === CandidateStrategy.EXPRESSION && this.form.expression) {
        names.push(`流程表达式：${this.form.expression}`)
      }
      if (strategy === CandidateStrategy.START_USER_SELECT) {
        names.push('发起人自选')
      }
      if (strategy === CandidateStrategy.APPROVE_USER_SELECT) {
        names.push('审批人自选')
      }
      if (strategy === CandidateStrategy.START_USER) {
        names.push('发起人本人')
      }
      if (this.form.conditionSetting && this.form.conditionSetting.conditionExpression) {
        names.push(this.form.conditionSetting.conditionExpression)
      }
      if (this.form.childProcessSetting && this.form.childProcessSetting.calledProcessDefinitionName) {
        names.push(this.form.childProcessSetting.calledProcessDefinitionName)
      }
      return names.join('、')
    }
  }
}
</script>

<style scoped>
.generic-node-config {
  padding: 0 20px 64px;
}

.generic-node-config .el-select {
  width: 100%;
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
