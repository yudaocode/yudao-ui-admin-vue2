<template>
  <el-drawer
    :visible.sync="visible"
    :append-to-body="true"
    size="588px"
    :before-close="handleBeforeClose"
  >
    <div slot="title" class="condition-config-title">
      <el-input
        v-if="editingName"
        v-model="currentNode.name"
        size="small"
        maxlength="30"
        @blur="finishNameEdit"
      />
      <span v-else>
        {{ currentNode.name }}
        <i class="el-icon-edit" @click="editingName = true" />
      </span>
    </div>
    <div v-if="isDefaultFlow" class="default-flow-tip">
      未满足其它条件时，将进入此分支（该分支不可编辑和删除）
    </div>
    <Condition v-else ref="condition" v-model="condition" />
    <div class="drawer-footer">
      <el-button type="primary" @click="saveConfig">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-drawer>
</template>

<script>
import Condition from './components/Condition.vue'
import { ConditionType, DEFAULT_CONDITION_GROUP_VALUE } from '../consts'

function clone(value) {
  if (Array.isArray(value)) return value.map((item) => clone(item))
  if (value && typeof value === 'object') {
    const result = {}
    Object.keys(value).forEach((key) => { result[key] = clone(value[key]) })
    return result
  }
  return value
}

export default {
  name: 'ConditionNodeConfig',
  components: { Condition },
  props: {
    conditionNode: {
      type: Object,
      required: true
    },
    nodeIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      visible: false,
      editingName: false,
      currentNode: this.conditionNode,
      condition: this.defaultCondition()
    }
  },
  computed: {
    isDefaultFlow() {
      return !!(this.currentNode && this.currentNode.conditionSetting && this.currentNode.conditionSetting.defaultFlow)
    }
  },
  watch: {
    conditionNode: {
      deep: true,
      handler(value) { this.currentNode = value }
    }
  },
  methods: {
    defaultCondition() {
      return {
        conditionType: ConditionType.RULE,
        conditionExpression: '',
        conditionGroups: clone(DEFAULT_CONDITION_GROUP_VALUE)
      }
    },
    openDrawer() {
      this.open()
    },
    open() {
      this.currentNode = this.conditionNode
      const condition = this.currentNode && this.currentNode.conditionSetting
        ? clone(this.currentNode.conditionSetting)
        : this.defaultCondition()
      // Jackson may hydrate enum values as strings.  Normalize before the
      // strict Vue2 branches below decide which editor/payload to use.
      condition.conditionType = Number(condition.conditionType) || ConditionType.RULE
      this.condition = condition
      this.visible = true
    },
    showConditionNodeConfig() {
      this.open()
    },
    finishNameEdit() {
      this.editingName = false
      if (!this.currentNode.name) this.currentNode.name = `条件${this.nodeIndex + 1}`
    },
    async handleBeforeClose(done) {
      // Match the Vue3 drawer contract: closing through the X button runs the
      // same validation/save path as the explicit confirm button.  Leaving
      // this callback as an unconditional done() silently discarded invalid
      // condition edits.
      try {
        const saved = await this.saveConfig()
        if (saved) done()
      } catch (e) {
        // Keep the drawer open when validation unexpectedly fails; the user
        // can inspect/fix the condition instead of losing the draft.
        // eslint-disable-next-line no-console
        console.error('[BPM] 保存条件节点配置失败', e)
      }
    },
    async saveConfig() {
      if (this.isDefaultFlow) {
        this.visible = false
        return true
      }
      const valid = this.$refs.condition && await this.$refs.condition.validate()
      if (!valid) {
        this.$message.warning('请完善条件规则')
        return false
      }
      const conditionType = Number(this.condition.conditionType)
      const setting = {
        ...(this.currentNode.conditionSetting || {}),
        conditionType,
        conditionExpression: conditionType === ConditionType.EXPRESSION
          ? this.condition.conditionExpression
          : undefined,
        conditionGroups: conditionType === ConditionType.RULE
          ? clone(this.condition.conditionGroups)
          : undefined
      }
      this.$set(this.currentNode, 'conditionSetting', setting)
      this.$set(this.currentNode, 'showText', this.buildShowText())
      this.finishNameEdit()
      this.visible = false
      return true
    },
    buildShowText() {
      if (Number(this.condition.conditionType) === ConditionType.EXPRESSION) {
        return this.condition.conditionExpression ? `表达式：${this.condition.conditionExpression}` : ''
      }
      const groups = this.condition.conditionGroups && this.condition.conditionGroups.conditions
      if (!groups || !groups.length) return ''
      const text = groups.map((group) => {
        const rules = (group.rules || []).map((rule) => `${rule.leftSide} ${rule.opCode} ${rule.rightSide}`)
        return `(${rules.join(group.and ? ' 且 ' : ' 或 ')})`
      })
      return text.join(this.condition.conditionGroups.and ? ' 且 ' : ' 或 ')
    }
  }
}
</script>

<style scoped>
.condition-config-title {
  padding-right: 24px;
  font-weight: 600;
}

.condition-config-title .el-icon-edit {
  margin-left: 8px;
  cursor: pointer;
  color: #409eff;
}

.default-flow-tip {
  padding: 18px 20px;
  color: #606266;
}

.drawer-footer {
  text-align: right;
}
</style>
