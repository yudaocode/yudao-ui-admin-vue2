<template>
  <div class="user-task-custom-config">
    <el-alert
      v-if="loadError"
      :title="loadError"
      type="warning"
      :closable="false"
      show-icon
      class="config-alert"
    />
    <el-alert
      v-if="!supportsFlowableExtensions"
      title="当前 BPMN 方言未声明 Flowable 审批扩展"
      type="info"
      :closable="false"
      show-icon
      class="config-alert"
    />

    <el-divider content-position="left">审批类型</el-divider>
    <el-form-item label="处理方式">
      <el-radio-group v-model="approveTypeEl.value" @change="updateElementExtensions">
        <el-radio v-for="item in approveTypes" :key="item.value" :label="item.value">
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-divider content-position="left">审批人拒绝时</el-divider>
    <el-form-item label="执行动作">
      <el-radio-group v-model="rejectHandlerType" @change="updateRejectHandlerType">
        <el-radio
          v-for="item in rejectHandlerTypes"
          :key="item.value"
          :label="item.value"
          :disabled="item.value === rejectReturnValue && returnTaskList.length === 0"
        >
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="Number(rejectHandlerType) === rejectReturnValue" label="驳回节点">
      <el-select
        v-model="returnNodeId"
        clearable
        filterable
        placeholder="请选择驳回节点"
        style="width: 100%"
        @change="updateReturnNodeId"
      >
        <el-option
          v-for="item in returnTaskList"
          :key="item.id"
          :label="item.name || item.id"
          :value="item.id"
        />
      </el-select>
      <div v-if="returnTaskList.length === 0" class="field-help">当前节点没有可回退的前置用户任务</div>
    </el-form-item>

    <el-divider content-position="left">审批人为空时</el-divider>
    <el-form-item label="执行动作">
      <el-radio-group v-model="assignEmptyHandlerType" @change="updateAssignEmptyHandlerType">
        <el-radio v-for="item in assignEmptyHandlerTypes" :key="item.value" :label="item.value">
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="Number(assignEmptyHandlerType) === assignUserValue"
      label="指定用户"
    >
      <el-select
        v-model="assignEmptyUserIds"
        clearable
        multiple
        filterable
        placeholder="请选择用户"
        style="width: 100%"
        @change="updateAssignEmptyUserIds"
      >
        <el-option
          v-for="item in userOptions"
          :key="String(item.id)"
          :label="item.nickname || item.name || String(item.id)"
          :value="String(item.id)"
        />
      </el-select>
    </el-form-item>

    <el-divider content-position="left">审批人与提交人为同一人时</el-divider>
    <el-form-item label="执行动作">
      <el-radio-group
        v-model="assignStartUserHandlerType"
        @change="updateAssignStartUserHandlerType"
      >
        <el-radio v-for="item in assignStartUserHandlerTypes" :key="item.value" :label="item.value">
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-divider content-position="left">操作按钮</el-divider>
    <div class="button-setting-pane">
      <div class="button-setting-title">
        <span>按钮</span>
        <span>显示名称</span>
        <span>启用</span>
      </div>
      <div v-for="(item, index) in buttonsSettingEl" :key="buttonKey(item, index)" class="button-setting-item">
        <span class="button-name">{{ operationButtonName(item.id) }}</span>
        <el-input
          v-model="item.displayName"
          size="mini"
          class="button-display-name"
          :placeholder="operationButtonName(item.id)"
          @change="updateButton(index)"
        />
        <el-switch v-model="item.enable" @change="updateElementExtensions" />
      </div>
    </div>

    <el-divider content-position="left">字段权限</el-divider>
    <div v-if="isNormalForm && fieldsPermissionEl.length" class="field-setting-pane">
      <div class="field-permission-title">
        <span>字段名称</span>
        <span class="permission-actions">
          <el-button type="text" size="mini" @click="updatePermission(fieldPermission.READ)">只读</el-button>
          <el-button type="text" size="mini" @click="updatePermission(fieldPermission.WRITE)">可编辑</el-button>
          <el-button type="text" size="mini" @click="updatePermission(fieldPermission.NONE)">隐藏</el-button>
        </span>
      </div>
      <div v-for="item in fieldsPermissionEl" :key="item.field" class="field-setting-item">
        <span class="field-name" :title="item.title">{{ item.title || item.field }}</span>
        <el-radio-group v-model="item.permission" @change="updateElementExtensions">
          <el-radio :label="fieldPermission.READ"><span class="sr-only">只读</span></el-radio>
          <el-radio :label="fieldPermission.WRITE"><span class="sr-only">可编辑</span></el-radio>
          <el-radio :label="fieldPermission.NONE"><span class="sr-only">隐藏</span></el-radio>
        </el-radio-group>
      </div>
    </div>
    <div v-else-if="isNormalForm" class="field-help">当前流程表单暂无可配置字段</div>
    <div v-else class="field-help">业务表单不提供流程字段权限配置</div>

    <el-divider content-position="left">是否需要签名</el-divider>
    <el-form-item label="签名">
      <el-switch
        v-model="signEnableEl.value"
        active-text="是"
        inactive-text="否"
        @change="updateElementExtensions"
      />
    </el-form-item>

    <el-divider content-position="left">审批意见</el-divider>
    <el-form-item label="意见要求">
      <el-switch
        v-model="reasonRequireEl.value"
        active-text="必填"
        inactive-text="非必填"
        @change="updateElementExtensions"
      />
    </el-form-item>
  </div>
</template>

<script>
import {
  ASSIGN_EMPTY_HANDLER_TYPES,
  ASSIGN_START_USER_HANDLER_TYPES,
  APPROVE_TYPE,
  DEFAULT_BUTTON_SETTING,
  FieldPermissionType,
  OPERATION_BUTTON_NAME,
  OperationButtonType,
  RejectHandlerType
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { BpmModelFormType } from '@/utils/constants'
import { parseFormFields } from '@/components/FormCreate/src/utils'
import { getSimpleUserList } from '@/api/system/user'

const MANAGED_EXTENSION_TYPES = [
  'AssignStartUserHandlerType',
  'RejectHandlerType',
  'RejectReturnTaskId',
  'AssignEmptyHandlerType',
  'AssignEmptyUserIds',
  'ButtonsSetting',
  'FieldsPermission',
  'ApproveType',
  'SignEnable',
  'ReasonRequire'
]

function unwrap(value) {
  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
    return value.value
  }
  return value
}

function asNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function asBoolean(value, fallback) {
  if (value === true || value === false) return value
  if (value === 'true' || value === '1' || value === 1) return true
  if (value === 'false' || value === '0' || value === 0) return false
  return fallback
}

function extensionValue(extension, fallback) {
  return extension && extension.value !== undefined ? extension.value : fallback
}

function extensionAttribute(extension, key, fallback) {
  if (!extension) return fallback
  if (extension[key] !== undefined) return extension[key]
  // bpmn-moddle exposes namespaced attributes without the prefix on the
  // object, while plain JSON fixtures often retain the namespaced key.
  const shortKey = key.indexOf(':') >= 0 ? key.split(':').pop() : key
  return extension[shortKey] !== undefined ? extension[shortKey] : fallback
}

function cloneButton(item) {
  return {
    id: item.id,
    displayName: item.displayName,
    enable: item.enable !== false
  }
}

export default {
  name: 'ElementCustomConfig4UserTask',
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: { default: 'flowable' },
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) },
    formTypeRef: { from: 'formType', default: () => ({ value: undefined }) }
  },
  data() {
    return {
      BpmModelFormType,
      approveTypes: APPROVE_TYPE,
      rejectHandlerTypes: [
        { label: '终止流程', value: RejectHandlerType.FINISH_PROCESS },
        { label: '驳回到指定节点', value: RejectHandlerType.RETURN_USER_TASK }
      ],
      assignEmptyHandlerTypes: ASSIGN_EMPTY_HANDLER_TYPES,
      assignStartUserHandlerTypes: ASSIGN_START_USER_HANDLER_TYPES,
      fieldPermission: FieldPermissionType,
      rejectReturnValue: RejectHandlerType.RETURN_USER_TASK,
      assignUserValue: 3,
      element: null,
      extensionElements: null,
      otherExtensions: [],
      approveTypeEl: { value: 1 },
      assignStartUserHandlerTypeEl: { value: 1 },
      assignStartUserHandlerType: 1,
      rejectHandlerTypeEl: { value: RejectHandlerType.FINISH_PROCESS },
      rejectHandlerType: RejectHandlerType.FINISH_PROCESS,
      returnNodeIdEl: { value: '' },
      returnNodeId: '',
      assignEmptyHandlerTypeEl: { value: 1 },
      assignEmptyHandlerType: 1,
      assignEmptyUserIdsEl: { value: '' },
      assignEmptyUserIds: [],
      buttonsSettingEl: [],
      fieldsPermissionEl: [],
      signEnableEl: { value: false },
      reasonRequireEl: { value: false },
      returnTaskList: [],
      userOptions: [],
      loadError: '',
      resetToken: 0
    }
  },
  computed: {
    formType() {
      return unwrap(this.formTypeRef)
    },
    isNormalForm() {
      return Number(this.formType) === BpmModelFormType.NORMAL
    },
    supportsFlowableExtensions() {
      return String(this.prefix || '').toLowerCase() === 'flowable'
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(value) {
        if (value) this.$nextTick(this.resetCustomConfigList)
      }
    },
    formFieldsRef: {
      deep: true,
      handler() {
        if (this.element) this.buildFieldsPermission()
      }
    },
    formType() {
      if (this.element) this.buildFieldsPermission()
    }
  },
  created() {
    this.loadUsers()
  },
  methods: {
    bpmn() {
      return typeof window !== 'undefined' && window.bpmnInstances ? window.bpmnInstances : null
    },
    moddleCreate(type, properties) {
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !instance || !instance.moddle) return null
      try {
        return instance.moddle.create(`${this.prefix}:${type}`, properties || {})
      } catch (error) {
        this.loadError = '当前 BPMN 描述未声明 Flowable 审批扩展'
        return null
      }
    },
    findExtension(values, type) {
      const fullType = `${this.prefix}:${type}`
      return (values || []).find((item) => item && (item.$type === fullType || item.$type === type))
    },
    isManagedExtension(item) {
      if (!item || !item.$type) return false
      const type = String(item.$type).split(':').pop()
      return MANAGED_EXTENSION_TYPES.indexOf(type) !== -1
    },
    normalizeIds(value) {
      if (!value) return []
      return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    buttonKey(item, index) {
      return `${item && item.id !== undefined ? item.id : 'button'}-${index}`
    },
    operationButtonName(id) {
      return OPERATION_BUTTON_NAME.get(asNumber(id, id)) || `按钮${id}`
    },
    async loadUsers() {
      try {
        const response = await getSimpleUserList()
        const data = response && response.data !== undefined ? response.data : response
        this.userOptions = Array.isArray(data) ? data : []
        this.loadError = ''
      } catch (error) {
        this.loadError = '用户列表加载失败，指定用户仍可保留已有编号'
        // Keep the API failure observable without blocking BPMN editing.
        // eslint-disable-next-line no-console
        console.error('[bpmn] failed to load simple users', error)
      }
    },
    actualElement() {
      const instance = this.bpmn()
      if (!instance) return null
      if (instance.elementRegistry && this.id) {
        const found = instance.elementRegistry.get(this.id)
        if (found) return found
      }
      return instance.bpmnElement || null
    },
    findReturnTasks(element) {
      const instance = this.bpmn()
      const registry = instance && instance.elementRegistry
      if (!registry || !element) return []
      const flows = registry.filter((item) => item && item.type === 'bpmn:SequenceFlow')
      const visited = {}
      const result = []
      const seen = {}
      const walk = (target) => {
        if (!target || visited[target.id]) return
        visited[target.id] = true
        flows.forEach((flow) => {
          if (flow.target !== target || !flow.source) return
          const source = flow.source
          if (source.type !== 'bpmn:StartEvent' && source.businessObject) {
            // RejectReturnTaskId is consumed as a user-task id by Flowable;
            // avoid offering gateways/events that cannot be returned to.
            if (source.type === 'bpmn:UserTask' && !seen[source.id]) {
              seen[source.id] = true
              result.push(source.businessObject)
            }
            walk(source)
          }
        })
      }
      walk(element)
      return result
    },
    parseFormFields(rawFields) {
      const fields = []
      const list = unwrap(rawFields)
      if (!Array.isArray(list)) return fields
      list.forEach((item) => {
        try {
          const rule = typeof item === 'string' ? JSON.parse(item) : item
          if (rule && typeof rule === 'object') parseFormFields(rule, fields)
        } catch (error) {
          // A malformed historical rule must not prevent editing other fields.
          // eslint-disable-next-line no-console
          console.warn('[bpmn] ignored malformed form field rule', error)
        }
      })
      return fields
    },
    buildFieldsPermission() {
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !instance || !this.element) return
      const values = (this.extensionElements && this.extensionElements.values) || []
      const existing = values.filter((item) => {
        const type = item && item.$type ? String(item.$type).split(':').pop() : ''
        return type === 'FieldsPermission'
      })
      const parsed = this.parseFormFields(this.formFieldsRef)
      if (!parsed.length) {
        // Preserve historical field permissions even if the form is no longer
        // available; this prevents an accidental data loss on save.
        this.fieldsPermissionEl = existing.slice()
        return
      }
      this.fieldsPermissionEl = parsed.map((field) => {
        const found = existing.find((item) => extensionAttribute(item, 'flowable:field', item.field) === field.field)
        return instance.moddle.create(`${this.prefix}:FieldsPermission`, {
          'flowable:field': field.field,
          'flowable:title': field.title,
          'flowable:permission': found
            ? String(extensionAttribute(found, 'flowable:permission', found.permission || FieldPermissionType.READ))
            : FieldPermissionType.READ
        })
      })
    },
    resetCustomConfigList() {
      const element = this.actualElement()
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !element || !instance || !instance.moddle) return
      this.element = element
      this.resetToken += 1
      const values =
        element.businessObject && element.businessObject.extensionElements
          ? element.businessObject.extensionElements.values || []
          : []
      this.extensionElements =
        (element.businessObject && element.businessObject.extensionElements) ||
        instance.moddle.create('bpmn:ExtensionElements', { values: [] })
      this.returnTaskList = this.findReturnTasks(element)

      this.approveTypeEl =
        this.findExtension(values, 'ApproveType') || this.moddleCreate('ApproveType', { value: 1 })
      this.approveTypeEl.value = asNumber(extensionValue(this.approveTypeEl, 1), 1)

      this.assignStartUserHandlerTypeEl =
        this.findExtension(values, 'AssignStartUserHandlerType') ||
        this.moddleCreate('AssignStartUserHandlerType', { value: 1 })
      this.assignStartUserHandlerType = asNumber(extensionValue(this.assignStartUserHandlerTypeEl, 1), 1)
      this.assignStartUserHandlerTypeEl.value = this.assignStartUserHandlerType

      this.rejectHandlerTypeEl =
        this.findExtension(values, 'RejectHandlerType') ||
        this.moddleCreate('RejectHandlerType', { value: RejectHandlerType.FINISH_PROCESS })
      this.rejectHandlerType = asNumber(
        extensionValue(this.rejectHandlerTypeEl, RejectHandlerType.FINISH_PROCESS),
        RejectHandlerType.FINISH_PROCESS
      )
      this.rejectHandlerTypeEl.value = this.rejectHandlerType
      this.returnNodeIdEl =
        this.findExtension(values, 'RejectReturnTaskId') || this.moddleCreate('RejectReturnTaskId', { value: '' })
      this.returnNodeId = String(extensionValue(this.returnNodeIdEl, '') || '')
      this.returnNodeIdEl.value = this.returnNodeId

      this.assignEmptyHandlerTypeEl =
        this.findExtension(values, 'AssignEmptyHandlerType') ||
        this.moddleCreate('AssignEmptyHandlerType', { value: 1 })
      this.assignEmptyHandlerType = asNumber(extensionValue(this.assignEmptyHandlerTypeEl, 1), 1)
      this.assignEmptyHandlerTypeEl.value = this.assignEmptyHandlerType
      this.assignEmptyUserIdsEl =
        this.findExtension(values, 'AssignEmptyUserIds') || this.moddleCreate('AssignEmptyUserIds', { value: '' })
      this.assignEmptyUserIds = this.normalizeIds(extensionValue(this.assignEmptyUserIdsEl, ''))
      this.assignEmptyUserIdsEl.value = this.assignEmptyUserIds.join(',')

      this.buttonsSettingEl = values.filter((item) => {
        const type = item && item.$type ? String(item.$type).split(':').pop() : ''
        return type === 'ButtonsSetting'
      })
      if (!this.buttonsSettingEl.length) {
        this.buttonsSettingEl = DEFAULT_BUTTON_SETTING.map((item) =>
          instance.moddle.create(`${this.prefix}:ButtonsSetting`, {
            'flowable:id': item.id,
            'flowable:displayName': item.displayName,
            'flowable:enable': item.enable
          })
        )
      } else {
        this.buttonsSettingEl.forEach((item) => {
          item.id = asNumber(extensionAttribute(item, 'flowable:id', item.id), item.id)
          item.displayName = String(
            extensionAttribute(item, 'flowable:displayName', item.displayName || this.operationButtonName(item.id))
          )
          item.enable = asBoolean(extensionAttribute(item, 'flowable:enable', item.enable), true)
        })
      }

      this.signEnableEl =
        this.findExtension(values, 'SignEnable') || this.moddleCreate('SignEnable', { value: false })
      this.signEnableEl.value = asBoolean(extensionValue(this.signEnableEl, false), false)
      this.reasonRequireEl =
        this.findExtension(values, 'ReasonRequire') || this.moddleCreate('ReasonRequire', { value: false })
      this.reasonRequireEl.value = asBoolean(extensionValue(this.reasonRequireEl, false), false)

      this.otherExtensions = values.filter((item) => !this.isManagedExtension(item))
      this.buildFieldsPermission()
      this.updateElementExtensions()
    },
    updateAssignStartUserHandlerType() {
      this.assignStartUserHandlerTypeEl.value = asNumber(this.assignStartUserHandlerType, 1)
      this.updateElementExtensions()
    },
    updateRejectHandlerType() {
      this.rejectHandlerTypeEl.value = asNumber(this.rejectHandlerType, RejectHandlerType.FINISH_PROCESS)
      if (Number(this.rejectHandlerType) === RejectHandlerType.RETURN_USER_TASK && !this.returnNodeId && this.returnTaskList.length) {
        this.returnNodeId = this.returnTaskList[0].id
        this.returnNodeIdEl.value = this.returnNodeId
      }
      if (Number(this.rejectHandlerType) !== RejectHandlerType.RETURN_USER_TASK) {
        this.returnNodeId = ''
        this.returnNodeIdEl.value = ''
      }
      this.updateElementExtensions()
    },
    updateReturnNodeId() {
      this.returnNodeIdEl.value = this.returnNodeId || ''
      this.updateElementExtensions()
    },
    updateAssignEmptyHandlerType() {
      this.assignEmptyHandlerTypeEl.value = asNumber(this.assignEmptyHandlerType, 1)
      this.updateElementExtensions()
    },
    updateAssignEmptyUserIds() {
      this.assignEmptyUserIdsEl.value = (this.assignEmptyUserIds || []).join(',')
      this.updateElementExtensions()
    },
    updateButton(index) {
      const item = this.buttonsSettingEl[index]
      if (item && !item.displayName) item.displayName = this.operationButtonName(item.id)
      this.updateElementExtensions()
    },
    updatePermission(permission) {
      this.fieldsPermissionEl.forEach((item) => {
        item.permission = permission
      })
      this.updateElementExtensions()
    },
    updateElementExtensions() {
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !instance || !instance.moddle || !instance.modeling || !this.element) return
      const managed = [
        this.assignStartUserHandlerTypeEl,
        this.rejectHandlerTypeEl,
        this.returnNodeIdEl,
        this.assignEmptyHandlerTypeEl,
        this.assignEmptyUserIdsEl,
        this.approveTypeEl,
        ...this.buttonsSettingEl,
        ...this.fieldsPermissionEl,
        this.signEnableEl,
        this.reasonRequireEl
      ].filter(Boolean)
      const extensionElements = instance.moddle.create('bpmn:ExtensionElements', {
        values: [...(this.otherExtensions || []), ...managed]
      })
      instance.modeling.updateProperties(this.element, { extensionElements })
      this.extensionElements = extensionElements
    }
  }
}
</script>

<style scoped>
.config-alert {
  margin-bottom: 10px;
}

.field-help {
  margin: -4px 0 10px;
  color: #909399;
  font-size: 12px;
}

.button-setting-pane,
.field-setting-pane {
  font-size: 13px;
}

.button-setting-title,
.button-setting-item,
.field-permission-title,
.field-setting-item {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 4px 8px;
  border: 1px solid #ebeef5;
  border-bottom: 0;
}

.button-setting-title,
.field-permission-title {
  justify-content: space-between;
  font-weight: 600;
  background: #f8fafc;
}

.button-setting-item:last-child,
.field-setting-item:last-child {
  border-bottom: 1px solid #ebeef5;
}

.button-name,
.field-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-display-name {
  width: 145px;
  margin: 0 10px;
}

.permission-actions {
  display: flex;
  align-items: center;
}

.field-setting-item .el-radio-group {
  display: flex;
  width: 190px;
  justify-content: space-around;
}

.field-setting-item .el-radio {
  margin-right: 4px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
</style>
