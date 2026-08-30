<template>
  <div class="user-task-config">
    <el-form-item label="规则类型" prop="candidateStrategy">
      <el-select
        v-model="form.candidateStrategy"
        clearable
        style="width: 100%"
        @change="changeCandidateStrategy"
      >
        <el-option
          v-for="item in candidateStrategies"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.ROLE)" label="指定角色" prop="candidateParam">
      <el-select v-model="candidateArray" clearable multiple style="width: 100%" @change="updateElementTask">
        <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="isDepartmentStrategy" label="指定部门" prop="candidateParam">
      <treeselect
        v-model="candidateArray"
        :options="deptTreeOptions"
        :multiple="true"
        :flat="true"
        :default-expand-level="3"
        :normalizer="normalizeDept"
        :append-to-body="true"
        placeholder="请选择指定部门"
        @input="updateElementTask"
      />
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.POST)" label="指定岗位" prop="candidateParam">
      <el-select v-model="candidateArray" clearable multiple style="width: 100%" @change="updateElementTask">
        <el-option v-for="item in postOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.USER)" label="指定用户" prop="candidateParam">
      <el-select v-model="candidateArray" clearable filterable multiple style="width: 100%" @change="updateElementTask">
        <el-option v-for="item in userOptions" :key="item.id" :label="item.nickname || item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.USER_GROUP)" label="指定用户组" prop="candidateParam">
      <el-select v-model="candidateArray" clearable multiple style="width: 100%" @change="updateElementTask">
        <el-option v-for="item in userGroupOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.FORM_USER)" label="表单内用户字段" prop="candidateParam">
      <el-select v-model="candidateText" clearable style="width: 100%" @change="handleFormUserChange">
        <el-option
          v-for="item in userFieldOnFormOptions"
          :key="item.field"
          :label="item.title"
          :value="item.field"
          :disabled="!item.required"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.FORM_DEPT_LEADER)" label="表单内部门字段" prop="candidateParam">
      <el-select v-model="candidateText" clearable style="width: 100%" @change="updateElementTask">
        <el-option
          v-for="item in deptFieldOnFormOptions"
          :key="item.field"
          :label="item.title"
          :value="item.field"
          :disabled="!item.required"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="requiresDeptLevel" :label="deptLevelLabel" prop="deptLevel">
      <el-select v-model="deptLevel" clearable style="width: 100%" @change="updateElementTask">
        <el-option v-for="item in multiLevelDept" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="strategyIs(CandidateStrategy.EXPRESSION)" label="流程表达式" prop="candidateParam">
      <el-input v-model="candidateText" type="textarea" clearable @change="updateElementTask" />
      <el-button class="expression-select" type="success" size="mini" @click="openProcessExpressionDialog">
        选择表达式
      </el-button>
      <ProcessExpressionDialog ref="processExpressionDialog" @select="selectProcessExpression" />
    </el-form-item>

    <el-form-item label="跳过表达式" prop="skipExpression">
      <el-input v-model="form.skipExpression" type="textarea" clearable @change="updateSkipExpression" />
    </el-form-item>
  </div>
</template>

<script>
import { CANDIDATE_STRATEGY, CandidateStrategy, MULTI_LEVEL_DEPT } from '@/components/SimpleProcessDesignerV2/src/consts'
import { listSimpleRoles } from '@/api/system/role'
import { listSimplePosts } from '@/api/system/post'
import { listSimpleUsers } from '@/api/system/user'
import { listSimpleDepts } from '@/api/system/dept'
import { getUserGroupSimpleList } from '@/api/bpm/userGroup'
import { parseFields } from '@/components/SimpleProcessDesignerV2/src/nodes-config/components/node-config-utils'
import ProcessExpressionDialog from './ProcessExpressionDialog.vue'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { handleTree } from '@/utils/ruoyi'
import { parseCandidateIdList } from '@/components/SimpleProcessDesignerV2/src/nodes-config/components/node-config-utils'

function unwrap(value) {
  if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) return value.value
  return value
}

function responseData(response) {
  const data = response && response.data !== undefined ? response.data : response
  return Array.isArray(data) ? data : []
}

function idList(value) {
  return parseCandidateIdList(value)
}

export default {
  name: 'UserTask',
  components: { ProcessExpressionDialog, Treeselect },
  props: {
    id: String,
    type: String
  },
  inject: {
    prefixRef: { from: 'prefix', default: 'flowable' },
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) }
  },
  data() {
    return {
      bpmnElement: null,
      otherExtensions: [],
      form: {
        candidateStrategy: undefined,
        candidateParam: [],
        skipExpression: ''
      },
      deptLevel: 1,
      roleOptions: [],
      deptOptions: [],
      deptTreeOptions: [],
      postOptions: [],
      userOptions: [],
      userGroupOptions: [],
      candidateStrategies: CANDIDATE_STRATEGY,
      CandidateStrategy,
      multiLevelDept: MULTI_LEVEL_DEPT,
      loadingOptions: false
    }
  },
  computed: {
    prefix() {
      return unwrap(this.prefixRef) || 'flowable'
    },
    supportsFlowableCandidateExtensions() {
      return this.prefix === 'flowable'
    },
    formFields() {
      return parseFields(unwrap(this.formFieldsRef) || [])
    },
    userFieldOnFormOptions() {
      return this.formFields.filter((item) => item.type === 'UserSelect')
    },
    deptFieldOnFormOptions() {
      return this.formFields.filter((item) => item.type === 'DeptSelect')
    },
    candidateArray: {
      get() {
        return Array.isArray(this.form.candidateParam) ? this.form.candidateParam : []
      },
      set(value) {
        this.$set(this.form, 'candidateParam', Array.isArray(value) ? value : [])
      }
    },
    candidateText: {
      get() {
        return Array.isArray(this.form.candidateParam) ? (this.form.candidateParam[0] || '') : (this.form.candidateParam || '')
      },
      set(value) {
        this.$set(this.form, 'candidateParam', value || '')
      }
    },
    isDepartmentStrategy() {
      return [CandidateStrategy.DEPT_MEMBER, CandidateStrategy.DEPT_LEADER, CandidateStrategy.MULTI_LEVEL_DEPT_LEADER]
        .indexOf(Number(this.form.candidateStrategy)) >= 0
    },
    requiresDeptLevel() {
      return [CandidateStrategy.MULTI_LEVEL_DEPT_LEADER, CandidateStrategy.START_USER_DEPT_LEADER,
        CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER, CandidateStrategy.FORM_DEPT_LEADER]
        .indexOf(Number(this.form.candidateStrategy)) >= 0
    },
    deptLevelLabel() {
      if (Number(this.form.candidateStrategy) === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) return '部门负责人来源（指定部门向上）'
      if (Number(this.form.candidateStrategy) === CandidateStrategy.FORM_DEPT_LEADER) return '部门负责人来源（表单内部门向上）'
      return '部门负责人来源（发起人部门向上）'
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.$nextTick(() => this.resetTaskForm())
      }
    }
  },
  mounted() {
    this.loadOptions()
  },
  methods: {
    strategyIs(strategy) {
      return Number(this.form.candidateStrategy) === Number(strategy)
    },
    async loadOptions() {
      this.loadingOptions = true
      try {
        const responses = await Promise.all([
          listSimpleRoles(),
          listSimpleDepts(),
          listSimplePosts(),
          listSimpleUsers(),
          getUserGroupSimpleList()
        ])
        this.roleOptions = responseData(responses[0])
        this.deptOptions = responseData(responses[1])
        this.deptTreeOptions = handleTree(this.deptOptions, 'id')
        this.postOptions = responseData(responses[2])
        this.userOptions = responseData(responses[3])
        this.userGroupOptions = responseData(responses[4])
      } catch (e) {
        // A missing option endpoint must not make the BPMN panel disappear;
        // existing candidate IDs remain editable through the JSON/XML view.
      } finally {
      this.loadingOptions = false
      }
    },
    normalizeDept(node) {
      if (!node) return {}
      return {
        id: node.id,
        label: node.name,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    resetTaskForm() {
      this.bpmnElement = window.bpmnInstances && window.bpmnInstances.bpmnElement
      const businessObject = this.bpmnElement && this.bpmnElement.businessObject
      if (!businessObject) return

      const values = businessObject.extensionElements && businessObject.extensionElements.values || []
      this.otherExtensions = values.filter((item) => item && item.$type !== `${this.prefix}:CandidateStrategy` && item.$type !== `${this.prefix}:CandidateParam`)
      const strategyElement = values.find((item) => item && item.$type === `${this.prefix}:CandidateStrategy`)
      const paramElement = values.find((item) => item && item.$type === `${this.prefix}:CandidateParam`)
      const directStrategy = businessObject.candidateStrategy
      const strategy = strategyElement && strategyElement.value !== undefined ? strategyElement.value : directStrategy
      this.$set(this.form, 'candidateStrategy', strategy === undefined || strategy === null || strategy === '' ? undefined : Number(strategy))

      const rawParam = paramElement && paramElement.value !== undefined ? paramElement.value : businessObject.candidateParam
      this.parseCandidateParam(rawParam)
      this.form.skipExpression = businessObject.skipExpression || ''
    },
    parseCandidateParam(rawParam) {
      const strategy = Number(this.form.candidateStrategy)
      const value = rawParam === undefined || rawParam === null ? '' : String(rawParam)
      const parts = value.split('|')
      if (!value) {
        this.$set(this.form, 'candidateParam', [])
        this.deptLevel = 1
        return
      }
      if (strategy === CandidateStrategy.EXPRESSION || strategy === CandidateStrategy.FORM_USER || strategy === CandidateStrategy.FORM_DEPT_LEADER) {
        this.$set(this.form, 'candidateParam', strategy === CandidateStrategy.FORM_DEPT_LEADER ? parts[0] : value)
      } else if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) {
        this.$set(this.form, 'candidateParam', idList(parts[0]))
        this.deptLevel = Number(parts[1]) > 0 ? Number(parts[1]) : 1
      } else if (strategy === CandidateStrategy.START_USER_DEPT_LEADER || strategy === CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER) {
        this.$set(this.form, 'candidateParam', Number(value) || 1)
        this.deptLevel = Number(value) > 0 ? Number(value) : 1
      } else {
        this.$set(this.form, 'candidateParam', idList(value))
      }
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER) this.deptLevel = Number(parts[1]) > 0 ? Number(parts[1]) : 1
    },
    changeCandidateStrategy() {
      this.$set(this.form, 'candidateParam', [])
      this.deptLevel = 1
      this.updateElementTask()
    },
    buildCandidateParam() {
      const strategy = Number(this.form.candidateStrategy)
      const value = this.form.candidateParam
      const ids = (items) => (Array.isArray(items) ? items : []).join(',')
      if (strategy === CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) return `${ids(value)}|${this.deptLevel}`
      if (strategy === CandidateStrategy.FORM_DEPT_LEADER) return `${value || ''}|${this.deptLevel}`
      if (strategy === CandidateStrategy.START_USER_DEPT_LEADER || strategy === CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER) return String(this.deptLevel)
      return Array.isArray(value) ? ids(value) : (value || '')
    },
    updateElementTask() {
      if (!this.bpmnElement || !window.bpmnInstances || !window.bpmnInstances.moddle) return
      const instances = window.bpmnInstances
      const strategy = this.form.candidateStrategy === undefined || this.form.candidateStrategy === null || this.form.candidateStrategy === ''
        ? null
        : Number(this.form.candidateStrategy)
      const candidateParam = strategy === null ? null : this.buildCandidateParam()
      try {
        if (this.supportsFlowableCandidateExtensions) {
          // Flowable stores the approval rule in extension elements.  Keep the
          // Vue3 contract and preserve unrelated extension values.
          const values = this.otherExtensions.slice()
          if (strategy !== null) {
            values.push(instances.moddle.create('flowable:CandidateStrategy', { value: strategy }))
            values.push(instances.moddle.create('flowable:CandidateParam', { value: candidateParam }))
          }
          const extensionElements = instances.moddle.create('bpmn:ExtensionElements', { values })
          instances.modeling.updateProperties(this.bpmnElement, {
            extensionElements,
            candidateStrategy: null,
            candidateParam: null
          })
          return
        }

        // Activiti and Camunda descriptors expose these as namespaced
        // Assignable attributes, not `${prefix}:CandidateStrategy` element
        // types.  Creating the Flowable-only types under those prefixes makes
        // bpmn-moddle throw `unknown type` and leaves the task unsavable.
        // Write the descriptor-backed attributes instead and retain any other
        // extension values already present on the task.
        const extensionElements = this.otherExtensions.length
          ? instances.moddle.create('bpmn:ExtensionElements', { values: this.otherExtensions.slice() })
          : null
        instances.modeling.updateProperties(this.bpmnElement, {
          extensionElements,
          candidateStrategy: strategy === null ? null : String(strategy),
          candidateParam: candidateParam === null ? null : String(candidateParam)
        })
      } catch (error) {
        if (this.$message) this.$message.error('候选人规则暂无法写入当前 BPMN 描述')
      }
    },
    updateSkipExpression() {
      if (!this.bpmnElement || !window.bpmnInstances) return
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        skipExpression: this.form.skipExpression ? this.form.skipExpression : null
      })
    },
    openProcessExpressionDialog() {
      if (this.$refs.processExpressionDialog) this.$refs.processExpressionDialog.open()
    },
    selectProcessExpression(row) {
      this.candidateText = row && row.expression ? row.expression : ''
      this.updateElementTask()
    },
    handleFormUserChange(value) {
      if (value === 'PROCESS_START_USER_ID') {
        this.$set(this.form, 'candidateStrategy', CandidateStrategy.START_USER)
        this.$set(this.form, 'candidateParam', [])
      }
      this.updateElementTask()
    }
  },
  beforeDestroy() {
    this.bpmnElement = null
  }
}
</script>

<style scoped>
.user-task-config {
  margin-top: 12px;
}

.expression-select {
  width: 100%;
  margin-top: 6px;
}
</style>
