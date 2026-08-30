<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    size="700px"
    :before-close="handleBeforeClose"
  >
    <div class="router-config">
      <el-alert
        title="路由条件按顺序匹配；节点编号必须指向流程中的实际节点。"
        type="info"
        :closable="false"
        show-icon
      />
      <el-card v-for="(route, index) in draft.routerGroups" :key="`route-${index}`" shadow="never" class="route-card">
        <div slot="header" class="route-header">
          <span>路由 {{ index + 1 }}</span>
          <el-button type="text" icon="el-icon-delete" @click="removeRoute(index)">删除</el-button>
        </div>
        <el-form-item label="目标节点" :prop="`routerGroups.${index}.nodeId`">
          <el-select v-model="route.nodeId" filterable allow-create clearable placeholder="请选择或填写节点编号" style="width: 100%">
            <el-option v-for="item in nodeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <Condition
          :value="route"
          @input="updateRoute(index, $event)"
        />
      </el-card>
      <div v-if="!draft.routerGroups.length" class="empty-tip">尚未配置路由分支</div>
      <el-button type="primary" plain icon="el-icon-plus" @click="addRoute">新增路由分支</el-button>
    </div>
    <div class="drawer-footer">
      <el-button @click="cancelConfig">取 消</el-button>
      <el-button type="primary" @click="saveConfig">确 定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { NodeType, ConditionType, NODE_DEFAULT_NAME } from '../consts'
import Condition from './components/Condition.vue'
import { clone, conditionGroupsDefault, conditionIsValid, conditionShowText } from './components/node-config-utils'

export default {
  name: 'RouterNodeConfig',
  components: { Condition },
  props: { flowNode: { type: Object, required: true } },
  inject: {
    processDataRef: { from: 'processData', default: () => ({ value: undefined }) }
  },
  data() {
    return {
      visible: false,
      draft: this.createDraft(this.flowNode),
      nodeOptions: []
    }
  },
  computed: {
    drawerTitle() { return `${this.draft.name || NODE_DEFAULT_NAME.get(NodeType.ROUTER_BRANCH_NODE)}配置` }
  },
  watch: {
    flowNode: { deep: true, handler(value) { if (!this.visible && value) this.draft = this.createDraft(value) } }
  },
  methods: {
    createCondition(route) {
      const item = route || {}
      return {
        nodeId: item.nodeId || '',
        conditionType: Number(item.conditionType) || ConditionType.RULE,
        conditionExpression: item.conditionExpression || '',
        conditionGroups: item.conditionGroups ? clone(item.conditionGroups) : conditionGroupsDefault()
      }
    },
    createDraft(node) {
      return {
        name: node && node.name ? node.name : NODE_DEFAULT_NAME.get(NodeType.ROUTER_BRANCH_NODE),
        routerGroups: node && Array.isArray(node.routerGroups) ? node.routerGroups.map((item) => this.createCondition(item)) : []
      }
    },
    showRouteNodeConfig(node) {
      this.draft = this.createDraft(node || this.flowNode)
      this.buildNodeOptions()
    },
    openDrawer() { this.visible = true },
    addRoute() {
      this.draft.routerGroups.push(this.createCondition())
    },
    updateRoute(index, value) {
      this.$set(this.draft.routerGroups, index, this.createCondition({ ...value, nodeId: this.draft.routerGroups[index].nodeId }))
    },
    removeRoute(index) { this.draft.routerGroups.splice(index, 1) },
    buildNodeOptions() {
      const result = []
      const seen = {}
      const walk = (node) => {
        if (!node || !node.id) return
        const type = Number(node.type)
        if (type !== NodeType.ROUTER_BRANCH_NODE && type !== NodeType.CONDITION_NODE && !seen[node.id]) {
          seen[node.id] = true
          result.push({ label: node.name || node.id, value: node.id })
        }
        if (Array.isArray(node.conditionNodes)) node.conditionNodes.forEach((child) => walk(child))
        if (node.childNode) walk(node.childNode)
      }
      const root = this.processDataRef && this.processDataRef.value ? this.processDataRef.value : this.flowNode
      walk(root)
      this.nodeOptions = result
    },
    validateDraft() {
      if (!String(this.draft.name || '').trim()) return '节点名称不能为空'
      if (!Array.isArray(this.draft.routerGroups) || !this.draft.routerGroups.length) return '请至少配置一个路由分支'
      for (let index = 0; index < this.draft.routerGroups.length; index += 1) {
        const route = this.draft.routerGroups[index]
        if (!String(route.nodeId || '').trim()) return `请完善路由 ${index + 1} 的目标节点`
        if (!conditionIsValid(route)) return `请完善路由 ${index + 1} 的条件`
      }
      return ''
    },
    saveConfig() {
      const error = this.validateDraft()
      if (error) { this.$message.warning(error); return false }
      const groups = this.draft.routerGroups.map((route) => {
        const result = {
          nodeId: String(route.nodeId).trim(),
          conditionType: Number(route.conditionType),
          conditionExpression: Number(route.conditionType) === ConditionType.EXPRESSION ? String(route.conditionExpression || '').trim() : undefined,
          conditionGroups: Number(route.conditionType) === ConditionType.RULE ? clone(route.conditionGroups) : undefined
        }
        return result
      })
      this.$set(this.flowNode, 'name', String(this.draft.name).trim())
      this.$set(this.flowNode, 'routerGroups', groups)
      this.$set(this.flowNode, 'showText', `${groups.length}条路由分支`)
      this.visible = false
      return true
    },
    cancelConfig() { this.visible = false },
    async handleBeforeClose(done) { if (this.saveConfig()) done() },
    getRouteConditionText(route) { return conditionShowText(route, []) }
  }
}
</script>

<style scoped>
.router-config { padding: 0 20px 70px; }
.route-card { margin: 14px 0; }
.route-header { display: flex; align-items: center; justify-content: space-between; }
.empty-tip { margin: 20px 0; color: #909399; text-align: center; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; text-align: right; background: #fff; border-top: 1px solid #ebeef5; }
</style>
