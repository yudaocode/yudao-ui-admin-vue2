<!--
  Standalone BPMN editor entry point matching the Vue3 component contract.
  ProcessDesign owns the actual BPMN/Simple designer lifecycle in the Vue2
  application; this adapter supplies the same model props and emits the
  resulting XML/simple-model value to callers.
-->
<template>
  <div class="bpm-model-editor">
    <ProcessDesign
      v-model="modelData"
      @input="handleDesignInput"
      @success="handleDesignSuccess"
      @init-finished="handleInitFinished"
    />
  </div>
</template>

<script>
import ProcessDesign from '../ProcessDesign.vue'
import { BpmModelFormType, BpmModelType } from '@/utils/constants'

function createModelData(value, props) {
  const source = value && typeof value === 'object' ? value : {}
  const result = {
    id: props.modelId,
    key: props.modelKey || '',
    name: props.modelName || '',
    type: BpmModelType.BPMN,
    formType: BpmModelFormType.NORMAL,
    formId: undefined,
    bpmnXml: typeof value === 'string' ? value : undefined,
    simpleModel: undefined,
    ...source
  }
  if (props.modelId !== undefined && props.modelId !== null && result.id === undefined) {
    result.id = props.modelId
  }
  if (!result.key && props.modelKey) result.key = props.modelKey
  if (!result.name && props.modelName) result.name = props.modelName
  return result
}

export default {
  name: 'BpmModelEditor',
  components: { ProcessDesign },
  props: {
    modelId: {
      type: [String, Number],
      default: undefined
    },
    modelKey: {
      type: String,
      default: ''
    },
    modelName: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Object],
      default: undefined
    }
  },
  data() {
    return {
      modelData: createModelData(this.value, this),
      lastEmittedValue: undefined
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        // The child mutates a local model object while editing.  Ignore the
        // echo caused by our own input event, but accept external updates.
        if (value === this.lastEmittedValue) {
          this.lastEmittedValue = undefined
          return
        }
        this.modelData = createModelData(value, this)
      }
    },
    modelKey(value) {
      if (!this.modelData.key) this.$set(this.modelData, 'key', value || '')
    },
    modelName(value) {
      if (!this.modelData.name) this.$set(this.modelData, 'name', value || '')
    }
  },
  methods: {
    handleDesignInput(value) {
      this.modelData = value
      this.lastEmittedValue = value
      this.$emit('input', value)
    },
    handleDesignSuccess(payload) {
      // ProcessDesign emits the canonical serialized payload after the
      // designer's save event.  Forward it unchanged so callers can persist
      // BPMN XML or the simple-model JSON without guessing the active type.
      if (payload !== undefined && payload !== null) this.$emit('success', payload)
    },
    handleInitFinished(modeler) {
      this.$emit('init-finished', modeler)
    },
    getModelData() {
      return this.modelData
    }
  }
}
</script>

<style scoped>
.bpm-model-editor {
  min-height: 600px;
}
</style>
