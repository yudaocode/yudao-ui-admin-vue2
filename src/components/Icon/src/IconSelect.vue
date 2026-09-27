<template>
  <div class="icon-selector">
    <el-input :value="value" :clearable="clearable" @input="$emit('input', $event)" @clear="clearIcon">
      <el-popover slot="append" v-model="visible" width="355" placement="auto" trigger="click">
        <button slot="reference" type="button" class="icon-selector-trigger" aria-label="选择图标">
          <Icon :icon="value || currentActiveType + icon" />
        </button>
        <el-input v-model="filterValue" clearable placeholder="搜索图标" />
        <el-tabs v-model="currentActiveType" @tab-click="handleClick">
          <el-tab-pane v-for="pane in tabsList" :key="pane.name" :label="pane.label" :name="pane.name">
            <div class="icon-selector-grid">
              <button v-for="item in pageList" :key="item" type="button" :title="item"
                :class="['icon-selector-item', { selected: value === currentActiveType + item }]"
                @click="onChangeIcon(item)">
                <Icon :icon="currentActiveType + item" />
              </button>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="iconCount" background small
          layout="prev, pager, next" @current-change="currentPage = $event" />
      </el-popover>
    </el-input>
  </div>
</template>

<script>
import Icon from './Icon.vue'
import { IconJson } from './data'

export default {
  name: 'YudaoIconSelect',
  components: { Icon },
  props: { value: { type: String, default: '' }, clearable: { type: Boolean, default: false } },
  data() {
    return {
      visible: false, icon: 'add-location', currentActiveType: 'ep:',
      pageSize: 96, currentPage: 1, filterValue: '',
      tabsList: [
        { label: 'Element Plus', name: 'ep:' },
        { label: 'Font Awesome 4', name: 'fa:' },
        { label: 'Font Awesome 5 Solid', name: 'fa-solid:' }
      ]
    }
  },
  computed: {
    filteredIcons() { return (IconJson[this.currentActiveType] || []).filter(item => item.includes(this.filterValue)) },
    pageList() { return this.filteredIcons.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage) },
    iconCount() { return this.filteredIcons.length }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        if (value && value.includes(':')) {
          this.currentActiveType = value.slice(0, value.indexOf(':') + 1)
          this.icon = value.slice(value.indexOf(':') + 1)
        }
      }
    },
    filterValue() { this.currentPage = 1 }
  },
  methods: {
    handleClick(tab) {
      this.currentPage = 1
      this.currentActiveType = tab.name
      this.icon = IconJson[this.currentActiveType][0]
      this.$emit('input', this.currentActiveType + this.icon)
    },
    onChangeIcon(item) {
      this.icon = item
      this.$emit('input', this.currentActiveType + item)
      this.visible = false
    },
    clearIcon() {
      this.icon = ''
      this.$emit('input', '')
      this.visible = false
    }
  }
}
</script>

<style scoped>
.icon-selector-trigger { width: 40px; height: 32px; padding: 0; border: 0; background: transparent; cursor: pointer; color: inherit; }
.icon-selector-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; height: 220px; align-content: start; overflow-y: auto; }
.icon-selector-item { display: flex; align-items: center; justify-content: center; min-width: 0; height: 32px; padding: 4px; border: 1px solid #dcdfe6; background: white; cursor: pointer; color: #606266; }
.icon-selector-item:hover, .icon-selector-item.selected { color: #409eff; border-color: #409eff; }
.icon-selector >>> .el-input-group__append { padding: 0; }
</style>
