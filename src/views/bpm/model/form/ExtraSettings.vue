<template>
  <el-form ref="form" :model="modelData" label-width="140px" class="model-step-form">
    <el-form-item label="提交人权限">
      <el-checkbox v-model="modelData.allowCancelRunningProcess">允许撤销审批中的申请</el-checkbox>
    </el-form-item>
    <el-form-item label="审批人权限">
      <el-checkbox v-model="modelData.allowWithdrawTask">允许审批人撤回任务</el-checkbox>
    </el-form-item>
    <el-form-item label="流程编码">
      <el-input v-model="modelData.processIdRule.prefix" placeholder="前缀" style="width: 120px">
        <el-checkbox slot="prepend" v-model="modelData.processIdRule.enable" />
      </el-input>
      <el-select
        v-model="modelData.processIdRule.infix"
        :disabled="!modelData.processIdRule.enable"
        placeholder="中缀"
        style="width: 140px; margin-left: 6px"
      >
        <el-option label="无" value="" />
        <el-option label="精确到日" value="DAY" />
        <el-option label="精确到时" value="HOUR" />
        <el-option label="精确到分" value="MINUTE" />
        <el-option label="精确到秒" value="SECOND" />
      </el-select>
      <el-input
        v-model="modelData.processIdRule.postfix"
        :disabled="!modelData.processIdRule.enable"
        placeholder="后缀"
        style="width: 100px; margin-left: 6px"
      />
      <el-input-number
        v-model="modelData.processIdRule.length"
        :min="5"
        :disabled="!modelData.processIdRule.enable"
        style="width: 120px; margin-left: 6px"
      />
      <div v-if="modelData.processIdRule.enable" class="setting-tip">示例：{{ numberExample }}</div>
    </el-form-item>
    <el-form-item label="自动去重">
      <el-radio-group v-model="modelData.autoApprovalType">
        <el-radio :label="BpmAutoApproveType.NONE">不自动通过</el-radio>
        <el-radio :label="BpmAutoApproveType.APPROVE_ALL">仅审批一次</el-radio>
        <el-radio :label="BpmAutoApproveType.APPROVE_SEQUENTIAL">仅连续节点自动通过</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="标题设置">
      <el-switch v-model="modelData.titleSetting.enable" />
      <el-input
        v-if="modelData.titleSetting.enable"
        v-model="modelData.titleSetting.title"
        type="textarea"
        :rows="2"
        placeholder="可填写固定文本或表单字段占位符"
        style="margin-top: 8px"
      />
    </el-form-item>
    <el-form-item label="摘要设置">
      <el-switch v-model="modelData.summarySetting.enable" />
      <el-select
        v-if="modelData.summarySetting.enable && Number(modelData.formType) === Number(BpmModelFormType.NORMAL)"
        v-model="modelData.summarySetting.summary"
        multiple
        filterable
        placeholder="请选择要展示的表单字段"
        style="width: 100%; margin-top: 8px"
      >
        <el-option
          v-for="field in formFields"
          :key="field.field"
          :label="field.title"
          :value="field.field"
        />
      </el-select>
    </el-form-item>

    <el-alert
      v-if="formFieldsLoadError"
      title="表单字段加载失败，字段映射暂不可用；请检查表单服务后重试"
      type="warning"
      :closable="false"
      show-icon
      class="trigger-setting-alert"
    />
    <el-form-item
      v-for="trigger in triggerDefinitions"
      :key="trigger.settingKey"
      :label="trigger.label"
      class="trigger-setting-item"
    >
      <div class="trigger-setting-toggle">
        <el-switch
          v-model="triggerEnabled[trigger.key]"
          active-text="开启"
          inactive-text="关闭"
          @change="toggleTrigger(trigger, $event)"
        />
        <span class="trigger-setting-hint">{{ trigger.hint }}</span>
      </div>
      <HttpRequestSetting
        v-if="triggerEnabled[trigger.key] && modelData[trigger.settingKey]"
        :setting="modelData[trigger.settingKey]"
        :response-enable="true"
        :form-item-prefix="trigger.settingKey"
        :form-fields="formFields"
      />
    </el-form-item>

    <el-form-item label="打印模板">
      <el-switch
        v-model="modelData.printTemplateSetting.enable"
        @change="handlePrintTemplateEnableChange"
      />
      <el-button
        v-if="modelData.printTemplateSetting.enable"
        type="text"
        icon="el-icon-edit"
        style="margin-left: 12px"
        @click="handleEditPrintTemplate"
      >
        编辑模板
      </el-button>
    </el-form-item>

    <PrintTemplateEditor
      ref="printTemplateEditor"
      :form-fields="formFields"
      @confirm="handlePrintTemplateConfirm"
    />
  </el-form>
</template>

<script>
import { BpmAutoApproveType, BpmModelFormType } from '@/utils/constants'
import { getForm } from '@/api/bpm/form'
import { parseFormFields } from '@/components/FormCreate/src/utils'
import HttpRequestSetting from '@/components/SimpleProcessDesignerV2/src/nodes-config/components/HttpRequestSetting.vue'
import PrintTemplateEditor from './PrintTemplateEditor.vue'
import { DEFAULT_PRINT_TEMPLATE } from './print-template'

function pad(value) {
  return String(value).padStart(2, '0')
}

export default {
  name: 'BpmModelExtraSettings',
  components: {
    HttpRequestSetting,
    PrintTemplateEditor
  },
  // HttpRequestSetting/HttpRequestParamSetting use the same injected raw
  // form-field contract as the Vue3 implementation.  ExtraSettings is a
  // sibling of ProcessDesign, so without a local provider those composables
  // resolve to an empty fallback and every "来自表单" selector is blank.
  provide() {
    return {
      formFields: this.formFieldsRawRef
    }
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      BpmAutoApproveType,
      BpmModelFormType,
      formFields: [],
      formFieldsRawRef: { value: [] },
      formFieldsLoadError: false,
      triggerDefinitions: [
        {
          key: 'processBefore',
          settingKey: 'processBeforeTriggerSetting',
          label: '流程前置通知',
          hint: '流程启动后通知'
        },
        {
          key: 'processAfter',
          settingKey: 'processAfterTriggerSetting',
          label: '流程后置通知',
          hint: '流程结束后通知'
        },
        {
          key: 'taskBefore',
          settingKey: 'taskBeforeTriggerSetting',
          label: '任务前置通知',
          hint: '任务执行时通知'
        },
        {
          key: 'taskAfter',
          settingKey: 'taskAfterTriggerSetting',
          label: '任务后置通知',
          hint: '任务结束后通知'
        }
      ],
      triggerEnabled: {
        processBefore: false,
        processAfter: false,
        taskBefore: false,
        taskAfter: false
      }
    }
  },
  computed: {
    modelData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    numberExample() {
      const rule = this.modelData.processIdRule
      if (!rule || !rule.enable) {
        return ''
      }
      const date = new Date()
      const parts = {
        DAY: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
        HOUR: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}`,
        MINUTE: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`,
        SECOND: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
      }
      const infix = parts[rule.infix] || ''
      return `${rule.prefix || ''}${infix}${rule.postfix || ''}${'1'.padStart((rule.length || 5) - 1, '0')}`
    }
  },
  methods: {
    validate() {
      for (const trigger of this.triggerDefinitions) {
        if (!this.triggerEnabled[trigger.key]) continue
        const setting = this.modelData[trigger.settingKey]
        if (!setting || !String(setting.url || '').trim()) {
          return Promise.reject(new Error(`${trigger.label}的请求地址不能为空`))
        }
        try {
          const parsedUrl = new URL(String(setting.url).trim())
          if (!parsedUrl.protocol || !parsedUrl.host) throw new Error('invalid url')
        } catch (e) {
          return Promise.reject(new Error(`${trigger.label}的请求地址格式不正确`))
        }
        // Match the backend @NotEmpty checks for request parameters before the
        // model request is sent.  Empty optional arrays remain valid.
        for (const group of ['header', 'body']) {
          for (const item of (setting[group] || [])) {
            if (!String(item.key || '').trim() || !String(item.value || '').trim()) {
              return Promise.reject(new Error(`${trigger.label}的${group === 'header' ? '请求头' : '请求体'}参数不完整`))
            }
          }
        }
        for (const item of (setting.response || [])) {
          if (!String(item.key || '').trim() || !String(item.value || '').trim()) {
            return Promise.reject(new Error(`${trigger.label}的返回值映射不完整`))
          }
        }
      }
      return Promise.resolve()
    },
    initData() {
      if (!this.modelData.processIdRule) {
        this.$set(this.modelData, 'processIdRule', { enable: false, prefix: '', infix: '', postfix: '', length: 5 })
      }
      if (!this.modelData.titleSetting) {
        this.$set(this.modelData, 'titleSetting', { enable: false, title: '' })
      }
      if (!this.modelData.summarySetting) {
        this.$set(this.modelData, 'summarySetting', { enable: false, summary: [] })
      }
      if (!this.modelData.printTemplateSetting) {
        this.$set(this.modelData, 'printTemplateSetting', { enable: false, template: '' })
      }
      this.triggerDefinitions.forEach((trigger) => {
        const setting = this.modelData[trigger.settingKey]
        this.$set(this.triggerEnabled, trigger.key, !!setting)
        if (setting) {
          this.ensureTriggerSetting(setting)
        }
      })
      if (this.modelData.printTemplateSetting.enable && !this.modelData.printTemplateSetting.template) {
        this.$set(this.modelData.printTemplateSetting, 'template', this.defaultPrintTemplate())
      }
    },
    async loadFormFields(formId) {
      this.formFields = []
      this.formFieldsRawRef.value = []
      this.formFieldsLoadError = false
      if (!formId || Number(this.modelData.formType) !== Number(BpmModelFormType.NORMAL)) {
        return
      }
      try {
        const response = await getForm(formId)
        const data = response && response.data ? response.data : response
        const result = []
        const rawFields = data && Array.isArray(data.fields) ? data.fields : []
        this.formFieldsRawRef.value = rawFields
        rawFields.forEach((field) => {
          try {
            const rule = typeof field === 'string' ? JSON.parse(field) : field
            if (rule && typeof rule === 'object') {
              parseFormFields(rule, result)
            }
          } catch (e) {
            // Keep optional notification configuration usable if one old rule is malformed.
          }
        })
        this.formFields = result
      } catch (e) {
        this.formFields = []
        this.formFieldsRawRef.value = []
        this.formFieldsLoadError = true
        // Keep the optional editor usable, but do not turn a failed API call
        // into an apparent success. The warning is visible in the drawer and
        // the original error remains available in the browser console.
        // eslint-disable-next-line no-console
        console.error('[BPM] 加载流程表单字段失败', e)
      }
    },
    ensureTriggerSetting(setting) {
      if (!Array.isArray(setting.header)) this.$set(setting, 'header', [])
      if (!Array.isArray(setting.body)) this.$set(setting, 'body', [])
      if (!Array.isArray(setting.response)) this.$set(setting, 'response', [])
    },
    createTriggerSetting() {
      return {
        url: '',
        header: [],
        body: [],
        response: []
      }
    },
    toggleTrigger(trigger, value) {
      if (value) {
        if (!this.modelData[trigger.settingKey]) {
          this.$set(this.modelData, trigger.settingKey, this.createTriggerSetting())
        } else {
          this.ensureTriggerSetting(this.modelData[trigger.settingKey])
        }
      } else {
        this.$set(this.modelData, trigger.settingKey, null)
      }
    },
    defaultPrintTemplate() {
      return DEFAULT_PRINT_TEMPLATE
    },
    handleEditPrintTemplate() {
      if (!this.$refs.printTemplateEditor) return
      this.$refs.printTemplateEditor.open(this.modelData.printTemplateSetting.template)
    },
    handlePrintTemplateConfirm(template) {
      this.$set(this.modelData.printTemplateSetting, 'template', template)
    },
    handlePrintTemplateEnableChange(value) {
      if (value && !String(this.modelData.printTemplateSetting.template || '').trim()) {
        this.$set(this.modelData.printTemplateSetting, 'template', this.defaultPrintTemplate())
      }
    }
  },
  watch: {
    'modelData.formId': {
      immediate: true,
      handler(value) {
        this.loadFormFields(value)
      }
    },
    'modelData.formType'() {
      this.loadFormFields(this.modelData.formId)
    }
  },
  created() {
    this.initData()
  }
}
</script>

<style scoped>
.model-step-form {
  max-width: 820px;
  margin: 20px auto;
}

.setting-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
</style>
