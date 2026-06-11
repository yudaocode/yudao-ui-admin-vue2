<template>
  <SimpleProcessDesigner
    ref="designer"
    v-model="simpleModel"
    :model-name="modelName"
    :model-form-id="modelFormId"
    :model-form-type="modelFormType"
    :start-user-ids="startUserIds"
    :start-dept-ids="startDeptIds"
    @success="handleSuccess"
  />
</template>

<script>
import { SimpleProcessDesigner } from '@/components/SimpleProcessDesignerV2/src'

export default {
  name: 'SimpleModelDesign',
  components: {
    SimpleProcessDesigner
  },
  props: {
    value: {
      type: Object,
      default: undefined
    },
    modelName: {
      type: String,
      default: ''
    },
    modelFormId: {
      type: [Number, String],
      default: undefined
    },
    modelFormType: {
      type: [Number, String],
      default: undefined
    },
    startUserIds: {
      type: Array,
      default: () => []
    },
    startDeptIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      simpleModel: this.value
    }
  },
  watch: {
    value(value) {
      this.simpleModel = value
    },
    simpleModel(value) {
      this.$emit('input', value)
    }
  },
  methods: {
    handleSuccess(data) {
      this.simpleModel = data
      this.$emit('success', data)
    },
    getCurrentFlowData() {
      return this.$refs.designer.getCurrentFlowData()
    }
  }
}
</script>
