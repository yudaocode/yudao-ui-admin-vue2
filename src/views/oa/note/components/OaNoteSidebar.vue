<template>
  <div class="oa-note-sidebar">
    <!-- 分类导航 -->
    <div class="sidebar-header">
      <span>分类</span>
      <el-button type="text" @click="$emit('manage')">管理分类</el-button>
    </div>
    <el-menu
      class="sidebar-menu"
      :default-active="String(categoryId === undefined ? 'all' : categoryId)"
      aria-label="笔记分类"
      @select="handleCategorySelect"
    >
      <el-menu-item index="all" class="sidebar-menu-item">最近</el-menu-item>
      <el-menu-item
        v-for="category in categories"
        :key="category.id"
        :index="String(category.id)"
        class="sidebar-menu-item"
      >
        <span class="truncate" :title="category.name">{{ category.name }}</span>
      </el-menu-item>
    </el-menu>

    <!-- 类型导航，与分类组合筛选 -->
    <el-divider class="sidebar-divider" />
    <div class="sidebar-section-title">类型</div>
    <el-menu
      class="sidebar-menu"
      :default-active="String(type === undefined ? 'all' : type)"
      aria-label="笔记类型"
      @select="handleTypeSelect"
    >
      <el-menu-item index="all" class="sidebar-menu-item">全部类型</el-menu-item>
      <el-menu-item
        v-for="dict in typeOptions"
        :key="dict.value"
        :index="String(dict.value)"
        class="sidebar-menu-item"
      >{{ dict.label }}</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

export default {
  name: 'OaNoteSidebar',
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    categoryId: {
      type: Number,
      default: undefined
    },
    type: {
      type: Number,
      default: undefined
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_NOTE_TYPE)
    }
  },
  methods: {
    /** 切换分类 */
    handleCategorySelect(index) {
      this.$emit('category-select', index)
    },
    /** 切换类型 */
    handleTypeSelect(index) {
      this.$emit('type-select', index)
    }
  }
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
}

.sidebar-menu {
  border-right: 0;
}

.sidebar-menu-item {
  height: 40px;
  margin: 4px 0;
  padding: 0 12px;
  line-height: 40px;
  border-radius: 4px;
}

.sidebar-menu-item.is-active {
  background-color: #ecf5ff;
  font-weight: 600;
}

.sidebar-divider {
  margin: 16px 0;
}

.sidebar-section-title {
  margin-bottom: 12px;
  font-weight: 600;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
