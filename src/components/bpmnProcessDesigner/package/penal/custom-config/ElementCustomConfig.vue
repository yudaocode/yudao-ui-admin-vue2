<template>
  <div class="panel-tab__content element-custom-config">
    <component v-if="customConfigComponent" :is="customConfigComponent" v-bind="$props" />
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
      this.customConfigComponent = config && (config.component || config.componet) || null
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
