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
import { listSimpleRoles } from '@/api/system/role'
import { listSimplePosts } from '@/api/system/post'
import { listSimpleUsers } from '@/api/system/user'
import { listSimpleDepts } from '@/api/system/dept'
import { getUserGroupSimpleList } from '@/api/bpm/userGroup'

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}))
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
    return {
      processNodeTree: this.value ? clone(this.value) : createDefaultModel(),
      processDataRef: { value: undefined },
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
          this.processNodeTree = clone(value)
        }
      }
    },
    modelFormType(value) {
      this.formTypeRef.value = value
    },
    modelFormId: {
      immediate: true,
      handler() {
        this.loadFormFields()
      }
    }
  },
  created() {
    this.loadOptions()
  },
  methods: {
    async loadFormFields() {
      if (!this.modelFormId) {
        this.formFieldsRef.value = []
        return
      }
      try {
        const response = await getForm(this.modelFormId)
        const data = response.data || response
        this.formFieldsRef.value = data && data.fields ? data.fields : []
      } catch (e) {
        this.formFieldsRef.value = []
      }
    },
    async loadOptions() {
      const normalize = (response) => response && response.data ? response.data : response
      try {
        const responses = await Promise.all([
          listSimpleRoles(),
          listSimplePosts(),
          listSimpleUsers(),
          listSimpleDepts(),
          getUserGroupSimpleList()
        ])
        this.roleListRef.value = normalize(responses[0]) || []
        this.postListRef.value = normalize(responses[1]) || []
        this.userListRef.value = normalize(responses[2]) || []
        this.deptListRef.value = normalize(responses[3]) || []
        this.deptTreeRef.value = this.deptListRef.value
        this.userGroupListRef.value = normalize(responses[4]) || []
      } catch (e) {
        // 选项加载失败不阻塞流程设计，保存时仍会保留节点 JSON。
      }
    },
    resetModel() {
      this.$confirm('确认重置当前仿真流程设计？', '提示', {
        type: 'warning'
      }).then(() => {
        this.processNodeTree = createDefaultModel()
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
