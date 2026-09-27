<template>
  <div class="panel-tab__content">
    <el-form
      size="mini"
      label-width="90px"
      :model="model"
      :rules="rules"
      @submit.native.prevent
    >
      <div v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <!-- 如果是 Process 信息的时候，使用自定义表单 -->
        <el-link
          href="https://doc.iocoder.cn/bpm/#_3-%E6%B5%81%E7%A8%8B%E5%9B%BE%E7%A4%BA%E4%BE%8B"
          type="danger"
          target="_blank"
          >如何实现实现会签、或签？</el-link
        >
        <el-form-item label="流程标识" prop="key">
          <el-input
            v-model="model.key"
            placeholder="请输入流标标识"
            :disabled="model.id !== undefined && model.id.length > 0"
            @change="handleKeyUpdate"
          />
        </el-form-item>
        <el-form-item label="流程名称" prop="name">
          <el-input
            v-model="model.name"
            placeholder="请输入流程名称"
            clearable
            @change="handleNameUpdate"
          />
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="ID">
          <el-input
            v-model="elementBaseInfo.id"
            clearable
            @change="updateBaseInfo('id')"
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="elementBaseInfo.name"
            clearable
            @change="updateBaseInfo('name')"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>

export default {
  name: "ElementBaseInfo",
  props: {
    businessObject: Object,
    model: Object, // 流程模型的数据
  },
  data () {
    return {
      elementBaseInfo: {},
      // 流程表单的下拉框的数据
      forms: [],
      // 流程模型的校验
      rules: {
        key: [{ required: true, message: "流程标识不能为空", trigger: "blur" }],
        name: [{ required: true, message: "流程名称不能为空", trigger: "blur" }],
      },
      baseInfoTimer: null,
    }
  },
  watch: {
    businessObject: {
      // The properties panel mounts after the first selection has already
      // been resolved.  Without an immediate pass the initial task's ID and
      // name stay blank until the element changes a second time.
      immediate: true,
      handler: function (val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo(val))
        }
      }
    },
    // Vue3 watches the uploaded model's key immediately.  Keep both key and
    // name in sync here as well, while guarding against this panel being
    // mounted for a task/event rather than the root process.
    'model.key': {
      immediate: true,
      handler () {
        this.syncRootModel()
      }
    },
    'model.name': {
      immediate: true,
      handler () {
        this.syncRootModel()
      }
    }
  },
  created () {
    // 针对上传的 bpmn 流程图时，需要延迟 1 秒的时间，保证 key 和 name 的更新
    this.baseInfoTimer = setTimeout(() => {
      // The delayed pass covers uploaded BPMN where `model` arrives after the
      // panel is mounted; the equality checks in syncRootModel avoid adding a
      // duplicate command when the immediate watchers already handled it.
      this.syncRootModel()
    }, 1000)
  },
  methods: {
    isRootProcessElement () {
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null
      const selected = this.businessObject ||
        (instances && instances.bpmnElement && instances.bpmnElement.businessObject) ||
        (this.bpmnElement && this.bpmnElement.businessObject)
      const type = selected && selected.$type
      return type === 'bpmn:Process' || type === 'bpmn:Collaboration'
    },
    syncRootModel () {
      if (!this.isRootProcessElement()) return
      const model = this.model || {}
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null
      const selected = this.businessObject ||
        (instances && instances.bpmnElement && instances.bpmnElement.businessObject) ||
        (this.bpmnElement && this.bpmnElement.businessObject)
      if (!selected) return
      if (model.key && String(model.key) !== String(selected.id || '')) {
        this.handleKeyUpdate(model.key)
      }
      if (model.name && model.name !== selected.name) {
        this.handleNameUpdate(model.name)
      }
    },
    resetBaseInfo (businessObject) {
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null
      this.bpmnElement = instances && instances.bpmnElement
      const source = businessObject || (this.bpmnElement && this.bpmnElement.businessObject)
      if (!source) {
        return
      }
      this.elementBaseInfo = JSON.parse(JSON.stringify(source))
    },
    handleKeyUpdate (value) {
      // 校验 value 的值，只有 XML NCName 通过的情况下，才进行赋值。否则，会导致流程图报错，无法绘制的问题
      if (!value) {
        return
      }
      const key = String(value)
      if (!/^[a-zA-Z_][\-_.0-9a-zA-Z$]*$/.test(key)) {
        console.log('key 不满足 XML NCName 规则，所以不进行赋值')
        return
      }
      console.log('key 满足 XML NCName 规则，所以进行赋值')

      // 在 BPMN 的 XML 中，流程标识 key，其实对应的是 id 节点
      this.elementBaseInfo['id'] = key
      this.updateBaseInfo('id')
    },
    handleNameUpdate (value) {
      if (!value) {
        return
      }
      this.elementBaseInfo['name'] = value
      this.updateBaseInfo('name')
    },
    handleDescriptionUpdate (value) {
      // TODO 芋艿：documentation 暂时无法修改，后续在看看
      // this.elementBaseInfo['documentation'] = value;
      // this.updateBaseInfo('documentation');
    },
    updateBaseInfo (key) {
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null
      if (!instances || !instances.modeling) {
        return
      }
      // Resolve the element against the *current* registry.  A designer tab
      // can be destroyed/recreated while this component's delayed callback is
      // still queued; passing the old moddle element to a new command stack
      // produces bpmn-js' "元素不能为空" exception.
      const selected = (instances && instances.bpmnElement) || this.bpmnElement
      let element = selected
      if (instances.elementRegistry && selected && selected.id && typeof instances.elementRegistry.get === 'function') {
        element = instances.elementRegistry.get(selected.id)
      }
      if (!element || !element.businessObject) {
        return
      }
      this.bpmnElement = element
      // 触发 elementBaseInfo 对应的字段
      const attrObj = Object.create(null)
      attrObj[key] = this.elementBaseInfo[key]
      try {
        if (key === "id") {
          instances.modeling.updateProperties(element, {
            id: this.elementBaseInfo[key],
            di: { id: `${this.elementBaseInfo[key]}_di` }
          })
        } else {
          instances.modeling.updateProperties(element, attrObj)
        }
      } catch (error) {
        // Treat a callback racing with modeler teardown as a no-op.  The
        // current editor remains usable and no uncaught console error leaks
        // into browser smoke tests.
        if (!this._isBeingDestroyed && !this._isDestroyed) {
          // eslint-disable-next-line no-console
          console.warn('[bpmn] ignored stale base-info update', error)
        }
      }
    }
  },
  beforeDestroy () {
    if (this.baseInfoTimer) {
      clearTimeout(this.baseInfoTimer)
      this.baseInfoTimer = null
    }
    this.bpmnElement = null
  }
};
</script>
