<template>
  <el-form ref="listenerForm" :model="value" label-position="top" size="small">
    <div v-for="listener in listeners" :key="listener.type" class="task-listener">
      <el-divider content-position="left">{{ listener.name }}</el-divider>
      <el-switch
        v-model="value[listener.enableKey]"
        active-text="开启"
        inactive-text="关闭"
      />
      <template v-if="value[listener.enableKey]">
        <el-alert
          title="仅支持 POST 请求，以请求体方式接收参数"
          type="warning"
          show-icon
          :closable="false"
          class="listener-alert"
        />
        <el-form-item
          label="请求地址"
          :prop="listener.pathKey"
          :rules="pathRules"
        >
          <el-input v-model="value[listener.pathKey]" placeholder="https://example.com/listener" />
        </el-form-item>
        <HttpRequestParamSetting
          :header="value[listener.configKey].header"
          :body="value[listener.configKey].body"
          :form-fields="formFields"
        />
      </template>
    </div>
  </el-form>
</template>

<script>
import HttpRequestParamSetting from './HttpRequestParamSetting.vue'

const LISTENERS = [
  { name: '创建任务', type: 'Create', enableKey: 'taskCreateListenerEnable', pathKey: 'taskCreateListenerPath', configKey: 'taskCreateListener' },
  { name: '指派任务执行人员', type: 'Assign', enableKey: 'taskAssignListenerEnable', pathKey: 'taskAssignListenerPath', configKey: 'taskAssignListener' },
  { name: '完成任务', type: 'Complete', enableKey: 'taskCompleteListenerEnable', pathKey: 'taskCompleteListenerPath', configKey: 'taskCompleteListener' }
]

export default {
  name: 'UserTaskListener',
  components: { HttpRequestParamSetting },
  props: {
    value: {
      type: Object,
      required: true
    },
    formFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listeners: LISTENERS,
      pathRules: [{ required: true, message: '请求地址不能为空', trigger: 'blur' }]
    }
  },
  created() {
    this.ensureShape()
  },
  methods: {
    ensureShape() {
      LISTENERS.forEach((listener) => {
        if (this.value[listener.enableKey] === undefined || this.value[listener.enableKey] === null) {
          this.$set(this.value, listener.enableKey, false)
        }
        if (this.value[listener.pathKey] === undefined || this.value[listener.pathKey] === null) {
          this.$set(this.value, listener.pathKey, '')
        }
        if (!this.value[listener.configKey] || typeof this.value[listener.configKey] !== 'object') {
          this.$set(this.value, listener.configKey, { header: [], body: [] })
        }
        if (!Array.isArray(this.value[listener.configKey].header)) {
          this.$set(this.value[listener.configKey], 'header', [])
        }
        if (!Array.isArray(this.value[listener.configKey].body)) {
          this.$set(this.value[listener.configKey], 'body', [])
        }
      })
    },
    async validate() {
      this.ensureShape()
      const formValid = await new Promise((resolve) => {
        if (!this.$refs.listenerForm) return resolve(true)
        this.$refs.listenerForm.validate(resolve)
      })
      if (!formValid) return false
      for (const listener of LISTENERS) {
        if (!this.value[listener.enableKey]) continue
        const setting = this.value[listener.configKey]
        if (!String(this.value[listener.pathKey] || '').trim()) return false
        for (const group of ['header', 'body']) {
          for (const item of setting[group] || []) {
            if (!item || !String(item.key || '').trim() || !String(item.value || '').trim()) return false
            if (![1, 2].includes(Number(item.type))) return false
          }
        }
      }
      return true
    }
  }
}
</script>

<style scoped>
.task-listener {
  margin-bottom: 16px;
}

.listener-alert {
  margin: 10px 0;
}
</style>
