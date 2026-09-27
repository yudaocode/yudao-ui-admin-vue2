<template>
  <div class="role-category-list">
    <el-button
      v-for="category in categoryList"
      :key="category"
      plain
      round
      size="mini"
      :type="category === active ? 'primary' : 'default'"
      @click="$emit('on-category-click', category)"
    >
      {{ category }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'AiChatRoleCategoryList',
  props: {
    categoryList: {
      type: Array,
      required: true
    },
    active: {
      type: String,
      default: '全部'
    }
  }
}
</script>

<style scoped>
.role-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-category-list .el-button + .el-button {
  margin-left: 0;
}
</style>
