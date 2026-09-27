<template>
  <el-card v-if="visible" shadow="never" :body-style="collapsed ? { padding: '0' } : undefined">
    <div slot="header" class="panel-header">
      <span>{{ title }}</span>
      <div class="panel-actions">
        <slot name="actions" />
        <el-button
          type="text"
          :aria-label="(collapsed ? '展开' : '收起') + title"
          @click="collapsed = !collapsed"
        >{{ collapsed ? '▼' : '▲' }}</el-button>
        <el-button type="text" :aria-label="'关闭' + title" @click="visible = false">✕</el-button>
      </div>
    </div>
    <div v-if="!collapsed"><slot /></div>
  </el-card>
</template>

<script>
export default {
  name: 'OaHomePanel',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      collapsed: false,
      visible: true
    }
  }
}
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-actions .el-button {
  margin-left: 0;
}
</style>
