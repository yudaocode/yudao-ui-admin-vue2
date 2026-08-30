<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    size="680px"
    :before-close="handleBeforeClose"
  >
    <div class="child-config">
      <el-form ref="form" :model="draft" :rules="rules" label-position="top" size="small">
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="draft.name" maxlength="30" show-word-limit />
        </el-form-item>
        <el-card shadow="never" class="setting-card">
          <div slot="header">子流程</div>
          <el-form-item label="选择子流程" prop="calledProcessDefinitionKey">
            <el-select
              v-model="draft.calledProcessDefinitionKey"
              filterable
              allow-create
              default-first-option
              clearable
              style="width: 100%"
              @change="handleCalledProcessChange"
            >
              <el-option v-for="item in childProcessOptions" :key="item.key || item.id" :label="item.name || item.key" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="子流程名称" prop="calledProcessDefinitionName">
            <el-input v-model="draft.calledProcessDefinitionName" placeholder="选择流程后自动填充，也可手工填写" />
          </el-form-item>
          <el-form-item label="是否异步">
            <el-switch v-model="draft.async" active-text="异步" inactive-text="同步" />
          </el-form-item>
          <el-form-item label="自动跳过子流程发起节点">
            <el-switch v-model="draft.skipStartUserNode" active-text="跳过" inactive-text="不跳过" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="setting-card">
          <div slot="header">变量传递</div>
          <div class="variable-title">主流程 → 子流程</div>
          <div v-for="(item, index) in draft.inVariables" :key="`in-${index}`" class="variable-row">
            <el-select v-model="item.source" filterable allow-create placeholder="主流程字段">
              <el-option v-for="field in parentFieldOptions" :key="`p-${field.field}`" :label="field.title" :value="field.field" />
            </el-select>
            <span class="arrow">→</span>
            <el-select v-model="item.target" filterable allow-create placeholder="子流程字段">
              <el-option v-for="field in childFieldOptions" :key="`c-${field.field}`" :label="field.title" :value="field.field" />
            </el-select>
            <el-button type="text" icon="el-icon-delete" title="删除" @click="removeVariable(draft.inVariables, index)" />
          </div>
          <el-button type="text" icon="el-icon-plus" @click="addVariable(draft.inVariables)">添加一行</el-button>

          <template v-if="!draft.async">
            <div class="variable-title out-title">子流程 → 主流程</div>
            <div v-for="(item, index) in draft.outVariables" :key="`out-${index}`" class="variable-row">
              <el-select v-model="item.source" filterable allow-create placeholder="子流程字段">
                <el-option v-for="field in childFieldOptions" :key="`co-${field.field}`" :label="field.title" :value="field.field" />
              </el-select>
              <span class="arrow">→</span>
              <el-select v-model="item.target" filterable allow-create placeholder="主流程字段">
                <el-option v-for="field in parentFieldOptions" :key="`po-${field.field}`" :label="field.title" :value="field.field" />
              </el-select>
              <el-button type="text" icon="el-icon-delete" title="删除" @click="removeVariable(draft.outVariables, index)" />
            </div>
            <el-button type="text" icon="el-icon-plus" @click="addVariable(draft.outVariables)">添加一行</el-button>
          </template>
        </el-card>

        <el-card shadow="never" class="setting-card">
          <div slot="header">子流程发起人</div>
          <el-form-item label="发起人来源" prop="startUserSetting.type">
            <el-radio-group v-model="draft.startUserSetting.type" @change="startUserTypeChanged">
              <el-radio v-for="item in startUserTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="Number(draft.startUserSetting.type) === ChildProcessStartUserTypeEnum.FROM_FORM" label="发起人表单字段" prop="startUserSetting.formField">
            <el-select v-model="draft.startUserSetting.formField" filterable allow-create clearable style="width: 100%">
              <el-option v-for="field in parentUserFields" :key="field.field" :label="field.title" :value="field.field" />
            </el-select>
          </el-form-item>
          <el-form-item label="发起人为空时" prop="startUserSetting.emptyType">
            <el-radio-group v-model="draft.startUserSetting.emptyType">
              <el-radio v-for="item in startUserEmptyTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="setting-card">
          <div slot="header">超时设置</div>
          <el-form-item label="启用超时">
            <el-switch v-model="draft.timeoutSetting.enable" @change="timeoutEnabledChanged" />
          </el-form-item>
          <template v-if="draft.timeoutSetting.enable">
            <el-form-item label="时间类型" prop="timeoutSetting.type">
              <el-radio-group v-model="draft.timeoutSetting.type" @change="timeoutTypeChanged">
                <el-radio-button v-for="item in delayTypes" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="Number(draft.timeoutSetting.type) === DelayTypeEnum.FIXED_TIME_DURATION" label="超时时长" prop="timeoutDuration">
              <el-input-number v-model="draft.timeoutDuration" :min="1" :precision="0" />
              <el-select v-model="draft.timeoutUnit" class="unit-select">
                <el-option v-for="item in timeUnitTypes" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item v-else label="超时日期时间" prop="timeoutDateTime">
              <el-date-picker v-model="draft.timeoutDateTime" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" placeholder="请选择日期和时间" style="width: 100%" />
            </el-form-item>
          </template>
        </el-card>

        <el-card shadow="never" class="setting-card">
          <div slot="header">多实例设置</div>
          <el-form-item label="启用多实例">
            <el-switch v-model="draft.multiInstanceSetting.enable" @change="multiEnabledChanged" />
          </el-form-item>
          <template v-if="draft.multiInstanceSetting.enable">
            <el-form-item label="执行方式">
              <el-switch v-model="draft.multiInstanceSetting.sequential" active-text="串行" inactive-text="并行" />
            </el-form-item>
            <el-form-item label="完成比例（%）" prop="multiInstanceSetting.approveRatio">
              <el-input-number v-model="draft.multiInstanceSetting.approveRatio" :min="10" :max="100" :step="10" />
            </el-form-item>
            <el-form-item label="实例来源" prop="multiInstanceSetting.sourceType">
              <el-select v-model="draft.multiInstanceSetting.sourceType" style="width: 100%" @change="multiSourceChanged">
                <el-option v-for="item in multiSourceTypes" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源值" prop="multiInstanceSetting.source">
              <el-input-number v-if="Number(draft.multiInstanceSetting.sourceType) === ChildProcessMultiInstanceSourceTypeEnum.FIXED_QUANTITY" v-model="multiSourceNumber" :min="1" :precision="0" />
              <el-select v-else v-model="draft.multiInstanceSetting.source" filterable allow-create style="width: 100%">
                <el-option v-for="field in multiSourceFields" :key="field.field" :label="field.title" :value="field.field" />
              </el-select>
            </el-form-item>
          </template>
        </el-card>
      </el-form>
      <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" />
    </div>
    <div class="drawer-footer">
      <el-button @click="cancelConfig">取 消</el-button>
      <el-button type="primary" @click="saveConfig">确 定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { getModelList } from '@/api/bpm/model'
import { getForm } from '@/api/bpm/form'
import {
  DELAY_TYPE, DelayTypeEnum, TIME_UNIT_TYPES, TimeUnitType,
  CHILD_PROCESS_START_USER_TYPE, ChildProcessStartUserTypeEnum,
  CHILD_PROCESS_START_USER_EMPTY_TYPE, ChildProcessStartUserEmptyTypeEnum,
  CHILD_PROCESS_MULTI_INSTANCE_SOURCE_TYPE, ChildProcessMultiInstanceSourceTypeEnum,
  NodeType, NODE_DEFAULT_NAME, ProcessVariableEnum
} from '../consts'
import { parseFields, parseIsoDuration, durationToIso, normalizeDateTime, clone } from './components/node-config-utils'

export default {
  name: 'ChildProcessNodeConfig',
  props: { flowNode: { type: Object, required: true } },
  inject: {
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) }
  },
  data() {
    return {
      visible: false,
      draft: this.createDraft(this.flowNode),
      childProcessOptions: [],
      childFieldOptions: [],
      loadError: '',
      delayTypes: DELAY_TYPE,
      timeUnitTypes: TIME_UNIT_TYPES,
      startUserTypes: CHILD_PROCESS_START_USER_TYPE,
      startUserEmptyTypes: CHILD_PROCESS_START_USER_EMPTY_TYPE,
      multiSourceTypes: CHILD_PROCESS_MULTI_INSTANCE_SOURCE_TYPE,
      DelayTypeEnum,
      TimeUnitType,
      ChildProcessStartUserTypeEnum,
      ChildProcessMultiInstanceSourceTypeEnum,
      rules: {
        calledProcessDefinitionKey: [{ required: true, message: '请选择或填写子流程', trigger: 'change' }],
        calledProcessDefinitionName: [{ required: true, message: '子流程名称不能为空', trigger: 'blur' }],
        'startUserSetting.type': [{ required: true, message: '发起人来源不能为空', trigger: 'change' }],
        'startUserSetting.emptyType': [{ required: true, message: '发起人为空策略不能为空', trigger: 'change' }],
        'startUserSetting.formField': [{ required: true, message: '请选择发起人字段', trigger: 'change' }],
        'timeoutSetting.type': [{ required: true, message: '超时时间类型不能为空', trigger: 'change' }],
        timeoutDuration: [{ required: true, type: 'number', min: 1, message: '超时时长必须大于 0', trigger: 'change' }],
        timeoutDateTime: [{ required: true, message: '超时日期时间不能为空', trigger: 'change' }],
        'multiInstanceSetting.approveRatio': [{ required: true, type: 'number', min: 10, max: 100, message: '完成比例需在 10～100', trigger: 'change' }],
        'multiInstanceSetting.sourceType': [{ required: true, message: '实例来源不能为空', trigger: 'change' }],
        'multiInstanceSetting.source': [{ required: true, message: '实例来源值不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    drawerTitle() { return `${this.draft.name || NODE_DEFAULT_NAME.get(NodeType.CHILD_PROCESS_NODE)}配置` },
    parentFieldOptions() {
      const fields = parseFields(this.formFieldsRef && this.formFieldsRef.value)
      if (!fields.some((item) => item.field === ProcessVariableEnum.START_USER_ID)) fields.unshift({ field: ProcessVariableEnum.START_USER_ID, title: '发起人', required: true })
      return fields
    },
    parentUserFields() { return this.parentFieldOptions.filter((item) => item.type === 'UserSelect' || item.field === ProcessVariableEnum.START_USER_ID) },
    multiSourceFields() {
      const type = Number(this.draft.multiInstanceSetting.sourceType)
      if (type === ChildProcessMultiInstanceSourceTypeEnum.NUMBER_FORM) return this.parentFieldOptions.filter((item) => item.type === 'inputNumber')
      return this.parentFieldOptions.filter((item) => item.type === 'select' || item.type === 'checkbox')
    },
    multiSourceNumber: {
      get() { return Number(this.draft.multiInstanceSetting.source || 1) },
      set(value) { this.$set(this.draft.multiInstanceSetting, 'source', String(value || '')) }
    }
  },
  watch: {
    flowNode: { deep: true, handler(value) { if (!this.visible && value) this.draft = this.createDraft(value) } }
  },
  created() { this.loadChildProcessOptions() },
  methods: {
    createDraft(node) {
      const setting = clone(node && node.childProcessSetting ? node.childProcessSetting : {})
      const timeout = setting.timeoutSetting || {}
      const timeoutParsed = parseIsoDuration(timeout.timeExpression)
      const multi = setting.multiInstanceSetting || {}
      return {
        name: node && node.name ? node.name : NODE_DEFAULT_NAME.get(NodeType.CHILD_PROCESS_NODE),
        calledProcessDefinitionKey: setting.calledProcessDefinitionKey || '',
        calledProcessDefinitionName: setting.calledProcessDefinitionName || '',
        async: setting.async === true,
        skipStartUserNode: setting.skipStartUserNode === true,
        inVariables: Array.isArray(setting.inVariables) ? setting.inVariables.map((item) => ({ source: item.source || '', target: item.target || '' })) : [],
        outVariables: Array.isArray(setting.outVariables) ? setting.outVariables.map((item) => ({ source: item.source || '', target: item.target || '' })) : [],
        startUserSetting: {
          type: Number(setting.startUserSetting && setting.startUserSetting.type) || ChildProcessStartUserTypeEnum.MAIN_PROCESS_START_USER,
          formField: setting.startUserSetting && setting.startUserSetting.formField ? setting.startUserSetting.formField : '',
          emptyType: Number(setting.startUserSetting && setting.startUserSetting.emptyType) || ChildProcessStartUserEmptyTypeEnum.MAIN_PROCESS_START_USER
        },
        timeoutSetting: {
          enable: timeout.enable === true,
          type: Number(timeout.type) || DelayTypeEnum.FIXED_TIME_DURATION,
          timeExpression: timeout.timeExpression || ''
        },
        timeoutDuration: timeoutParsed.duration,
        timeoutUnit: timeoutParsed.unit,
        timeoutDateTime: timeout.type === DelayTypeEnum.FIXED_DATE_TIME ? normalizeDateTime(timeout.timeExpression) : '',
        multiInstanceSetting: {
          enable: multi.enable === true,
          sequential: multi.sequential === true,
          approveRatio: Number(multi.approveRatio) || 100,
          sourceType: Number(multi.sourceType) || ChildProcessMultiInstanceSourceTypeEnum.FIXED_QUANTITY,
          source: multi.source === undefined || multi.source === null ? '1' : String(multi.source)
        }
      }
    },
    async loadChildProcessOptions() {
      try {
        const response = await getModelList()
        const data = response && response.data !== undefined ? response.data : response
        this.childProcessOptions = Array.isArray(data) ? data.filter((item) => item && item.key) : []
        this.loadError = ''
        this.loadChildFields()
      } catch (e) {
        this.loadError = '子流程列表加载失败，可直接填写流程标识和名称'
        // eslint-disable-next-line no-console
        console.error('[BPM] 加载子流程列表失败', e)
      }
    },
    async loadChildFields() {
      const option = this.childProcessOptions.find((item) => String(item.key) === String(this.draft.calledProcessDefinitionKey))
      if (!option || !option.formId) { this.childFieldOptions = []; return }
      try {
        const response = await getForm(option.formId)
        const data = response && response.data !== undefined ? response.data : response
        this.childFieldOptions = parseFields(data && data.fields)
      } catch (e) {
        this.childFieldOptions = []
        this.loadError = '子流程表单字段加载失败，变量可手工填写'
        // eslint-disable-next-line no-console
        console.error('[BPM] 加载子流程表单字段失败', e)
      }
    },
    showChildProcessNodeConfig(node) {
      this.draft = this.createDraft(node || this.flowNode)
      this.loadChildFields()
    },
    openDrawer() { this.visible = true },
    handleCalledProcessChange(key) {
      const option = this.childProcessOptions.find((item) => String(item.key) === String(key))
      if (option) this.draft.calledProcessDefinitionName = option.name || key
      this.draft.inVariables = []
      this.draft.outVariables = []
      this.loadChildFields()
    },
    addVariable(list) { list.push({ source: '', target: '' }) },
    removeVariable(list, index) { list.splice(index, 1) },
    startUserTypeChanged(type) { if (Number(type) !== ChildProcessStartUserTypeEnum.FROM_FORM) this.draft.startUserSetting.formField = '' },
    timeoutEnabledChanged(enabled) { if (enabled && !this.draft.timeoutSetting.type) this.draft.timeoutSetting.type = DelayTypeEnum.FIXED_TIME_DURATION },
    timeoutTypeChanged(type) {
      if (Number(type) === DelayTypeEnum.FIXED_TIME_DURATION && !this.draft.timeoutDuration) this.draft.timeoutDuration = 1
      if (Number(type) === DelayTypeEnum.FIXED_DATE_TIME && !this.draft.timeoutDateTime) this.draft.timeoutDateTime = ''
    },
    multiEnabledChanged(enabled) { if (enabled && !this.draft.multiInstanceSetting.source) this.draft.multiInstanceSetting.source = '1' },
    multiSourceChanged() { this.draft.multiInstanceSetting.source = Number(this.draft.multiInstanceSetting.sourceType) === ChildProcessMultiInstanceSourceTypeEnum.FIXED_QUANTITY ? '1' : '' },
    validateDraft() {
      if (!String(this.draft.name || '').trim()) return '节点名称不能为空'
      if (!String(this.draft.calledProcessDefinitionKey || '').trim()) return '请选择或填写子流程标识'
      if (!String(this.draft.calledProcessDefinitionName || '').trim()) return '子流程名称不能为空'
      const vars = (this.draft.inVariables || []).concat(this.draft.async ? [] : (this.draft.outVariables || []))
      if (vars.some((item) => !String(item.source || '').trim() || !String(item.target || '').trim())) return '变量传递的来源和目标不能为空'
      const start = this.draft.startUserSetting
      if (!start.type || !start.emptyType) return '请完善子流程发起人配置'
      if (Number(start.type) === ChildProcessStartUserTypeEnum.FROM_FORM && !String(start.formField || '').trim()) return '请选择子流程发起人字段'
      if (this.draft.timeoutSetting.enable) {
        if (!this.draft.timeoutSetting.type) return '请选择超时时间类型'
        if (Number(this.draft.timeoutSetting.type) === DelayTypeEnum.FIXED_TIME_DURATION && Number(this.draft.timeoutDuration) <= 0) return '超时时长必须大于 0'
        if (Number(this.draft.timeoutSetting.type) === DelayTypeEnum.FIXED_DATE_TIME && !String(this.draft.timeoutDateTime || '').trim()) return '请选择超时日期时间'
      }
      if (this.draft.multiInstanceSetting.enable) {
        const multi = this.draft.multiInstanceSetting
        if (Number(multi.approveRatio) < 10 || Number(multi.approveRatio) > 100) return '完成比例需在 10～100'
        if (!multi.sourceType || !String(multi.source || '').trim() || (Number(multi.sourceType) === ChildProcessMultiInstanceSourceTypeEnum.FIXED_QUANTITY && Number(multi.source) <= 0)) return '请完善多实例来源'
      }
      return ''
    },
    saveConfig() {
      const error = this.validateDraft()
      if (error) { this.$message.warning(error); return false }
      const setting = {
        calledProcessDefinitionKey: String(this.draft.calledProcessDefinitionKey).trim(),
        calledProcessDefinitionName: String(this.draft.calledProcessDefinitionName).trim(),
        async: !!this.draft.async,
        inVariables: clone(this.draft.inVariables),
        outVariables: this.draft.async ? [] : clone(this.draft.outVariables),
        skipStartUserNode: !!this.draft.skipStartUserNode,
        startUserSetting: {
          type: Number(this.draft.startUserSetting.type),
          formField: Number(this.draft.startUserSetting.type) === ChildProcessStartUserTypeEnum.FROM_FORM ? this.draft.startUserSetting.formField : undefined,
          emptyType: Number(this.draft.startUserSetting.emptyType)
        },
        timeoutSetting: {
          enable: !!this.draft.timeoutSetting.enable,
          type: Number(this.draft.timeoutSetting.type) || DelayTypeEnum.FIXED_TIME_DURATION,
          timeExpression: this.draft.timeoutSetting.enable
            ? (Number(this.draft.timeoutSetting.type) === DelayTypeEnum.FIXED_DATE_TIME ? normalizeDateTime(this.draft.timeoutDateTime) : durationToIso(this.draft.timeoutDuration, this.draft.timeoutUnit))
            : ''
        },
        multiInstanceSetting: {
          enable: !!this.draft.multiInstanceSetting.enable,
          sequential: !!this.draft.multiInstanceSetting.sequential,
          approveRatio: Number(this.draft.multiInstanceSetting.approveRatio) || 100,
          sourceType: Number(this.draft.multiInstanceSetting.sourceType) || ChildProcessMultiInstanceSourceTypeEnum.FIXED_QUANTITY,
          source: String(this.draft.multiInstanceSetting.source || '1')
        }
      }
      this.$set(this.flowNode, 'name', String(this.draft.name).trim())
      this.$set(this.flowNode, 'childProcessSetting', setting)
      this.$set(this.flowNode, 'showText', `调用子流程：${setting.calledProcessDefinitionName}`)
      this.visible = false
      return true
    },
    cancelConfig() { this.visible = false },
    async handleBeforeClose(done) { if (this.saveConfig()) done() }
  }
}
</script>

<style scoped>
.child-config { padding: 0 20px 70px; }
.setting-card { margin-bottom: 14px; }
.variable-title { margin: 4px 0 8px; font-weight: 600; color: #606266; }
.out-title { margin-top: 16px; }
.variable-row { display: flex; align-items: center; margin-bottom: 8px; }
.variable-row .el-select { flex: 1; min-width: 0; }
.arrow { margin: 0 8px; color: #909399; }
.unit-select { width: 110px; margin-left: 8px; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; text-align: right; background: #fff; border-top: 1px solid #ebeef5; }
</style>
