<template>
  <Treeselect
    v-model="selectedValue"
    class="dept-select"
    style="width: 100%"
    :options="deptTree"
    :normalizer="normalizer"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder || '请选择部门'"
    :clearable="true"
    :append-to-body="true"
    :z-index="3000"
    no-options-text="暂无数据"
    no-results-text="暂无结果"
    search-prompt-text="请输入部门名称"
    @input="handleChange"
  />
</template>

<script>
import { listSimpleDepts } from '@/api/system/dept'
import { handleTree } from '@/utils/ruoyi'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'DeptSelect',
  components: {
    Treeselect
  },
  props: {
    value: [String, Number, Array],
    multiple: {
      type: Boolean,
      default: false
    },
    returnType: {
      type: String,
      default: 'id'
    },
    defaultCurrentDept: {
      type: Boolean,
      default: false
    },
    disabled: Boolean,
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      deptList: [],
      deptTree: [],
      selectedValue: this.multiple ? [] : undefined
    }
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        this.syncSelectedValue()
      }
    },
    deptList() {
      this.syncSelectedValue()
    }
  },
  mounted() {
    this.loadDeptList()
  },
  methods: {
    async loadDeptList() {
      try {
        const response = await listSimpleDepts()
        this.deptList = response.data || []
        this.deptTree = handleTree(this.deptList, 'id')
        this.setDefaultValue()
      } catch (e) {
        this.deptList = []
        this.deptTree = []
      }
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    syncSelectedValue() {
      if (this.value === undefined || this.value === null || this.value === '') {
        this.selectedValue = this.multiple ? [] : undefined
        return
      }
      if (this.returnType === 'name') {
        if (this.multiple && Array.isArray(this.value)) {
          this.selectedValue = this.value.map((name) => this.getDeptIdByName(name)).filter(Boolean)
        } else {
          this.selectedValue = this.getDeptIdByName(this.value)
        }
      } else {
        this.selectedValue = this.value
      }
    },
    handleChange(value) {
      if (value === undefined || value === null || value === '') {
        this.$emit('input', this.multiple ? [] : undefined)
        return
      }
      if (this.returnType === 'name') {
        if (this.multiple && Array.isArray(value)) {
          this.$emit('input', value.map((id) => this.getDeptNameById(id)).filter(Boolean))
        } else {
          this.$emit('input', this.getDeptNameById(value))
        }
      } else {
        this.$emit('input', value)
      }
      this.$emit('change', value)
    },
    getDeptNameById(id) {
      const dept = this.deptList.find((item) => String(item.id) === String(id))
      return dept && dept.name
    },
    getDeptIdByName(name) {
      const dept = this.deptList.find((item) => item.name === name)
      return dept && dept.id
    },
    hasValidPresetValue() {
      if (this.value === undefined || this.value === null || this.value === '') {
        return false
      }
      return Array.isArray(this.value) ? this.value.length > 0 : true
    },
    setDefaultValue() {
      if (!this.defaultCurrentDept || this.hasValidPresetValue()) {
        return
      }
      const deptId = this.$store && this.$store.getters && this.$store.getters.deptId
      if (deptId) {
        this.handleChange(this.multiple ? [deptId] : deptId)
      }
    }
  }
}
</script>

<style scoped>
.dept-select ::v-deep .vue-treeselect__control {
  min-height: 36px;
}
</style>
