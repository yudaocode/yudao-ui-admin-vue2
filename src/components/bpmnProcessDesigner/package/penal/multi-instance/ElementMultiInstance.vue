<template>
  <div class="panel-tab__content">
    <!-- Flowable exposes the business-level approval mode on UserTask. -->
    <el-form v-if="type === 'UserTask' && supportsApproveMethod" size="mini" label-width="110px" @submit.native.prevent>
      <el-form-item label="多人审批方式">
        <el-radio-group v-model="approveMethod" @change="onApproveMethodChange">
          <div class="flex-col">
            <div v-for="item in approveMethods" :key="item.value" class="approve-method-row">
              <el-radio :label="item.value">{{ item.label }}</el-radio>
              <el-input-number
                v-if="Number(item.value) === ApproveMethodType.APPROVE_BY_RATIO && Number(approveMethod) === ApproveMethodType.APPROVE_BY_RATIO"
                v-model="approveRatio"
                :min="10"
                :max="100"
                :step="10"
                size="small"
                controls-position="right"
                @change="onApproveRatioChange"
              />
              <span
                v-if="Number(item.value) === ApproveMethodType.APPROVE_BY_RATIO && Number(approveMethod) === ApproveMethodType.APPROVE_BY_RATIO"
                class="approve-ratio-suffix"
              >%</span>
            </div>
          </div>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div v-else class="multi-instance-tip">
      {{ supportsApproveMethod ? '除了 UserTask 以外节点的多实例待实现' : '当前 BPMN 方言不支持 Flowable 多人审批方式' }}
    </div>

    <!-- 与 Simple 设计器配置合并，保留以前的代码。业务面板默认隐藏，
         但方法仍支持旧 XML 中的 StandardLoop/异步属性。 -->
    <el-form label-width="90px" style="display: none" @submit.native.prevent>
      <el-form-item label="快捷配置">
        <el-button size="small" @click="changeConfig('依次审批')">依次审批</el-button>
        <el-button size="small" @click="changeConfig('会签')">会签</el-button>
        <el-button size="small" @click="changeConfig('或签')">或签</el-button>
      </el-form-item>
      <el-form-item label="回路特性">
        <el-select v-model="loopCharacteristics" @change="changeLoopCharacteristicsType">
          <el-option label="并行多重事件" value="ParallelMultiInstance" />
          <el-option label="时序多重事件" value="SequentialMultiInstance" />
          <el-option label="循环事件" value="StandardLoop" />
          <el-option label="无" value="Null" />
        </el-select>
      </el-form-item>
      <template v-if="loopCharacteristics === 'ParallelMultiInstance' || loopCharacteristics === 'SequentialMultiInstance'">
        <el-form-item label="循环数量" key="loopCardinality">
          <el-input v-model="loopInstanceForm.loopCardinality" clearable @change="updateLoopCardinality" />
        </el-form-item>
        <el-form-item label="集合" key="collection" v-show="false">
          <el-input v-model="loopInstanceForm.collection" clearable @change="updateLoopBase" />
        </el-form-item>
        <el-form-item label="元素变量" key="elementVariable" style="display: none">
          <el-input v-model="loopInstanceForm.elementVariable" clearable @change="updateLoopBase" />
        </el-form-item>
        <el-form-item label="完成条件" key="completionCondition">
          <el-input v-model="loopInstanceForm.completionCondition" clearable @change="updateLoopCondition" />
        </el-form-item>
        <el-form-item label="异步状态" key="async" style="display: none">
          <el-checkbox v-model="loopInstanceForm.asyncBefore" label="异步前" @change="updateLoopAsync('asyncBefore')" />
          <el-checkbox v-model="loopInstanceForm.asyncAfter" label="异步后" @change="updateLoopAsync('asyncAfter')" />
          <el-checkbox
            v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore"
            v-model="loopInstanceForm.exclusive"
            label="排除"
            @change="updateLoopAsync('exclusive')"
          />
        </el-form-item>
        <el-form-item
          v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore"
          label="重试周期"
          prop="timeCycle"
          key="timeCycle"
        >
          <el-input v-model="loopInstanceForm.timeCycle" clearable @change="updateLoopTimeCycle" />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import { ApproveMethodType, APPROVE_METHODS } from '@/components/SimpleProcessDesignerV2/src/consts'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

export default {
  name: 'ElementMultiInstance',
  props: {
    businessObject: Object,
    type: String,
    id: String
  },
  inject: {
    prefixRef: {
      from: 'prefix',
      default: 'flowable'
    }
  },
  data() {
    return {
      ApproveMethodType,
      approveMethods: APPROVE_METHODS,
      approveMethod: null,
      approveRatio: 100,
      otherExtensions: [],
      // ApproveMethod is a Flowable-only extension.  Keep the visual default
      // for Activiti/Camunda panels, but do not repeatedly try to create an
      // undeclared moddle type on every element refresh.
      approveMethodUnsupported: false,
      // Keep a missing Flowable ApproveMethod extension distinguishable from
      // an explicitly configured sequential approval.  Opening a plain
      // single-instance UserTask must not mutate its BPMN semantics.
      approveMethodConfigured: false,
      loopCharacteristics: '',
      defaultLoopInstanceForm: {
        completionCondition: '',
        loopCardinality: '',
        extensionElements: [],
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
      },
      loopInstanceForm: {},
      bpmnElement: null,
      multiLoopInstance: null
    }
  },
  computed: {
    prefix() {
      const value = this.prefixRef && this.prefixRef.value !== undefined ? this.prefixRef.value : this.prefixRef
      return value || 'flowable'
    },
    supportsApproveMethod() {
      return this.prefix === 'flowable'
    }
  },
  watch: {
    businessObject: {
      immediate: true,
      handler(value) {
        this.syncBpmnElement()
        this.getElementLoop(value || {})
        this.getElementLoopNew()
      }
    },
    id: {
      immediate: true,
      handler(value) {
        if (!value) return
        this.$nextTick(() => {
          this.syncBpmnElement()
          this.getElementLoop(this.businessObject || {})
          this.getElementLoopNew()
        })
      }
    }
  },
  methods: {
    getBpmnInstances() {
      return typeof window !== 'undefined' && window.bpmnInstances ? window.bpmnInstances : null
    },
    syncBpmnElement() {
      const instances = this.getBpmnInstances()
      if (!instances) return null
      let element = instances.bpmnElement
      if (this.id && element && element.id !== this.id && instances.elementRegistry && instances.elementRegistry.get) {
        element = instances.elementRegistry.get(this.id)
      }
      if (!element && this.id && instances.elementRegistry && instances.elementRegistry.get) {
        element = instances.elementRegistry.get(this.id)
      }
      if (element) this.bpmnElement = element
      return this.bpmnElement
    },
    moddleCreate(type, properties) {
      const instances = this.getBpmnInstances()
      return instances && instances.moddle ? instances.moddle.create(type, properties) : null
    },
    updateProperties(properties) {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.modeling || !this.bpmnElement) return false
      instances.modeling.updateProperties(this.bpmnElement, properties)
      return true
    },
    updateModdleProperties(target, properties) {
      const instances = this.getBpmnInstances()
      if (!instances || !instances.modeling || !this.bpmnElement || !target) return false
      instances.modeling.updateModdleProperties(this.bpmnElement, target, properties)
      return true
    },
    getElementLoop(businessObject) {
      const loop = businessObject && businessObject.loopCharacteristics
      if (!loop) {
        this.loopCharacteristics = 'Null'
        this.loopInstanceForm = {}
        this.multiLoopInstance = null
        return
      }
      if (loop.$type === 'bpmn:StandardLoopCharacteristics') {
        this.loopCharacteristics = 'StandardLoop'
        this.loopInstanceForm = {}
        this.multiLoopInstance = null
        return
      }
      this.loopCharacteristics = loop.isSequential ? 'SequentialMultiInstance' : 'ParallelMultiInstance'
      this.loopInstanceForm = {
        ...this.defaultLoopInstanceForm,
        ...loop,
        completionCondition: loop.completionCondition && loop.completionCondition.body || '',
        loopCardinality: loop.loopCardinality && loop.loopCardinality.body || ''
      }
      const instances = this.getBpmnInstances()
      this.multiLoopInstance = instances && instances.bpmnElement && instances.bpmnElement.businessObject
        ? instances.bpmnElement.businessObject.loopCharacteristics
        : loop
      const values = loop.extensionElements && loop.extensionElements.values
      if (values && values.length) this.$set(this.loopInstanceForm, 'timeCycle', values[0].body)
    },
    changeLoopCharacteristicsType(type) {
      if (!this.bpmnElement) this.syncBpmnElement()
      if (!this.bpmnElement) return
      if (type === 'Null') {
        this.updateProperties({ loopCharacteristics: null })
        this.multiLoopInstance = null
        return
      }
      if (type === 'StandardLoop') {
        const standard = this.moddleCreate('bpmn:StandardLoopCharacteristics')
        if (standard) this.updateProperties({ loopCharacteristics: standard })
        this.multiLoopInstance = null
        return
      }
      this.multiLoopInstance = type === 'SequentialMultiInstance'
        ? this.moddleCreate('bpmn:MultiInstanceLoopCharacteristics', { isSequential: true, collection: '${coll_userList}' })
        : this.moddleCreate('bpmn:MultiInstanceLoopCharacteristics', { collection: '${coll_userList}' })
      if (this.multiLoopInstance) this.updateProperties({ loopCharacteristics: this.multiLoopInstance })
    },
    updateLoopCardinality(cardinality) {
      const value = cardinality ? this.moddleCreate('bpmn:FormalExpression', { body: cardinality }) : null
      this.updateModdleProperties(this.multiLoopInstance, { loopCardinality: value })
    },
    updateLoopCondition(condition) {
      const value = condition ? this.moddleCreate('bpmn:FormalExpression', { body: condition }) : null
      this.updateModdleProperties(this.multiLoopInstance, { completionCondition: value })
    },
    updateLoopTimeCycle(timeCycle) {
      const retry = this.moddleCreate(`${this.prefix}:FailedJobRetryTimeCycle`, { body: timeCycle })
      const extensionElements = retry ? this.moddleCreate('bpmn:ExtensionElements', { values: [retry] }) : null
      this.updateModdleProperties(this.multiLoopInstance, { extensionElements })
    },
    updateLoopBase() {
      this.updateModdleProperties(this.multiLoopInstance, {
        collection: this.loopInstanceForm.collection || null,
        elementVariable: this.loopInstanceForm.elementVariable || null
      })
    },
    updateLoopAsync(key) {
      const asyncBefore = !!this.loopInstanceForm.asyncBefore
      const asyncAfter = !!this.loopInstanceForm.asyncAfter
      let attrs = {}
      if (!asyncBefore && !asyncAfter) {
        this.$set(this.loopInstanceForm, 'exclusive', false)
        attrs = { asyncBefore: false, asyncAfter: false, exclusive: false, extensionElements: null }
      } else {
        attrs[key] = this.loopInstanceForm[key]
      }
      this.updateModdleProperties(this.multiLoopInstance, attrs)
    },
    changeConfig(config) {
      if (config === '依次审批') {
        this.changeLoopCharacteristicsType('SequentialMultiInstance')
        this.updateLoopCardinality('1')
        this.updateLoopCondition('${ nrOfCompletedInstances >= nrOfInstances }')
      } else if (config === '会签') {
        this.changeLoopCharacteristicsType('ParallelMultiInstance')
        this.updateLoopCondition('${ nrOfCompletedInstances >= nrOfInstances }')
      } else if (config === '或签') {
        this.changeLoopCharacteristicsType('ParallelMultiInstance')
        this.updateLoopCondition('${ nrOfCompletedInstances > 0 }')
      }
    },
    getElementLoopNew() {
      if (this.type !== 'UserTask') return
      const element = this.bpmnElement || this.syncBpmnElement()
      const instances = this.getBpmnInstances()
      if (!element || !instances || !instances.moddle) return
      const values = asArray(element.businessObject && element.businessObject.extensionElements && element.businessObject.extensionElements.values)
      const approve = values.find(item => item && item.$type === `${this.prefix}:ApproveMethod`)
      this.approveMethodConfigured = !!approve
      this.otherExtensions = values.filter(item => !item || item.$type !== `${this.prefix}:ApproveMethod`)
      this.approveMethodUnsupported = !this.supportsApproveMethod
      const ratio = this.readApproveRatio(element.businessObject && element.businessObject.loopCharacteristics)
      this.approveRatio = ratio || 100
      if (approve && approve.value !== undefined) {
        this.approveMethod = Number(approve.value)
      } else {
        // Infer a display value from an already-existing loop, but never
        // create a loop or extension merely because the properties panel was
        // opened.  A plain UserTask remains a plain UserTask until the user
        // explicitly selects an approval mode.
        this.approveMethod = this.inferApproveMethod(element.businessObject && element.businessObject.loopCharacteristics)
      }
    },
    inferApproveMethod(loop) {
      if (!loop) return null
      if (loop.isSequential) return ApproveMethodType.SEQUENTIAL_APPROVE
      const body = loop.completionCondition && loop.completionCondition.body
      if (body && /nrOfCompletedInstances\s*>\s*0/.test(String(body))) return ApproveMethodType.ANY_APPROVE
      if (body && /nrOfCompletedInstances\s*\/\s*nrOfInstances\s*>=/.test(String(body))) return ApproveMethodType.APPROVE_BY_RATIO
      return ApproveMethodType.ANY_APPROVE
    },
    readApproveRatio(loop) {
      const body = loop && loop.completionCondition && loop.completionCondition.body
      if (!body) return null
      const match = String(body).match(/nrOfCompletedInstances\s*\/\s*nrOfInstances\s*>=\s*([0-9.]+)/)
      if (!match) return null
      const ratio = Math.round(Number(match[1]) * 100)
      return ratio >= 10 && ratio <= 100 ? ratio : null
    },
    onApproveMethodChange() {
      this.approveMethodConfigured = true
      this.approveRatio = 100
      this.updateLoopCharacteristics()
    },
    onApproveRatioChange() {
      this.updateLoopCharacteristics()
    },
    updateLoopCharacteristics() {
      const element = this.bpmnElement || this.syncBpmnElement()
      const instances = this.getBpmnInstances()
      if (!element || !instances || !instances.moddle || !instances.modeling || !this.approveMethod) return
      const method = Number(this.approveMethod)
      let loop = null
      if (method === ApproveMethodType.RANDOM_SELECT_ONE_APPROVE) {
        instances.modeling.updateProperties(element, { loopCharacteristics: null })
        this.multiLoopInstance = null
      } else if (method === ApproveMethodType.APPROVE_BY_RATIO) {
        loop = instances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
          isSequential: false,
          collection: '${coll_userList}'
        })
        loop.completionCondition = instances.moddle.create('bpmn:FormalExpression', {
          body: '${ nrOfCompletedInstances/nrOfInstances >= ' + (Number(this.approveRatio) || 100) / 100 + '}'
        })
      } else if (method === ApproveMethodType.ANY_APPROVE) {
        loop = instances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
          isSequential: false,
          collection: '${coll_userList}'
        })
        loop.completionCondition = instances.moddle.create('bpmn:FormalExpression', {
          body: '${ nrOfCompletedInstances > 0 }'
        })
      } else {
        loop = instances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
          isSequential: true,
          collection: '${coll_userList}'
        })
        loop.loopCardinality = instances.moddle.create('bpmn:FormalExpression', { body: '1' })
        loop.completionCondition = instances.moddle.create('bpmn:FormalExpression', {
          body: '${ nrOfCompletedInstances >= nrOfInstances }'
        })
      }
      if (loop) {
        this.multiLoopInstance = loop
        instances.modeling.updateProperties(element, { loopCharacteristics: loop })
      }
      if (this.approveMethodUnsupported) return
      try {
        const extensionValues = this.otherExtensions.concat([
          instances.moddle.create(`${this.prefix}:ApproveMethod`, { value: method })
        ])
        const extensions = instances.moddle.create('bpmn:ExtensionElements', { values: extensionValues })
        instances.modeling.updateProperties(element, { extensionElements: extensions })
      } catch (error) {
        // Older Activiti/Camunda descriptors do not declare this Flowable
        // extension; keep the BPMN loop update usable in those deployments.
        // eslint-disable-next-line no-console
        console.warn('[bpmn] ApproveMethod extension is unavailable for prefix ' + this.prefix, error)
        this.approveMethodUnsupported = true
      }
    }
  },
  beforeDestroy() {
    this.multiLoopInstance = null
    this.bpmnElement = null
  }
}
</script>

<style scoped>
.approve-method-row {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.approve-ratio-suffix {
  margin-left: 4px;
}

.multi-instance-tip {
  color: #909399;
  font-size: 12px;
  padding: 8px 0;
}
</style>
