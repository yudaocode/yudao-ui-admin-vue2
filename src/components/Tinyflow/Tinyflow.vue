<template>
  <div ref="container" :class="['tinyflow', className]" :style="customStyle" />
</template>

<script>
import { Tinyflow as TinyflowNative } from './ui'
import './ui/index.css'

const instances = new WeakMap()

export default {
  name: 'AiTinyflow',
  props: {
    className: {
      type: String,
      default: ''
    },
    customStyle: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Object,
      default: () => ({})
    },
    provider: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    const provider = Object.assign(
      {
        llm: () => [],
        knowledge: () => [],
        internal: () => []
      },
      this.provider || {}
    )
    const instance = new TinyflowNative({
      element: this.$refs.container,
      data: this.data || {},
      provider
    })
    instances.set(this, instance)
    this.$emit('ready')
  },
  beforeDestroy() {
    const instance = instances.get(this)
    if (instance) {
      instance.destroy()
      instances.delete(this)
    }
  },
  methods: {
    getData() {
      const instance = instances.get(this)
      return instance ? instance.getData() : null
    },
    setData(data) {
      const instance = instances.get(this)
      if (instance) instance.setData(data || {})
    }
  }
}
</script>

<style scoped>
.tinyflow {
  width: 100%;
  height: 100%;
}
</style>
