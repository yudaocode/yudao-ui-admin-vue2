<template>
  <div class="call-activity-config">
    <el-form-item v-if="supportsFlowableAttributes" label="实例名称" prop="processInstanceName">
      <el-input v-model="form.processInstanceName" clearable placeholder="请输入实例名称" @change="updateCallActivityAttr('processInstanceName')" />
    </el-form-item>
    <el-form-item label="被调用流程" prop="calledElement">
      <el-select
        v-model="form.calledElement"
        style="width: 100%"
        filterable
        allow-create
        clearable
        default-first-option
        placeholder="请选择或填写流程标识"
        @change="handleChildProcessChange"
      >
        <el-option v-for="item in childProcessOptions" :key="item.key" :value="item.key" :label="item.name || item.key" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="supportsFlowableAttributes" label="调用标识类型" prop="calledElementType">
      <el-select v-model="form.calledElementType" style="width: 100%" @change="updateCallActivityAttr('calledElementType')">
        <el-option label="流程标识（key）" value="key" />
        <el-option label="流程定义 ID" value="id" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="supportsFlowableAttributes" label="继承变量" prop="inheritVariables">
      <el-switch v-model="form.inheritVariables" @change="updateCallActivityAttr('inheritVariables')" />
    </el-form-item>
    <el-form-item v-if="supportsFlowableAttributes" label="继承业务键" prop="inheritBusinessKey">
      <el-switch v-model="form.inheritBusinessKey" @change="updateCallActivityAttr('inheritBusinessKey')" />
    </el-form-item>
    <el-form-item v-if="supportsFlowableAttributes && !form.inheritBusinessKey" label="业务键表达式" prop="businessKey">
      <el-input v-model="form.businessKey" clearable placeholder="请输入业务键表达式" @change="updateCallActivityAttr('businessKey')" />
    </el-form-item>

    <el-divider content-position="left">输入参数</el-divider>
    <el-table :data="inVariables" size="mini" border max-height="240" fit>
      <el-table-column prop="source" label="源" min-width="100" show-overflow-tooltip />
      <el-table-column prop="target" label="目标" min-width="100" show-overflow-tooltip />
      <el-table-column label="操作" width="110">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openVariableForm('in', scope.row, scope.$index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button type="text" size="mini" class="danger-text" @click="removeVariable('in', scope.$index)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="text" size="mini" icon="el-icon-plus" @click="openVariableForm('in', null, -1)">添加参数</el-button>

    <el-divider content-position="left">输出参数</el-divider>
    <el-table :data="outVariables" size="mini" border max-height="240" fit>
      <el-table-column prop="source" label="源" min-width="100" show-overflow-tooltip />
      <el-table-column prop="target" label="目标" min-width="100" show-overflow-tooltip />
      <el-table-column label="操作" width="110">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openVariableForm('out', scope.row, scope.$index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button type="text" size="mini" class="danger-text" @click="removeVariable('out', scope.$index)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="text" size="mini" icon="el-icon-plus" @click="openVariableForm('out', null, -1)">添加参数</el-button>

    <el-dialog
      title="参数配置"
      width="480px"
      append-to-body
      :visible.sync="variableVisible"
      :close-on-click-modal="false"
    >
      <el-form ref="variableForm" :model="variable" :rules="variableRules" label-width="60px">
        <el-form-item label="源" prop="source">
          <el-input v-model="variable.source" clearable placeholder="请输入源变量" />
        </el-form-item>
        <el-form-item label="目标" prop="target">
          <el-input v-model="variable.target" clearable placeholder="请输入目标变量" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="variableVisible = false">取消</el-button>
        <el-button type="primary" @click="saveVariable">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getModelList } from '@/api/bpm/model'

export default {
  name: 'CallActivity',
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
      form: {
        processInstanceName: '',
        calledElement: '',
        inheritVariables: false,
        inheritBusinessKey: false,
        businessKey: '',
        calledElementType: 'key'
      },
      inVariables: [],
      outVariables: [],
      otherExtensions: [],
      childProcessOptions: [],
      childProcessLoadError: '',
      variableVisible: false,
      variableType: 'in',
      editingVariableIndex: -1,
      variable: { source: '', target: '' },
      variableRules: {
        source: [{ required: true, message: '源不能为空', trigger: 'blur' }],
        target: [{ required: true, message: '目标不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    namespacePrefix() {
      const value = this.prefix && this.prefix.value !== undefined ? this.prefix.value : this.prefix
      return String(value || 'flowable')
    },
    inType() {
      return `${this.namespacePrefix}:In`
    },
    outType() {
      return `${this.namespacePrefix}:Out`
    },
    // calledElement is part of BPMN itself, but the additional call-activity
    // attributes used by the Vue3 panel are Flowable extensions. Activiti and
    // Camunda descriptors do not declare them; writing those unknown attrs
    // would produce invalid/unportable BPMN XML.
    supportsFlowableAttributes() {
      return this.namespacePrefix === 'flowable'
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        const instances = this.getBpmnInstances()
        this.bpmnElement = instances && instances.bpmnElement
        this.$nextTick(this.reset)
      }
    }
  },
  created() {
    this.loadChildProcesses()
  },
  methods: {
    getBpmnInstances() {
      return typeof window !== 'undefined' && window.bpmnInstances ? window.bpmnInstances : null
    },
    reset() {
      const instances = this.getBpmnInstances()
      this.bpmnElement = instances && instances.bpmnElement
      const businessObject = this.bpmnElement && this.bpmnElement.businessObject
      if (!businessObject) return
      const defaults = {
        processInstanceName: '',
        calledElement: '',
        inheritVariables: false,
        inheritBusinessKey: false,
        businessKey: '',
        calledElementType: 'key'
      }
      Object.keys(defaults).forEach((key) => {
        if (!this.supportsFlowableAttributes && key !== 'calledElement') return
        const value = businessObject[key]
        this.$set(this.form, key, value !== undefined && value !== null ? value : defaults[key])
      })
      this.inVariables = []
      this.outVariables = []
      this.otherExtensions = []
      const values = businessObject.extensionElements && businessObject.extensionElements.values
        ? businessObject.extensionElements.values
        : []
      values.forEach((item) => {
        if (item && item.$type === this.inType) this.inVariables.push(item)
        else if (item && item.$type === this.outType) this.outVariables.push(item)
        else this.otherExtensions.push(item)
      })
    },
    async loadChildProcesses() {
      try {
        const response = await getModelList()
        const payload = response && response.data !== undefined ? response.data : response
        const data = Array.isArray(payload)
          ? payload
          : payload && (payload.list || payload.records || payload.items)
            ? (payload.list || payload.records || payload.items)
            : []
        this.childProcessOptions = Array.isArray(data)
          ? data.filter((item) => item && item.key).map((item) => ({ key: String(item.key), name: item.name || String(item.key) }))
          : []
        this.childProcessLoadError = ''
      } catch (error) {
        this.childProcessOptions = []
        this.childProcessLoadError = '子流程列表加载失败，可直接填写流程标识'
        // Keep the editor usable when the optional list endpoint is unavailable.
        // eslint-disable-next-line no-console
        console.warn('[bpm] failed to load call-activity process list', error)
      }
    },
    handleChildProcessChange(key) {
      this.updateCallActivityAttr('calledElement')
      const selected = this.childProcessOptions.find((item) => String(item.key) === String(key))
      if (!selected) return
      this.form.processInstanceName = selected.name || selected.key
      this.updateCallActivityAttr('processInstanceName')
    },
    updateCallActivityAttr(attr) {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.modeling || !this.bpmnElement) return
      if (!this.supportsFlowableAttributes && attr !== 'calledElement') return
      instances.modeling.updateProperties(this.bpmnElement, { [attr]: this.form[attr] })
    },
    openVariableForm(type, data, index) {
      this.variableType = type
      this.editingVariableIndex = index
      this.variable = index === -1
        ? { source: '', target: '' }
        : { source: data && data.source ? data.source : '', target: data && data.target ? data.target : '' }
      this.variableVisible = true
      this.$nextTick(() => {
        if (this.$refs.variableForm) this.$refs.variableForm.clearValidate()
      })
    },
    saveVariable() {
      const finish = () => {
        const list = this.variableType === 'in' ? this.inVariables : this.outVariables
        if (this.editingVariableIndex === -1) {
          const instances = this.getBpmnInstances()
          if (!instances || !instances.moddle) return
          const type = this.variableType === 'in' ? this.inType : this.outType
          list.push(instances.moddle.create(type, {
            source: String(this.variable.source || '').trim(),
            target: String(this.variable.target || '').trim()
          }))
        } else if (list[this.editingVariableIndex]) {
          // Keep all Flowable attributes (local, businessKey, sourceExpression,
          // etc.) and update only the two fields exposed by the Vue3 editor.
          list[this.editingVariableIndex].source = String(this.variable.source || '').trim()
          list[this.editingVariableIndex].target = String(this.variable.target || '').trim()
        }
        this.variableVisible = false
        this.updateElementExtensions()
      }
      if (this.$refs.variableForm && this.$refs.variableForm.validate) {
        this.$refs.variableForm.validate((valid) => { if (valid) finish() })
      } else {
        finish()
      }
    },
    removeVariable(type, index) {
      const list = type === 'in' ? this.inVariables : this.outVariables
      const remove = () => {
        list.splice(index, 1)
        this.updateElementExtensions()
      }
      if (this.$confirm) {
        this.$confirm('确认移除该参数？', '提示', { type: 'warning' }).then(remove).catch(() => {})
      } else {
        remove()
      }
    },
    updateElementExtensions() {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.moddle || !instances.modeling || !this.bpmnElement) return
      const values = this.inVariables.concat(this.outVariables, this.otherExtensions)
      if (!values.length) {
        instances.modeling.updateProperties(this.bpmnElement, { extensionElements: null })
        return
      }
      const extensionElements = instances.moddle.create('bpmn:ExtensionElements', { values })
      instances.modeling.updateProperties(this.bpmnElement, { extensionElements })
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  }
}
</script>

<style lang="scss" scoped>
.danger-text {
  color: #f56c6c;
}

.call-activity-config {
  .el-table {
    margin-bottom: 4px;
  }
}
</style>
