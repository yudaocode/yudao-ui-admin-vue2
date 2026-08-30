<template>
  <el-form ref="form" :model="condition" :rules="rules" label-position="top" size="small">
    <el-form-item label="配置方式" prop="conditionType">
      <el-radio-group v-model="condition.conditionType" @change="changeConditionType">
        <el-radio
          v-for="item in conditionConfigTypesFiltered"
          :key="item.value"
          :label="item.value"
        >
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item
      v-if="conditionTypeValue === ConditionType.RULE && condition.conditionGroups"
      label="条件规则"
    >
      <div class="condition-group-tool">
        <span>条件组关系</span>
        <el-switch
          v-model="condition.conditionGroups.and"
          active-text="且"
          inactive-text="或"
          active-color="#13ce66"
        />
      </div>
      <div
        v-for="(group, groupIndex) in condition.conditionGroups.conditions"
        :key="'group-' + groupIndex"
        class="condition-group"
      >
        <el-card shadow="never">
          <div slot="header" class="condition-group-header">
            <span>条件组 {{ groupIndex + 1 }}</span>
            <span>
              规则关系
              <el-switch
                v-model="group.and"
                active-text="且"
                inactive-text="或"
                active-color="#13ce66"
              />
            </span>
          </div>
          <div
            v-for="(rule, ruleIndex) in group.rules"
            :key="'rule-' + groupIndex + '-' + ruleIndex"
            class="condition-rule"
          >
            <el-form-item
              :prop="'conditionGroups.conditions.' + groupIndex + '.rules.' + ruleIndex + '.leftSide'"
              :rules="requiredRule('左值不能为空')"
            >
              <el-select
                v-model="rule.leftSide"
                class="condition-field"
                filterable
                clearable
                placeholder="字段"
              >
                <el-option
                  v-for="field in fieldOptions"
                  :key="field.field"
                  :label="field.title"
                  :value="field.field"
                  :disabled="!field.required"
                />
              </el-select>
            </el-form-item>
            <el-select v-model="rule.opCode" class="condition-operator" placeholder="运算符">
              <el-option
                v-for="operator in COMPARISON_OPERATORS"
                :key="operator.value"
                :label="operator.label"
                :value="operator.value"
              />
            </el-select>
            <el-form-item
              :prop="'conditionGroups.conditions.' + groupIndex + '.rules.' + ruleIndex + '.rightSide'"
              :rules="requiredRule('右值不能为空')"
            >
              <el-input v-model="rule.rightSide" class="condition-value" placeholder="值" />
            </el-form-item>
            <el-button
              v-if="group.rules.length > 1"
              type="text"
              icon="el-icon-delete"
              class="condition-action condition-delete"
              title="删除规则"
              @click="deleteConditionRule(group, ruleIndex)"
            />
            <el-button
              type="text"
              icon="el-icon-plus"
              class="condition-action"
              title="添加规则"
              @click="addConditionRule(group, ruleIndex)"
            />
          </div>
        </el-card>
        <el-button
          v-if="condition.conditionGroups.conditions.length > 1"
          type="text"
          icon="el-icon-delete"
          class="condition-group-delete"
          title="删除条件组"
          @click="deleteConditionGroup(groupIndex)"
        />
      </div>
      <el-button type="text" icon="el-icon-plus" @click="addConditionGroup">添加条件组</el-button>
    </el-form-item>

    <el-form-item
      v-if="conditionTypeValue === ConditionType.EXPRESSION"
      label="条件表达式"
      prop="conditionExpression"
    >
      <el-input
        v-model="condition.conditionExpression"
        type="textarea"
        :rows="3"
        clearable
        placeholder="例如：${amount > 1000}"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import {
  COMPARISON_OPERATORS,
  CONDITION_CONFIG_TYPES,
  ConditionType,
  DEFAULT_CONDITION_GROUP_VALUE
} from '../../consts'
import { BpmModelFormType } from '@/utils/constants'
import { parseFormFields } from '@/components/FormCreate/src/utils'

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
  name: 'Condition',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  inject: {
    formFieldsRef: { from: 'formFields', default: () => ({ value: [] }) },
    formTypeRef: { from: 'formType', default: () => ({ value: undefined }) }
  },
  data() {
    return {
      ConditionType,
      COMPARISON_OPERATORS,
      conditionConfigTypesBase: CONDITION_CONFIG_TYPES,
      rules: {
        conditionType: [{ required: true, message: '配置方式不能为空', trigger: 'change' }],
        conditionExpression: [{ required: true, message: '条件表达式不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // JSON imported from older Vue2 versions occasionally stores enum values
    // as strings. Compare the normalized number so the rule/expression panel
    // remains visible after a round trip through the backend.
    conditionTypeValue() {
      return Number(this.condition.conditionType)
    },
    condition: {
      get() { return this.value },
      set(value) { this.$emit('input', value) }
    },
    fieldOptions() {
      const result = []
      const fields = this.formFieldsRef && this.formFieldsRef.value
      ;(fields || []).forEach((field) => {
        try {
          const rule = typeof field === 'string' ? JSON.parse(field) : field
          if (rule && typeof rule === 'object') parseFormFields(rule, result)
        } catch (e) {
          // Ignore malformed optional form rules; valid fields remain selectable.
        }
      })
      // Conditions may reference the initiator even when the selected form has no fields.
      if (!result.some((item) => item.field === 'PROCESS_START_USER_ID')) {
        result.unshift({ field: 'PROCESS_START_USER_ID', title: '发起人', required: true })
      }
      return result
    },
    conditionConfigTypesFiltered() {
      const formType = this.formTypeRef && this.formTypeRef.value
      if (Number(formType) === Number(BpmModelFormType.CUSTOM)) {
        return this.conditionConfigTypesBase.filter((item) => item.value !== ConditionType.RULE)
      }
      return this.conditionConfigTypesBase
    }
  },
  watch: {
    // The drawer stays mounted while different condition nodes are opened.
    // Re-run shape normalization when its v-model object is replaced by a
    // freshly parsed backend payload (including string enum values).
    value: {
      deep: true,
      handler() {
        this.ensureShape()
      }
    }
  },
  created() {
    this.ensureShape()
  },
  methods: {
    requiredRule(message) {
      return [{ required: true, message, trigger: 'blur' }]
    },
    ensureShape() {
      if (!this.condition.conditionType) this.$set(this.condition, 'conditionType', ConditionType.RULE)
      else if (Number(this.condition.conditionType) !== this.condition.conditionType) {
        this.$set(this.condition, 'conditionType', Number(this.condition.conditionType))
      }
      if (!this.condition.conditionGroups) {
        this.$set(this.condition, 'conditionGroups', clone(DEFAULT_CONDITION_GROUP_VALUE))
      }
      if (!Array.isArray(this.condition.conditionGroups.conditions) || !this.condition.conditionGroups.conditions.length) {
        this.$set(this.condition.conditionGroups, 'conditions', clone(DEFAULT_CONDITION_GROUP_VALUE.conditions))
      }
      this.condition.conditionGroups.conditions.forEach((group) => {
        if (!Array.isArray(group.rules) || !group.rules.length) {
          this.$set(group, 'rules', clone(DEFAULT_CONDITION_GROUP_VALUE.conditions[0].rules))
        }
      })
    },
    changeConditionType(type) {
      if (Number(type) === ConditionType.RULE) this.ensureShape()
    },
    deleteConditionGroup(index) {
      this.condition.conditionGroups.conditions.splice(index, 1)
    },
    deleteConditionRule(group, index) {
      group.rules.splice(index, 1)
    },
    addConditionRule(group, index) {
      group.rules.splice(index + 1, 0, { opCode: '==', leftSide: '', rightSide: '' })
    },
    addConditionGroup() {
      this.condition.conditionGroups.conditions.push({
        and: true,
        rules: [{ opCode: '==', leftSide: '', rightSide: '' }]
      })
    },
    async validate() {
      this.ensureShape()
      const valid = await new Promise((resolve) => this.$refs.form.validate(resolve))
      if (!valid) return false
      if (this.conditionTypeValue === ConditionType.RULE) {
        return this.condition.conditionGroups.conditions.every((group) =>
          group.rules.length > 0 && group.rules.every((rule) => rule.leftSide && rule.rightSide)
        )
      }
      return !!String(this.condition.conditionExpression || '').trim()
    }
  }
}
</script>

<style scoped>
.condition-group-tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.condition-group {
  position: relative;
  margin-bottom: 12px;
}

.condition-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.condition-rule {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.condition-rule:last-child {
  margin-bottom: 0;
}

.condition-field,
.condition-value {
  width: 145px;
}

.condition-operator {
  width: 105px;
  margin: 0 8px;
}

.condition-action {
  margin-top: 4px;
  padding: 4px;
}

.condition-delete,
.condition-group-delete {
  color: #f56c6c;
}

.condition-group-delete {
  position: absolute;
  top: 10px;
  right: 8px;
}
</style>
