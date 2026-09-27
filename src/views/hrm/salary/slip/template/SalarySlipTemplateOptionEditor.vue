<template>
  <div class="full-width">
    <div class="toolbar">
      <el-button
        plain
        type="primary"
        icon="el-icon-plus"
        @click="addCategory"
      >新增分类</el-button>
      <slot name="actions" />
    </div>
    <el-table
      :data="displayOptions"
      :max-height="maxHeight"
      border
      row-key="code"
    >
      <el-table-column
        align="center"
        label="类型"
        width="80"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === HrmSalarySlipTemplateOptionType.CATEGORY ? 'primary' : 'info'">
            {{ scope.row.type === HrmSalarySlipTemplateOptionType.CATEGORY ? '分类' : '工资项' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="名称"
        min-width="160"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.name"
            maxlength="64"
            placeholder="请输入名称"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="所属分类"
        min-width="150"
      >
        <template slot-scope="scope">
          <el-select
            v-if="scope.row.type === HrmSalarySlipTemplateOptionType.ITEM"
            v-model="scope.row.parentCode"
            clearable
            placeholder="不分类"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.code"
              :label="category.name"
              :value="category.code"
            />
          </el-select>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="显示"
        width="80"
      >
        <template slot-scope="scope">
          <el-switch
            :value="!scope.row.hidden"
            :disabled="scope.row.code === HrmSalaryOptionCode.REAL_PAY"
            @change="handleVisibleChange(scope.row, $event)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        min-width="190"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.remark"
            clearable
            maxlength="255"
            placeholder="展示在工资条提示中"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="操作"
        width="138"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            :disabled="isFirstOption(scope.row)"
            icon="el-icon-top"
            @click="moveOption(scope.row, -1)"
          />
          <el-button
            type="text"
            :disabled="isLastOption(scope.row)"
            icon="el-icon-bottom"
            @click="moveOption(scope.row, 1)"
          />
          <el-button
            type="text"
            class="danger-text"
            :disabled="scope.row.code === HrmSalaryOptionCode.REAL_PAY"
            icon="el-icon-delete"
            @click="removeOption(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  HrmSalaryOptionCategoryCode,
  HrmSalaryOptionCode,
  HrmSalarySlipTemplateOptionType
} from '@/views/hrm/utils/constants'

export default {
  name: 'HrmSalarySlipTemplateOptionEditor',
  props: {
    value: { type: Array, default: () => [] },
    maxHeight: { type: Number, default: 420 }
  },
  data() {
    return {
      HrmSalaryOptionCode,
      HrmSalarySlipTemplateOptionType
    }
  },
  computed: {
    categoryOptions() {
      return (this.value || [])
        .filter(item => item.type === HrmSalarySlipTemplateOptionType.CATEGORY)
        .sort(this.compareOption)
    },
    displayOptions() {
      const options = this.value || []
      const result = []
      this.categoryOptions.forEach(category => {
        result.push(category)
        result.push(...options.filter(item =>
          item.type === HrmSalarySlipTemplateOptionType.ITEM &&
          item.parentCode === category.code
        ).sort(this.compareOption))
      })
      result.push(...options.filter(item =>
        item.type === HrmSalarySlipTemplateOptionType.ITEM &&
        !this.categoryOptions.some(category => category.code === item.parentCode)
      ).sort(this.compareOption))
      return result
    }
  },
  methods: {
    emitValue(options) {
      this.$emit('input', options)
      this.$emit('update:modelValue', options)
    },
    addCategory() {
      const codes = (this.value || []).map(item => item.code).filter(code => code !== undefined)
      const code = Math.min(-1, ...codes.filter(item => item < 0)) - 1
      this.emitValue([
        ...(this.value || []),
        {
          name: '新分类',
          type: HrmSalarySlipTemplateOptionType.CATEGORY,
          code,
          hidden: false,
          sort: this.getNextSort()
        }
      ])
    },
    removeOption(option) {
      const options = (this.value || []).filter(item => item !== option).map(item =>
        option.type === HrmSalarySlipTemplateOptionType.CATEGORY && item.parentCode === option.code
          ? { ...item, parentCode: undefined }
          : item
      )
      this.emitValue(options)
      this.$emit('remove', option)
    },
    handleVisibleChange(option, visible) {
      option.hidden = !visible
      this.emitValue([...(this.value || [])])
    },
    moveOption(option, offset) {
      const siblings = this.getSiblingOptions(option)
      const index = siblings.indexOf(option)
      const target = siblings[index + offset]
      if (!target) return
      const sort = option.sort
      option.sort = target.sort
      target.sort = sort
      this.emitValue([...(this.value || [])])
    },
    isFirstOption(option) {
      return this.getSiblingOptions(option)[0] === option
    },
    isLastOption(option) {
      const siblings = this.getSiblingOptions(option)
      return siblings[siblings.length - 1] === option
    },
    getSiblingOptions(option) {
      return (this.value || []).filter(item =>
        option.type === HrmSalarySlipTemplateOptionType.CATEGORY
          ? item.type === HrmSalarySlipTemplateOptionType.CATEGORY
          : item.type === HrmSalarySlipTemplateOptionType.ITEM &&
            item.parentCode === option.parentCode
      ).sort(this.compareOption)
    },
    validate() {
      if (this.displayOptions.some(item => !(item.name || '').trim())) {
        return '模板明细名称不能为空'
      }
      if (this.displayOptions.some(item => (item.name || '').length > 64)) {
        return '模板明细名称不能超过 64 个字符'
      }
      if (this.displayOptions.some(item => (item.remark || '').length > 255)) {
        return '模板明细备注不能超过 255 个字符'
      }
      if (this.categoryOptions.some(category =>
        !this.displayOptions.some(item =>
          item.type === HrmSalarySlipTemplateOptionType.ITEM &&
          item.parentCode === category.code
        )
      )) {
        return '模板分类下至少需要保留一个工资项'
      }
    },
    getNormalizedOptions() {
      return this.displayOptions.map((item, index) => ({
        ...item,
        parentCode: item.type === HrmSalarySlipTemplateOptionType.CATEGORY
          ? HrmSalaryOptionCategoryCode.ROOT
          : item.parentCode || HrmSalaryOptionCategoryCode.ROOT,
        sort: index + 1
      }))
    },
    compareOption(first, second) {
      return (first.sort || 0) - (second.sort || 0)
    },
    getNextSort() {
      return Math.max(0, ...(this.value || []).map(item => item.sort || 0)) + 1
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
