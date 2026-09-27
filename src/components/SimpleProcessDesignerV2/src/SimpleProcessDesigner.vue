<template>
  <div class="simple-process-designer">
    <div class="simple-process-designer__toolbar">
      <span class="simple-process-designer__title">{{ modelName || '仿真流程设计' }}</span>
      <div>
        <el-button size="mini" icon="el-icon-refresh" @click="resetModel">重置</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="saveModel">保存流程</el-button>
      </div>
    </div>
    <SimpleProcessModel
      v-if="processNodeTree"
      ref="model"
      :flow-node="processNodeTree"
      :readonly="false"
      @save="handleModelSave"
    />
  </div>
</template>

<script>
import SimpleProcessModel from './SimpleProcessModel.vue'
import { NodeId, NodeType } from './consts'
import { getForm } from '@/api/bpm/form'
import { getSimpleRoleList } from '@/api/system/role'
import { getSimplePostList } from '@/api/system/post'
import { getSimpleUserList } from '@/api/system/user'
import { getSimpleDeptList } from '@/api/system/dept'
import { getUserGroupSimpleList } from '@/api/bpm/userGroup'

function clone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item))
  }
  if (value && typeof value === 'object') {
    const result = {}
    Object.keys(value).forEach((key) => {
      result[key] = clone(value[key])
    })
    return result
  }
  return value
}

function createDefaultModel() {
  return {
    name: '发起人',
    type: NodeType.START_USER_NODE,
    id: NodeId.START_USER_NODE_ID,
    childNode: {
      id: NodeId.END_EVENT_NODE_ID,
      name: '结束',
      type: NodeType.END_EVENT_NODE
    }
  }
}

export default {
  name: 'SimpleProcessDesigner',
  components: { SimpleProcessModel },
  props: {
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
    },
    value: {
      type: Object,
      default: undefined
    }
  },
  provide() {
    return {
      processData: this.processDataRef,
      formFields: this.formFieldsRef,
      formType: this.formTypeRef,
      roleList: this.roleListRef,
      postList: this.postListRef,
      userList: this.userListRef,
      deptList: this.deptListRef,
      userGroupList: this.userGroupListRef,
      deptTree: this.deptTreeRef,
      startUserIds: this.startUserIds,
      startDeptIds: this.startDeptIds,
      tasks: [],
      processInstance: {}
    }
  },
  data() {
    // Keep the injected processData reference pointed at the live tree from
    // the first render.  RouterNodeConfig uses it to enumerate valid target
    // nodes; leaving it undefined until the first explicit save makes a
    // newly-added router see only itself and not the surrounding flow.
    const initialTree = this.value ? clone(this.value) : createDefaultModel()
    return {
      processNodeTree: initialTree,
      processDataRef: { value: initialTree },
      formFieldsRef: { value: [] },
      formTypeRef: { value: this.modelFormType },
      roleListRef: { value: [] },
      postListRef: { value: [] },
      userListRef: { value: [] },
      deptListRef: { value: [] },
      userGroupListRef: { value: [] },
      deptTreeRef: { value: [] }
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        if (value) {
          const nextTree = clone(value)
          this.processNodeTree = nextTree
          this.processDataRef.value = nextTree
        }
      }
    },
    modelFormType(value) {
      this.formTypeRef.value = value
    },
    modelFormId: {
      immediate: true,
      async handler() {
        await this.loadFormFields()
      }
    }
  },
  async created() {
    await this.loadOptions()
  },
  methods: {
    async loadFormFields() {
      if (!this.modelFormId) {
        this.formFieldsRef.value = []
        return
      }
      const response = await getForm(this.modelFormId)
      this.formFieldsRef.value = response.data && Array.isArray(response.data.fields) ? response.data.fields : []
    },
    async loadOptions() {
      const responses = await Promise.all([
        getSimpleRoleList(),
        getSimplePostList(),
        getSimpleUserList(),
        getSimpleDeptList(),
        getUserGroupSimpleList()
      ])
      this.roleListRef.value = Array.isArray(responses[0].data) ? responses[0].data : []
      this.postListRef.value = Array.isArray(responses[1].data) ? responses[1].data : []
      this.userListRef.value = Array.isArray(responses[2].data) ? responses[2].data : []
      this.deptListRef.value = Array.isArray(responses[3].data) ? responses[3].data : []
      this.deptTreeRef.value = this.deptListRef.value
      this.userGroupListRef.value = Array.isArray(responses[4].data) ? responses[4].data : []
    },
    resetModel() {
      this.$confirm('确认重置当前仿真流程设计？', '提示', {
        type: 'warning'
      }).then(() => {
        const nextTree = createDefaultModel()
        this.processNodeTree = nextTree
        this.processDataRef.value = nextTree
      }).catch(() => {})
    },
    handleModelSave(data) {
      this.processNodeTree = data
      this.processDataRef.value = data
      this.$emit('input', data)
      this.$emit('success', data)
    },
    async saveModel() {
      const data = await this.$refs.model.getCurrentFlowData()
      if (!data) {
        return
      }
      this.handleModelSave(data)
      this.$message.success('流程设计已保存')
    },
    async getCurrentFlowData() {
      return this.$refs.model.getCurrentFlowData()
    }
  }
}
</script>

<style scoped>
.simple-process-designer {
  height: calc(100vh - 190px);
  min-height: 560px;
  border: 1px solid #ebeef5;
  background: #f7f8fa;
}

.simple-process-designer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.simple-process-designer__title {
  font-weight: 600;
  color: #303133;
}
</style>
