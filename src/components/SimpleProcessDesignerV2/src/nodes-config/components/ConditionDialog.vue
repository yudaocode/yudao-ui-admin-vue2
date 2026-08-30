<!--
  Vue 3 exposes a small modal condition editor for trigger settings.  Keep a
  Vue 2 equivalent so callers can use the same imperative `open(condition)` /
  `update-condition` contract without pulling in the Vue 3 Dialog component.
  The actual rule editor is shared with the node drawers through Condition.
-->
<template>
  <el-dialog
    title="条件配置"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
    @closed="reset"
  >
    <Condition ref="condition" v-model="draft" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="saving" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Condition from './Condition.vue'
import { ConditionType, DEFAULT_CONDITION_GROUP_VALUE } from '../../consts'

function clone(value) {
  if (Array.isArray(value)) return value.map((item) => clone(item))
  if (value && typeof value === 'object') {
    const result = {}
    Object.keys(value).forEach((key) => { result[key] = clone(value[key]) })
    return result
  }
  return value
}

function defaultCondition() {
  return {
    conditionType: ConditionType.RULE,
    conditionExpression: '',
    conditionGroups: clone(DEFAULT_CONDITION_GROUP_VALUE)
  }
}

export default {
  name: 'ConditionDialog',
  components: { Condition },
  data() {
    return {
      dialogVisible: false,
      saving: false,
      draft: defaultCondition()
    }
  },
  methods: {
    /** Open the modal with a cloned condition so cancel never mutates callers. */
    open(condition) {
      this.draft = condition ? clone(condition) : defaultCondition()
      this.dialogVisible = true
      return this.$nextTick()
    },
    async submitForm() {
      if (this.saving) return false
      this.saving = true
      try {
        const valid = this.$refs.condition && this.$refs.condition.validate
          ? await this.$refs.condition.validate()
          : true
        if (!valid) {
          this.$message.warning('请完善条件规则')
          return false
        }
        this.$emit('update-condition', clone(this.draft))
        this.dialogVisible = false
        return true
      } finally {
        this.saving = false
      }
    },
    reset() {
      this.saving = false
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
