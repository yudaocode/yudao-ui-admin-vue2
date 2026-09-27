<template>
  <div class="wm-migrated">
    <el-tooltip
      :disabled="!selectedItem"
      placement="top"
      :open-delay="500"
    >
      <template slot="content">
        <div
          v-if="selectedItem"
          class="tm-tool-type-tooltip"
        >
          <div>编码：{{ selectedItem.code || '-' }}</div>
          <div>名称：{{ selectedItem.name || '-' }}</div>
          <div>编码管理：{{ selectedItem.codeFlag ? '是' : '否' }}</div>
          <div>备注：{{ selectedItem.remark || '-' }}</div>
        </div>
      </template>
      <el-select
        v-bind="$attrs"
        v-model="selectValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :clearable="clearable"
        filterable
        :filter-method="handleFilter"
        class="wm-w-full"
        @change="handleChange"
      >
        <el-option
          v-for="item in filteredList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
          <div class="tm-tool-type-option">
            <span>{{ item.name }}</span>
            <el-tag
              v-if="item.code"
              size="small"
              type="info"
              class="tm-tool-type-code"
            >
              编号: {{ item.code }}
            </el-tag>
          </div>
        </el-option>
      </el-select>
    </el-tooltip>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, toRefs } from 'vue'
import { TmToolTypeApi } from '@/api/mes/tm/tool/type'
export default {
  name: 'TmToolTypeSelect',
  inheritAttrs: false,
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: { 'modelValue': { type: Number }, 'disabled': { type: Boolean, default: false }, 'clearable': { type: Boolean, default: true }, 'placeholder': { type: String, default: '请选择工具类型' }},
  setup(props, { emit }) {
    const allList = ref([])
    const filteredList = ref([])
    const selectedItem = ref() // 当前选中的类型对象（用于 tooltip 展示）
    const selectValue = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })
    /** 前端过滤（name + code） */
    const handleFilter = (query) => {
      if (!query) {
        filteredList.value = allList.value
        return
      }
      const keyword = query.toLowerCase()
      filteredList.value = allList.value.filter((item) => { var _a, _b; return ((_a = item.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(keyword)) || ((_b = item.code) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(keyword)) })
    }
    /** 选中变化 */
    const handleChange = (val) => {
      const item = allList.value.find((o) => o.id === val)
      selectedItem.value = item
      emit('change', item)
    }
    /** 根据 modelValue 同步 selectedItem（用于编辑回显） */
    watch(() => props.modelValue, (val) => {
      var _a
      if (val == null) {
        selectedItem.value = undefined
        return
      }
      if (((_a = selectedItem.value) === null || _a === void 0 ? void 0 : _a.id) !== val && allList.value.length > 0) {
        selectedItem.value = allList.value.find((o) => o.id === val)
      }
    })
    /** 加载工具类型列表 */
    onMounted(async() => {
      allList.value = (await TmToolTypeApi.getToolTypeSimpleList()).data
      filteredList.value = allList.value
      // 列表加载完成后，回显 selectedItem
      if (props.modelValue != null) {
        selectedItem.value = allList.value.find((o) => o.id === props.modelValue)
      }
    })
    return { ...toRefs(props), allList, filteredList, handleChange, handleFilter, selectValue, selectedItem }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
.tm-tool-type-tooltip { line-height: 1.5rem; }
.tm-tool-type-option { display: flex; align-items: center; gap: 8px; }
.tm-tool-type-code { margin-left: 4px; }
</style>
