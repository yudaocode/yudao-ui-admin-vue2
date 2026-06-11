<template>
  <el-select
    v-if="selectType === 'select'"
    v-model="selectedValue"
    style="width: 100%"
    v-bind="$attrs"
    @change="handleChange"
  >
    <el-option
      v-for="(dict, index) in dictOptions"
      :key="index"
      :label="dict.label"
      :value="dict.value"
    />
  </el-select>
  <el-radio-group
    v-else-if="selectType === 'radio'"
    v-model="selectedValue"
    style="width: 100%"
    v-bind="$attrs"
    @change="handleChange"
  >
    <el-radio v-for="(dict, index) in dictOptions" :key="index" :label="dict.value">
      {{ dict.label }}
    </el-radio>
  </el-radio-group>
  <el-checkbox-group
    v-else
    v-model="selectedValue"
    style="width: 100%"
    v-bind="$attrs"
    @change="handleChange"
  >
    <el-checkbox v-for="(dict, index) in dictOptions" :key="index" :label="dict.value">
      {{ dict.label }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script>
import { getDictDatas } from '@/utils/dict'

export default {
  name: 'DictSelect',
  props: {
    value: [String, Number, Boolean, Array],
    dictType: {
      type: String,
      default: ''
    },
    valueType: {
      type: String,
      default: 'str'
    },
    selectType: {
      type: String,
      default: 'select'
    }
  },
  computed: {
    selectedValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    dictOptions() {
      const list = getDictDatas(this.dictType) || []
      return list.map((item) => {
        let value = item.value
        if (this.valueType === 'int') {
          value = parseInt(item.value, 10)
        } else if (this.valueType === 'bool') {
          value = String(item.value) === 'true'
        } else {
          value = String(item.value)
        }
        return {
          ...item,
          value
        }
      })
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('change', value)
    }
  }
}
</script>
