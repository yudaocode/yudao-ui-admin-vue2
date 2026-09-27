<template>
  <div class="panel-tab__content element-custom-config">
    <!--
      Element Plus resolves an el-form-item without an ancestor form, while
      Element UI reads the injected form during render. Provide the small form
      context that the custom-config implementations expect; without it merely selecting
      a UserTask/CallActivity produces an `$options` render error.
    -->
    <el-form
      v-if="customConfigComponent"
      :model="businessObject"
      size="mini"
      label-width="90px"
      @submit.native.prevent
    >
      <component :is="customConfigComponent" v-bind="$props" />
    </el-form>
    <div v-else class="empty-custom-config">当前元素暂无自定义配置</div>
  </div>
</template>

<script>
import { CustomConfigMap } from './data'

function eventTypeSuffix(businessObject) {
  const definitions = businessObject && businessObject.eventDefinitions
  const type = definitions && definitions[0] && definitions[0].$type
  if (!type) return ''
  const parts = String(type).split(':')
  return parts[parts.length - 1] || ''
}

export default {
  name: 'ElementCustomConfig',
  props: {
    id: String,
    type: String,
    businessObject: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      customConfigComponent: null
    }
  },
  watch: {
    type: {
      immediate: true,
      handler() {
        this.resolveCustomConfig()
      }
    },
    businessObject: {
      deep: true,
      immediate: true,
      handler() {
        this.resolveCustomConfig()
      }
    }
  },
  methods: {
    resolveCustomConfig() {
      if (!this.type || !this.businessObject) {
        this.customConfigComponent = null
        return
      }
      const key = `${this.type}${eventTypeSuffix(this.businessObject)}`
      const config = CustomConfigMap[key] || CustomConfigMap[this.type]
      this.customConfigComponent = config && config.componet || null
    }
  }
}
</script>

<style scoped>
.empty-custom-config {
  padding: 16px 0;
  color: #909399;
  text-align: center;
}
</style>
