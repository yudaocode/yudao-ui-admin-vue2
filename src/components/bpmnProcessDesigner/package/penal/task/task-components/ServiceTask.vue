<template>
  <div class="service-task-config">
    <el-form-item label="执行类型" prop="executeType">
      <el-select v-model="serviceTaskForm.executeType" style="width: 100%" @change="handleExecuteTypeChange">
        <el-option label="Java 类" value="class" />
        <el-option label="表达式" value="expression" />
        <el-option label="代理表达式" value="delegateExpression" />
        <el-option label="HTTP 调用" value="http" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="serviceTaskForm.executeType === 'class'" label="Java 类" prop="class">
      <el-input v-model="serviceTaskForm.class" clearable @change="updateElementTask" />
    </el-form-item>
    <el-form-item v-if="serviceTaskForm.executeType === 'expression'" label="表达式" prop="expression">
      <el-input v-model="serviceTaskForm.expression" clearable @change="updateElementTask" />
    </el-form-item>
    <el-form-item v-if="serviceTaskForm.executeType === 'delegateExpression'" label="代理表达式" prop="delegateExpression">
      <el-input v-model="serviceTaskForm.delegateExpression" clearable @change="updateElementTask" />
    </el-form-item>

    <template v-if="serviceTaskForm.executeType === 'http'">
      <el-form-item label="请求方法" prop="requestMethod">
        <el-radio-group v-model="httpTaskForm.requestMethod" @change="updateHttpExtensions">
          <el-radio-button label="GET">GET</el-radio-button>
          <el-radio-button label="POST">POST</el-radio-button>
          <el-radio-button label="PUT">PUT</el-radio-button>
          <el-radio-button label="DELETE">DELETE</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="请求地址" prop="requestUrl">
        <el-input v-model="httpTaskForm.requestUrl" clearable placeholder="请输入请求地址" @change="updateHttpExtensions" />
      </el-form-item>
      <el-form-item label="请求头" prop="requestHeaders">
        <div class="http-header-control">
          <el-input
            v-model="httpTaskForm.requestHeaders"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            readonly
            placeholder="点击右侧编辑按钮添加请求头"
          />
          <el-button type="primary" icon="el-icon-edit" @click="headerEditorVisible = true">编辑</el-button>
        </div>
      </el-form-item>
      <el-form-item label="禁止重定向" prop="disallowRedirects">
        <el-switch v-model="httpTaskForm.disallowRedirects" @change="updateHttpExtensions" />
      </el-form-item>
      <el-form-item label="忽略异常" prop="ignoreException">
        <el-switch v-model="httpTaskForm.ignoreException" @change="updateHttpExtensions" />
      </el-form-item>
      <el-form-item label="保存返回变量" prop="saveResponseParameters">
        <el-switch v-model="httpTaskForm.saveResponseParameters" @change="updateHttpExtensions" />
      </el-form-item>
      <el-form-item label="是否瞬间变量" prop="saveResponseParametersTransient">
        <el-switch v-model="httpTaskForm.saveResponseParametersTransient" @change="updateHttpExtensions" />
      </el-form-item>
      <el-form-item label="返回变量前缀" prop="resultVariablePrefix">
        <el-input v-model="httpTaskForm.resultVariablePrefix" clearable @change="updateHttpExtensions" />
      </el-form-item>
      <el-form-item label="保存为 JSON 变量" label-width="120px" prop="saveResponseVariableAsJson">
        <el-switch v-model="httpTaskForm.saveResponseVariableAsJson" @change="updateHttpExtensions" />
      </el-form-item>
    </template>

    <http-header-editor
      :visible.sync="headerEditorVisible"
      :headers="httpTaskForm.requestHeaders"
      @save="handleHeadersSave"
    />
  </div>
</template>

<script>
import { updateElementExtensions } from '../../../utils'
import HttpHeaderEditor from './HttpHeaderEditor'

const HTTP_FIELD_NAMES = [
  'requestMethod',
  'requestUrl',
  'requestHeaders',
  'disallowRedirects',
  'ignoreException',
  'saveResponseParameters',
  'resultVariablePrefix',
  'saveResponseParametersTransient',
  'saveResponseVariableAsJson'
]

const HTTP_BOOLEAN_FIELDS = [
  'disallowRedirects',
  'ignoreException',
  'saveResponseParameters',
  'saveResponseParametersTransient',
  'saveResponseVariableAsJson'
]

const DEFAULT_TASK_FORM = {
  executeType: '',
  class: '',
  expression: '',
  delegateExpression: ''
}

const DEFAULT_HTTP_FORM = {
  requestMethod: 'GET',
  requestUrl: '',
  requestHeaders: 'Content-Type: application/json',
  disallowRedirects: false,
  ignoreException: false,
  saveResponseParameters: false,
  resultVariablePrefix: '',
  saveResponseParametersTransient: false,
  saveResponseVariableAsJson: false
}

export default {
  name: 'ServiceTask',
  components: { HttpHeaderEditor },
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: {
      from: 'prefix',
      default: 'flowable'
    }
  },
  data() {
    return {
      bpmnElement: null,
      serviceTaskForm: { ...DEFAULT_TASK_FORM },
      httpTaskForm: { ...DEFAULT_HTTP_FORM },
      httpInitializing: false,
      headerEditorVisible: false,
      // Retain the representation used by an existing XML field when it is
      // edited. New fields use the Vue3-compatible <flowable:string> form.
      httpFieldRepresentations: {}
    }
  },
  computed: {
    namespacePrefix() {
      const value = this.prefix && this.prefix.value !== undefined ? this.prefix.value : this.prefix
      return String(value || 'flowable')
    },
    flowableTypeKey() {
      return `${this.namespacePrefix}:type`
    },
    flowableFieldType() {
      return `${this.namespacePrefix}:Field`
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        const instances = this.getBpmnInstances()
        this.bpmnElement = instances && instances.bpmnElement
        this.$nextTick(this.resetServiceTaskForm)
      }
    },
    httpTaskForm: {
      deep: true,
      handler() {
        this.updateHttpExtensions()
      }
    }
  },
  methods: {
    getBpmnInstances() {
      return typeof window !== 'undefined' && window.bpmnInstances ? window.bpmnInstances : null
    },
    isExpression(value) {
      return typeof value === 'string' && (/\$\{[^}]+\}/.test(value) || /#\{[^}]+\}/.test(value))
    },
    asBoolean(value) {
      if (typeof value === 'boolean') return value
      if (typeof value === 'number') return value !== 0
      return ['true', '1', 'yes', 'on'].indexOf(String(value).trim().toLowerCase()) !== -1
    },
    readElementAttribute(businessObject, key) {
      if (!businessObject) return undefined
      if (businessObject[key] !== undefined) return businessObject[key]
      if (businessObject.$attrs && businessObject.$attrs[key] !== undefined) return businessObject.$attrs[key]
      // bpmn-moddle exposes a namespaced descriptor property (for example
      // flowable:type) as its local name on parsed business objects. Support
      // both shapes so existing XML and newly-created nodes are detected.
      const localName = String(key).split(':').pop()
      if (localName && businessObject[localName] !== undefined) return businessObject[localName]
      return undefined
    },
    getFieldValue(item) {
      if (!item) return { value: '', representation: 'string' }
      if (item.expression !== undefined && item.expression !== null) {
        return { value: this.toText(item.expression), representation: 'expression' }
      }
      if (item.string !== undefined && item.string !== null) {
        return { value: this.toText(item.string), representation: 'string' }
      }
      if (item.stringValue !== undefined && item.stringValue !== null) {
        return { value: this.toText(item.stringValue), representation: 'stringValue' }
      }
      if (item.value !== undefined && item.value !== null) {
        return { value: this.toText(item.value), representation: 'string' }
      }
      return { value: '', representation: 'string' }
    },
    toText(value) {
      if (value && typeof value === 'object' && value.body !== undefined) return String(value.body || '')
      return value === undefined || value === null ? '' : String(value)
    },
    collectHttpExtensionInfo() {
      const businessObject = this.bpmnElement && this.bpmnElement.businessObject
      const values = businessObject && businessObject.extensionElements && businessObject.extensionElements.values
        ? businessObject.extensionElements.values
        : []
      const httpFields = {}
      const httpFieldTypes = {}
      const otherExtensions = []
      values.forEach((item) => {
        const isField = item && item.$type === this.flowableFieldType && HTTP_FIELD_NAMES.indexOf(item.name) !== -1
        if (!isField) {
          otherExtensions.push(item)
          return
        }
        const parsed = this.getFieldValue(item)
        httpFields[item.name] = parsed.value
        httpFieldTypes[item.name] = parsed.representation
      })
      return { httpFields, httpFieldTypes, otherExtensions }
    },
    resetHttpDefaults() {
      this.httpInitializing = true
      this.httpTaskForm = { ...DEFAULT_HTTP_FORM }
      this.httpFieldRepresentations = {}
      this.$nextTick(() => {
        this.httpInitializing = false
      })
    },
    resetHttpForm() {
      this.httpInitializing = true
      const info = this.collectHttpExtensionInfo()
      const nextForm = { ...DEFAULT_HTTP_FORM }
      const representations = {}
      HTTP_FIELD_NAMES.forEach((name) => {
        if (info.httpFields[name] === undefined) return
        nextForm[name] = HTTP_BOOLEAN_FIELDS.indexOf(name) !== -1
          ? this.asBoolean(info.httpFields[name])
          : info.httpFields[name]
        representations[name] = info.httpFieldTypes[name]
      })
      this.httpTaskForm = nextForm
      this.httpFieldRepresentations = representations
      this.$nextTick(() => {
        this.httpInitializing = false
        this.updateHttpExtensions(true)
      })
    },
    resetServiceTaskForm() {
      this.bpmnElement = this.getBpmnInstances() && this.getBpmnInstances().bpmnElement
      const businessObject = this.bpmnElement && this.bpmnElement.businessObject
      const nextForm = { ...DEFAULT_TASK_FORM }
      if (businessObject) {
        if (businessObject.class) {
          nextForm.class = businessObject.class
          nextForm.executeType = 'class'
        }
        if (businessObject.expression) {
          nextForm.expression = businessObject.expression
          nextForm.executeType = 'expression'
        }
        if (businessObject.delegateExpression) {
          nextForm.delegateExpression = businessObject.delegateExpression
          nextForm.executeType = 'delegateExpression'
        }
        const type = this.readElementAttribute(businessObject, this.flowableTypeKey)
        const info = this.collectHttpExtensionInfo()
        if (String(type || '').toLowerCase() === 'http' || Object.keys(info.httpFields).length > 0) {
          nextForm.executeType = 'http'
        }
      }
      this.serviceTaskForm = nextForm
      if (nextForm.executeType === 'http') this.resetHttpForm()
      else this.resetHttpDefaults()
    },
    shouldPersistField(name, value) {
      if (HTTP_BOOLEAN_FIELDS.indexOf(name) !== -1) return true
      if (name === 'requestMethod') return true
      if (name === 'requestUrl') return !!value
      return value !== undefined && value !== null && String(value) !== ''
    },
    createHttpField(name, value, existingRepresentation) {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.moddle) return null
      const text = HTTP_BOOLEAN_FIELDS.indexOf(name) !== -1
        ? String(!!value)
        : String(value === undefined || value === null ? '' : value)
      if (this.isExpression(text)) {
        return instances.moddle.create(this.flowableFieldType, { name, expression: text })
      }
      // Existing stringValue fields are retained for backward compatibility;
      // fields created by the Vue3 panel use the nested string property.
      if (existingRepresentation === 'stringValue') {
        return instances.moddle.create(this.flowableFieldType, { name, stringValue: text })
      }
      return instances.moddle.create(this.flowableFieldType, { name, string: text })
    },
    updateHttpExtensions(force) {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.moddle || !this.bpmnElement) return
      if (!force && (this.httpInitializing || this.serviceTaskForm.executeType !== 'http')) return
      const info = this.collectHttpExtensionInfo()
      const fields = HTTP_FIELD_NAMES
        .filter((name) => this.shouldPersistField(name, this.httpTaskForm[name]))
        .map((name) => this.createHttpField(
          name,
          this.httpTaskForm[name],
          this.httpFieldRepresentations[name] || info.httpFieldTypes[name]
        ))
        .filter(Boolean)
      const desired = {}
      HTTP_FIELD_NAMES.forEach((name) => {
        if (!this.shouldPersistField(name, this.httpTaskForm[name])) return
        desired[name] = HTTP_BOOLEAN_FIELDS.indexOf(name) !== -1
          ? String(!!this.httpTaskForm[name])
          : String(this.httpTaskForm[name] === undefined || this.httpTaskForm[name] === null ? '' : this.httpTaskForm[name])
      })
      const existingKeys = Object.keys(info.httpFields)
      const same = !force && existingKeys.length === Object.keys(desired).length && existingKeys.every((name) => {
        return Object.prototype.hasOwnProperty.call(desired, name) && String(info.httpFields[name]) === desired[name]
      })
      if (!same) updateElementExtensions(this.bpmnElement, info.otherExtensions.concat(fields))
    },
    removeHttpExtensions() {
      if (!this.bpmnElement) return
      const info = this.collectHttpExtensionInfo()
      if (!Object.keys(info.httpFields).length) return
      const instances = this.getBpmnInstances()
      if (!instances || !instances.modeling) return
      if (!info.otherExtensions.length) {
        instances.modeling.updateProperties(this.bpmnElement, { extensionElements: null })
      } else {
        updateElementExtensions(this.bpmnElement, info.otherExtensions)
      }
    },
    updateElementTask() {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.modeling || !this.bpmnElement) return
      const attrs = {
        class: null,
        expression: null,
        delegateExpression: null,
        [this.flowableTypeKey]: null
      }
      const type = this.serviceTaskForm.executeType
      if (type === 'class' || type === 'expression' || type === 'delegateExpression') {
        attrs[type] = this.serviceTaskForm[type] || null
      } else if (type === 'http') {
        attrs[this.flowableTypeKey] = 'http'
      }
      instances.modeling.updateProperties(this.bpmnElement, attrs)
      if (type === 'http') this.updateHttpExtensions(true)
      else this.removeHttpExtensions()
    },
    handleExecuteTypeChange(value) {
      this.serviceTaskForm.executeType = value
      if (value === 'http') this.resetHttpForm()
      this.updateElementTask()
    },
    handleHeadersSave(headers) {
      this.httpTaskForm.requestHeaders = headers || ''
      this.updateHttpExtensions()
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  }
}
</script>

<style lang="scss" scoped>
.http-header-control {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 8px;

  .el-textarea {
    flex: 1;
    min-width: 0;
  }

  .el-button {
    flex-shrink: 0;
  }
}
</style>
