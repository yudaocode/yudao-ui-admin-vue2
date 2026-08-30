<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    size="700px"
    :before-close="handleBeforeClose"
  >
    <div class="trigger-config">
      <el-form ref="form" :model="draft" label-position="top" size="small">
        <el-form-item label="节点名称">
          <el-input v-model="draft.name" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="触发器类型">
          <el-select v-model="draft.type" style="width: 100%" @change="changeTriggerType">
            <el-option v-for="item in triggerTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <template v-if="isHttpTrigger">
          <HttpRequestSetting
            :setting="draft.httpRequestSetting"
            :response-enable="Number(draft.type) === TriggerTypeEnum.HTTP_REQUEST"
            form-item-prefix="httpRequestSetting"
            :form-fields="formFields"
          />
        </template>

        <template v-if="isFormTrigger">
          <el-alert
            title="每个设置按条件匹配；更新触发器写入 updateFormFields，删除触发器写入 deleteFields。"
            type="info"
            :closable="false"
            show-icon
            class="trigger-help"
          />
          <el-card v-for="(setting, index) in draft.formSettings" :key="`form-setting-${index}`" shadow="never" class="form-setting-card">
            <div slot="header" class="setting-header">
              <span>{{ isFormUpdate ? '修改' : '删除' }}表单设置 {{ index + 1 }}</span>
              <el-button v-if="draft.formSettings.length > 1" type="text" icon="el-icon-delete" @click="removeFormSetting(index)" />
            </div>
            <el-form-item label="启用条件">
              <el-switch v-model="setting.hasCondition" @change="conditionToggle(setting)" />
            </el-form-item>
            <Condition v-if="setting.hasCondition" v-model="setting.condition" />

            <template v-if="isFormUpdate">
              <el-divider content-position="left">修改字段</el-divider>
              <div v-for="(entry, entryIndex) in setting.updateEntries" :key="`entry-${index}-${entryIndex}`" class="update-entry">
                <el-select v-model="entry.key" filterable clearable placeholder="表单字段" @change="entryKeyChanged(setting, entry)">
                  <el-option v-for="field in formFields" :key="field.field" :label="field.title" :value="field.field" />
                </el-select>
                <span class="assign-label">设置为</span>
                <el-input v-model="entry.value" placeholder="固定值或表达式" />
                <el-button type="text" icon="el-icon-delete" title="删除" @click="removeUpdateEntry(setting, entryIndex)" />
              </div>
              <el-button type="text" icon="el-icon-plus" @click="addUpdateEntry(setting)">添加修改字段</el-button>
            </template>
            <template v-else>
              <el-form-item label="删除字段">
                <el-select v-model="setting.deleteFields" multiple filterable clearable placeholder="请选择要删除的字段" style="width: 100%">
                  <el-option v-for="field in formFields" :key="field.field" :label="field.title" :value="field.field" />
                </el-select>
              </el-form-item>
            </template>
          </el-card>
          <el-button type="text" icon="el-icon-plus" @click="addFormSetting">添加设置</el-button>
        </template>
      </el-form>
      <el-alert v-if="loadError" :title="loadError" type="warning" :closable="false" show-icon />
    </div>
    <div class="drawer-footer">
      <el-button @click="cancelConfig">取 消</el-button>
      <el-button type="primary" @click="saveConfig">确 定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { TRIGGER_TYPES, TriggerTypeEnum, ConditionType } from '../consts'
import { clone, conditionGroupsDefault, conditionIsValid, parseFields } from './components/node-config-utils'
import { normalizeTriggerSetting } from './node-config-schema'
import HttpRequestSetting from './components/HttpRequestSetting.vue'
import Condition from './components/Condition.vue'

function emptyHttpSetting() {
  return { url: '', header: [], body: [], response: [] }
}

function emptyFormSetting(isUpdate) {
  return {
    hasCondition: false,
    condition: { conditionType: ConditionType.RULE, conditionExpression: '', conditionGroups: conditionGroupsDefault() },
    updateEntries: isUpdate ? [] : undefined,
    deleteFields: isUpdate ? [] : []
  }
}

export default {
  name: 'TriggerNodeConfig',
  components: { HttpRequestSetting, Condition },
  props: { flowNode: { type: Object, required: true } },
  inject: {
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) }
  },
  data() {
    return {
      visible: false,
      draft: this.createDraft(this.flowNode),
      triggerTypes: TRIGGER_TYPES,
      TriggerTypeEnum,
      ConditionType,
      loadError: ''
    }
  },
  computed: {
    drawerTitle() { return `${this.draft.name || '触发器'}配置` },
    formFields() { return parseFields(this.formFieldsRef && this.formFieldsRef.value) },
    isHttpTrigger() { return Number(this.draft.type) === TriggerTypeEnum.HTTP_REQUEST || Number(this.draft.type) === TriggerTypeEnum.HTTP_CALLBACK },
    isFormTrigger() { return Number(this.draft.type) === TriggerTypeEnum.FORM_UPDATE || Number(this.draft.type) === TriggerTypeEnum.FORM_DELETE },
    isFormUpdate() { return Number(this.draft.type) === TriggerTypeEnum.FORM_UPDATE }
  },
  watch: {
    flowNode: { deep: true, handler(value) { if (!this.visible && value) this.draft = this.createDraft(value) } }
  },
  methods: {
    createDraft(node) {
      // Older simple-model JSON stored HTTP settings at the node root. Read
      // through the same adapter used on save so opening an imported model
      // does not drop its URL/headers before the user makes any change.
      const normalizedNode = normalizeTriggerSetting(clone(node || {})) || {}
      const source = normalizedNode.triggerSetting ? clone(normalizedNode.triggerSetting) : {}
      const type = Number(source.type) || TriggerTypeEnum.HTTP_REQUEST
      const result = {
        name: node && node.name ? node.name : '触发器',
        type,
        httpRequestSetting: source.httpRequestSetting ? clone(source.httpRequestSetting) : emptyHttpSetting(),
        formSettings: []
      }
      if (!Array.isArray(result.httpRequestSetting.header)) result.httpRequestSetting.header = []
      if (!Array.isArray(result.httpRequestSetting.body)) result.httpRequestSetting.body = []
      if (!Array.isArray(result.httpRequestSetting.response)) result.httpRequestSetting.response = []
      const settings = Array.isArray(source.formSettings) ? source.formSettings : []
      result.formSettings = settings.length ? settings.map((item) => this.normalizeFormSetting(item, type === TriggerTypeEnum.FORM_UPDATE)) : [emptyFormSetting(type === TriggerTypeEnum.FORM_UPDATE)]
      return result
    },
    normalizeFormSetting(item, isUpdate) {
      const source = clone(item || {})
      const condition = {
        conditionType: Number(source.conditionType) || ConditionType.RULE,
        conditionExpression: source.conditionExpression || '',
        conditionGroups: source.conditionGroups || conditionGroupsDefault()
      }
      const entries = Object.keys(source.updateFormFields || {}).map((key) => ({ key, value: source.updateFormFields[key] === undefined || source.updateFormFields[key] === null ? '' : String(source.updateFormFields[key]) }))
      return {
        hasCondition: !!source.conditionType,
        condition,
        updateEntries: isUpdate ? entries : undefined,
        deleteFields: Array.isArray(source.deleteFields) ? source.deleteFields.slice() : []
      }
    },
    showTriggerNodeConfig(node) { this.draft = this.createDraft(node || this.flowNode); this.loadError = '' },
    openDrawer() { this.visible = true },
    changeTriggerType(type) {
      const value = Number(type)
      if (value === TriggerTypeEnum.HTTP_REQUEST || value === TriggerTypeEnum.HTTP_CALLBACK) {
        if (!this.draft.httpRequestSetting) this.$set(this.draft, 'httpRequestSetting', emptyHttpSetting())
        this.draft.formSettings = []
      } else {
        this.draft.httpRequestSetting = undefined
        if (!Array.isArray(this.draft.formSettings) || !this.draft.formSettings.length) this.draft.formSettings = [emptyFormSetting(value === TriggerTypeEnum.FORM_UPDATE)]
        this.draft.formSettings.forEach((setting) => {
          if (value === TriggerTypeEnum.FORM_UPDATE && !Array.isArray(setting.updateEntries)) this.$set(setting, 'updateEntries', [])
          if (value === TriggerTypeEnum.FORM_DELETE) this.$set(setting, 'updateEntries', undefined)
        })
      }
    },
    addFormSetting() { this.draft.formSettings.push(emptyFormSetting(this.isFormUpdate)) },
    removeFormSetting(index) { this.draft.formSettings.splice(index, 1) },
    conditionToggle(setting) {
      if (setting.hasCondition && !setting.condition) this.$set(setting, 'condition', { conditionType: ConditionType.RULE, conditionExpression: '', conditionGroups: conditionGroupsDefault() })
    },
    addUpdateEntry(setting) {
      if (!Array.isArray(setting.updateEntries)) this.$set(setting, 'updateEntries', [])
      setting.updateEntries.push({ key: '', value: '' })
    },
    removeUpdateEntry(setting, index) { setting.updateEntries.splice(index, 1) },
    entryKeyChanged(setting, entry) {
      // Avoid duplicate map keys; retain the row so the user can correct it.
      const duplicate = setting.updateEntries.some((item) => item !== entry && item.key && item.key === entry.key)
      if (duplicate) { entry.key = ''; this.$message.warning('同一个表单字段只能配置一次') }
    },
    validateHttp(setting) {
      if (!setting || !String(setting.url || '').trim()) return '请输入请求地址'
      try { const parsed = new URL(setting.url); if (!parsed.protocol || !parsed.host) return '请求地址格式不正确' } catch (e) { return '请求地址格式不正确' }
      for (const group of ['header', 'body']) {
        for (const item of setting[group] || []) {
          if (!item || !String(item.key || '').trim() || !String(item.value || '').trim()) return 'HTTP 参数的名称和值不能为空'
          if (Number(item.type) !== 1 && Number(item.type) !== 2) return 'HTTP 参数值类型不正确'
        }
      }
      for (const item of setting.response || []) if (!item || !String(item.key || '').trim() || !String(item.value || '').trim()) return '返回值映射不能为空'
      return ''
    },
    validateFormSettings() {
      if (!Array.isArray(this.draft.formSettings) || !this.draft.formSettings.length) return '请至少添加一个表单设置'
      for (let index = 0; index < this.draft.formSettings.length; index += 1) {
        const setting = this.draft.formSettings[index]
        if (setting.hasCondition && !conditionIsValid(setting.condition)) return `请完善第 ${index + 1} 个设置的条件`
        if (this.isFormUpdate) {
          if (!Array.isArray(setting.updateEntries) || !setting.updateEntries.length || setting.updateEntries.some((entry) => !String(entry.key || '').trim() || !String(entry.value || '').trim())) return `请完善第 ${index + 1} 个设置的修改字段`
        } else if (!Array.isArray(setting.deleteFields) || !setting.deleteFields.length) return `请至少选择第 ${index + 1} 个设置的删除字段`
      }
      return ''
    },
    saveConfig() {
      let error = ''
      if (!String(this.draft.name || '').trim()) error = '节点名称不能为空'
      if (!error && this.isHttpTrigger) error = this.validateHttp(this.draft.httpRequestSetting)
      if (!error && this.isFormTrigger) error = this.validateFormSettings()
      if (error) { this.$message.warning(error); return false }
      const setting = { type: Number(this.draft.type) }
      if (this.isHttpTrigger) {
        setting.httpRequestSetting = clone(this.draft.httpRequestSetting)
        setting.formSettings = undefined
      } else {
        setting.formSettings = this.draft.formSettings.map((item) => {
          const result = {}
          if (item.hasCondition) {
            result.conditionType = Number(item.condition.conditionType)
            result.conditionExpression = result.conditionType === ConditionType.EXPRESSION ? item.condition.conditionExpression : undefined
            result.conditionGroups = result.conditionType === ConditionType.RULE ? clone(item.condition.conditionGroups) : undefined
          }
          if (this.isFormUpdate) {
            result.updateFormFields = {}
            item.updateEntries.forEach((entry) => { result.updateFormFields[entry.key] = entry.value })
          } else {
            result.deleteFields = item.deleteFields.slice()
          }
          return result
        })
        setting.httpRequestSetting = undefined
      }
      this.$set(this.flowNode, 'name', String(this.draft.name).trim())
      this.$set(this.flowNode, 'triggerSetting', setting)
      this.$set(this.flowNode, 'showText', this.isHttpTrigger ? String(setting.httpRequestSetting.url).trim() : (this.isFormUpdate ? '修改表单数据' : '删除表单数据'))
      this.visible = false
      return true
    },
    cancelConfig() { this.visible = false },
    async handleBeforeClose(done) { if (this.saveConfig()) done() }
  }
}
</script>

<style scoped>
.trigger-config { padding: 0 20px 70px; }
.trigger-help { margin-bottom: 12px; }
.form-setting-card { margin-bottom: 14px; }
.setting-header { display: flex; align-items: center; justify-content: space-between; }
.update-entry { display: flex; align-items: center; margin-bottom: 8px; }
.update-entry .el-select { width: 180px; }
.update-entry .el-input { flex: 1; margin-left: 8px; }
.assign-label { margin-left: 8px; white-space: nowrap; color: #606266; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; text-align: right; background: #fff; border-top: 1px solid #ebeef5; }
</style>
