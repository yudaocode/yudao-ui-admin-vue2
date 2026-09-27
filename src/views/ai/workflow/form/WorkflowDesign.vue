<template>
  <div class="workflow-design">
    <Tinyflow
      v-if="workflowData && workflowData.value"
      ref="tinyflow"
      class-name="workflow-canvas"
      :custom-style="{ width: '100%', height: '100%' }"
      :data="workflowData.value"
      :provider="provider"
    />
    <div class="test-entry">
      <el-button
        type="primary"
        v-hasPermi="['ai:workflow:test']"
        @click="testWorkflowModel"
      >
        测试
      </el-button>
    </div>

    <el-drawer
      title="工作流测试"
      :visible.sync="showTestDrawer"
      :modal="false"
      size="460px"
      append-to-body
    >
      <div class="test-drawer">
        <fieldset>
          <legend><h3>运行参数配置</h3></legend>
          <div class="field-content">
            <div v-for="(param, index) in params4Test" :key="index" class="param-row">
              <el-select v-model="param.key" placeholder="参数名" class="param-control">
                <el-option
                  v-for="(definition, key) in paramsOfStartNode"
                  :key="key"
                  :label="definition.description || key"
                  :value="key"
                  :disabled="isParamDisabled(key)"
                />
              </el-select>
              <el-input v-model="param.value" placeholder="参数值" class="param-control" />
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                circle
                @click="removeParam(index)"
              />
            </div>
            <el-button type="primary" plain @click="addParam">添加参数</el-button>
          </div>
        </fieldset>

        <fieldset class="result-fieldset">
          <legend><h3>运行结果</h3></legend>
          <div class="field-content result-panel">
            <span v-if="loading" class="text-primary">执行中...</span>
            <span v-else-if="error" class="text-danger">{{ error }}</span>
            <pre v-else-if="testResult" class="result-content">{{
              JSON.stringify(testResult, null, 2)
            }}</pre>
            <span v-else class="text-info">点击运行查看结果</span>
          </div>
        </fieldset>

        <el-button class="run-button" size="medium" type="success" :loading="loading" @click="goRun">
          运行流程
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Tinyflow from '@/components/Tinyflow/Tinyflow.vue'
import { testWorkflow } from '@/api/ai/workflow'

export default {
  name: 'AiWorkflowDesign',
  components: { Tinyflow },
  inject: {
    workflowData: {
      default: () => ({ value: null })
    }
  },
  props: {
    provider: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showTestDrawer: false,
      params4Test: [],
      paramsOfStartNode: {},
      testResult: null,
      loading: false,
      error: null
    }
  },
  watch: {
    showTestDrawer(value) {
      if (value) this.loadStartNodeParameters()
    }
  },
  methods: {
    testWorkflowModel() {
      this.showTestDrawer = !this.showTestDrawer
    },
    getWorkflowGraph() {
      const graph = this.$refs.tinyflow && this.$refs.tinyflow.getData()
      if (!graph) throw new Error('请设计流程')
      return graph
    },
    getStartNode() {
      const graph = this.getWorkflowGraph()
      const startNode = (graph.nodes || []).find(node => node.type === 'startNode')
      if (!startNode) throw new Error('流程缺少开始节点')
      return startNode
    },
    loadStartNodeParameters() {
      const parameters = (this.getStartNode().data || {}).parameters || []
      const definitions = {}
      parameters.forEach(param => {
        if (param && param.name) definitions[param.name] = param
      })
      Object.keys(definitions).forEach(key => {
        const definition = definitions[key]
        if (definition.required && !this.params4Test.some(item => item.key === key)) {
          this.params4Test.push({ key, value: definition.defaultValue || '' })
        }
      })
      this.paramsOfStartNode = definitions
    },
    isParamDisabled(key) {
      const definition = this.paramsOfStartNode[key]
      return Boolean(definition && definition.disabled)
    },
    addParam() {
      this.params4Test.push({ key: '', value: '' })
    },
    removeParam(index) {
      this.params4Test.splice(index, 1)
    },
    convertParamValue(value, dataType) {
      if (value === '') return null
      switch (dataType) {
        case 'String':
          return String(value)
        case 'Number': {
          const numberValue = Number(value)
          if (Number.isNaN(numberValue)) throw new Error('非数字格式')
          return numberValue
        }
        case 'Boolean':
          if (String(value).toLowerCase() === 'true') return true
          if (String(value).toLowerCase() === 'false') return false
          throw new Error('必须为 true/false')
        case 'Object':
        case 'Array':
          try {
            return JSON.parse(value)
          } catch (error) {
            throw new Error('JSON 格式错误: ' + error.message)
          }
        default:
          throw new Error('不支持的类型: ' + dataType)
      }
    },
    async goRun() {
      this.loading = true
      this.error = null
      this.testResult = null
      try {
        const graph = this.getWorkflowGraph()
        const parameters = (this.getStartNode().data || {}).parameters || []
        const paramDefinitions = {}
        parameters.forEach(param => {
          if (param && param.name) paramDefinitions[param.name] = param.dataType || 'String'
        })
        const convertedParams = {}
        this.params4Test.forEach(({ key, value }) => {
          const paramKey = String(key || '').trim()
          if (!paramKey) return
          try {
            convertedParams[paramKey] = this.convertParamValue(value, paramDefinitions[paramKey] || 'String')
          } catch (error) {
            throw new Error('参数 ' + paramKey + ' 转换失败: ' + error.message)
          }
        })
        const response = await testWorkflow({
          graph: JSON.stringify(graph),
          params: convertedParams
        })
        this.testResult = response.data
      } catch (error) {
        this.error =
          (error.response && error.response.data && error.response.data.message) ||
          '运行失败，请检查参数和网络连接'
      } finally {
        this.loading = false
      }
    },
    validate() {
      try {
        const graph = this.getWorkflowGraph()
        this.workflowData.value = graph
        return Promise.resolve(true)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-design {
  position: relative;
  width: 100%;
  height: 700px;
}

.test-entry {
  position: absolute;
  top: 30px;
  right: 30px;
}

.test-drawer {
  padding: 0 20px 20px;
}

fieldset {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

legend {
  margin-left: 15px;
}

.field-content {
  padding: 20px;
}

.param-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.param-control {
  width: 170px;
}

.result-fieldset {
  margin-top: 20px;
  background: #f8f9fa;
}

.result-panel {
  min-height: 100px;
}

.result-content {
  max-height: 300px;
  padding: 12px;
  overflow: auto;
  font-family: Monaco, Consolas, monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  background: #fff;
  border-radius: 4px;
}

.text-primary {
  color: #409eff;
}

.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #909399;
}

.run-button {
  width: 100%;
  margin-top: 20px;
}
</style>
