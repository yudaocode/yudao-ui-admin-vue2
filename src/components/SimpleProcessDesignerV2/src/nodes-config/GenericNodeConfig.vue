<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    :before-close="handleBeforeClose"
    size="560px"
  >
    <div class="generic-node-config">
      <el-form ref="form" :model="form" label-width="110px" size="small">
        <el-form-item label="节点名称">
          <el-input v-model="form.name" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="展示说明">
          <el-input
            v-model="form.showText"
            type="textarea"
            :rows="3"
            placeholder="流程图上展示的节点摘要，例如：指定成员：张三"
          />
        </el-form-item>

        <template v-if="isUserNode">
          <el-form-item label="审批类型">
            <el-select v-model="form.approveType" clearable placeholder="请选择审批类型">
              <el-option
                v-for="item in approveTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="候选策略">
            <el-select v-model="form.candidateStrategy" clearable placeholder="请选择候选策略">
              <el-option
                v-for="item in candidateStrategies"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指定用户">
            <el-select v-model="form.userIds" multiple filterable clearable placeholder="请选择用户">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.nickname || item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指定角色">
            <el-select v-model="form.roleIds" multiple filterable clearable placeholder="请选择角色">
              <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="指定部门">
            <el-select v-model="form.deptIds" multiple filterable clearable placeholder="请选择部门">
              <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="指定岗位">
            <el-select v-model="form.postIds" multiple filterable clearable placeholder="请选择岗位">
              <el-option v-for="item in postList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="isConditionNode">
          <el-form-item label="默认分支">
            <el-switch v-model="form.conditionSetting.defaultFlow" />
          </el-form-item>
          <el-form-item label="条件类型">
            <el-select v-model="form.conditionSetting.conditionType" clearable placeholder="请选择条件类型">
              <el-option
                v-for="item in conditionTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="条件表达式">
            <el-input
              v-model="form.conditionSetting.conditionExpression"
              type="textarea"
              :rows="3"
              placeholder="例如：${amount > 1000}"
            />
          </el-form-item>
        </template>

        <template v-if="isTimerNode">
          <el-form-item label="延迟时长">
            <el-input-number v-model="form.delaySetting.timeDuration" :min="1" />
          </el-form-item>
          <el-form-item label="时间单位">
            <el-select v-model="form.delaySetting.timeUnit" clearable placeholder="请选择时间单位">
              <el-option v-for="item in timeUnitTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="isChildProcessNode">
          <el-form-item label="流程标识">
            <el-input v-model="form.childProcessSetting.calledProcessDefinitionKey" />
          </el-form-item>
          <el-form-item label="流程名称">
            <el-input v-model="form.childProcessSetting.calledProcessDefinitionName" />
          </el-form-item>
          <el-form-item label="异步启动">
            <el-switch v-model="form.childProcessSetting.async" />
          </el-form-item>
        </template>

        <template v-if="isTriggerNode || isRouterNode">
          <el-form-item label="请求地址">
            <el-input v-model="form.httpRequestSetting.url" placeholder="请输入 HTTP 请求地址" />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="form.httpRequestSetting.method" clearable>
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="高级 JSON">
          <el-input
            v-model="jsonText"
            type="textarea"
            :rows="8"
            placeholder="可直接编辑完整节点 JSON，保存时会合并回节点"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="saveConfig">保 存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import {
  APPROVE_TYPE,
  CANDIDATE_STRATEGY,
  CONDITION_CONFIG_TYPES,
  TIME_UNIT_TYPES,
  NodeType
} from '../consts'

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}))
}

export default {
  name: 'GenericNodeConfig',
  props: {
    flowNode: {
      type: Object,
      required: true
    }
  },
  inject: {
    roleListRef: { from: 'roleList', default: () => ({ value: [] }) },
    postListRef: { from: 'postList', default: () => ({ value: [] }) },
    userListRef: { from: 'userList', default: () => ({ value: [] }) },
    deptListRef: { from: 'deptList', default: () => ({ value: [] }) }
  },
  data() {
    return {
      visible: false,
      form: this.createForm(),
      jsonText: ''
    }
  },
  computed: {
    drawerTitle() {
      return `${this.form.name || '节点'}配置`
    },
    roleList() {
      return this.roleListRef && this.roleListRef.value ? this.roleListRef.value : []
    },
    postList() {
      return this.postListRef && this.postListRef.value ? this.postListRef.value : []
    },
    userList() {
      return this.userListRef && this.userListRef.value ? this.userListRef.value : []
    },
    deptList() {
      return this.deptListRef && this.deptListRef.value ? this.deptListRef.value : []
    },
    candidateStrategies() {
      return CANDIDATE_STRATEGY
    },
    approveTypes() {
      return APPROVE_TYPE
    },
    conditionTypes() {
      return CONDITION_CONFIG_TYPES
    },
    timeUnitTypes() {
      return TIME_UNIT_TYPES
    },
    isUserNode() {
      return this.form.type === NodeType.USER_TASK_NODE || this.form.type === NodeType.TRANSACTOR_NODE || this.form.type === NodeType.COPY_TASK_NODE
    },
    isConditionNode() {
      return this.form.type === NodeType.CONDITION_NODE
    },
    isTimerNode() {
      return this.form.type === NodeType.DELAY_TIMER_NODE
    },
    isChildProcessNode() {
      return this.form.type === NodeType.CHILD_PROCESS_NODE
    },
    isTriggerNode() {
      return this.form.type === NodeType.TRIGGER_NODE
    },
    isRouterNode() {
      return this.form.type === NodeType.ROUTER_BRANCH_NODE
    }
  },
  methods: {
    createForm() {
      const data = clone(this.flowNode)
      if (!data.conditionSetting) data.conditionSetting = {}
      if (!data.delaySetting) data.delaySetting = {}
      if (!data.childProcessSetting) data.childProcessSetting = {}
      if (!data.httpRequestSetting) data.httpRequestSetting = {}
      if (!Array.isArray(data.userIds)) data.userIds = []
      if (!Array.isArray(data.roleIds)) data.roleIds = []
      if (!Array.isArray(data.deptIds)) data.deptIds = []
      if (!Array.isArray(data.postIds)) data.postIds = []
      return data
    },
    openDrawer() {
      this.form = this.createForm()
      this.jsonText = JSON.stringify(this.form, null, 2)
      this.visible = true
    },
    showUserTaskNodeConfig() {
      this.openDrawer()
    },
    handleBeforeClose(done) {
      done()
    },
    saveConfig() {
      let merged = clone(this.form)
      if (this.jsonText && this.jsonText.trim()) {
        try {
          merged = {
            ...merged,
            ...JSON.parse(this.jsonText)
          }
        } catch (e) {
          this.$message.error('高级 JSON 格式不正确')
          return
        }
      }
      Object.keys(merged).forEach((key) => {
        this.$set(this.flowNode, key, merged[key])
      })
      if (!this.flowNode.showText) {
        this.$set(this.flowNode, 'showText', this.buildShowText())
      }
      this.visible = false
    },
    buildShowText() {
      const names = []
      if (this.form.userIds && this.form.userIds.length) {
        names.push('指定成员')
      }
      if (this.form.roleIds && this.form.roleIds.length) {
        names.push('指定角色')
      }
      if (this.form.deptIds && this.form.deptIds.length) {
        names.push('指定部门')
      }
      if (this.form.postIds && this.form.postIds.length) {
        names.push('指定岗位')
      }
      if (this.form.conditionSetting && this.form.conditionSetting.conditionExpression) {
        names.push(this.form.conditionSetting.conditionExpression)
      }
      if (this.form.childProcessSetting && this.form.childProcessSetting.calledProcessDefinitionName) {
        names.push(this.form.childProcessSetting.calledProcessDefinitionName)
      }
      return names.join('、')
    }
  }
}
</script>

<style scoped>
.generic-node-config {
  padding: 0 20px 64px;
}

.generic-node-config .el-select {
  width: 100%;
}

.drawer-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 20px;
  text-align: right;
  background: #fff;
  border-top: 1px solid #ebeef5;
}
</style>
