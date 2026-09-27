<template>
  <el-card :body-style="bodyStyle" class="content-wrap" shadow="never">
    <div v-if="title" slot="header" class="content-wrap__header">
      <span class="content-wrap__title">{{ title }}</span>
      <el-tooltip v-if="message" effect="dark" placement="right">
        <div slot="content" class="content-wrap__message">{{ message }}</div>
        <i class="el-icon-question content-wrap__icon" />
      </el-tooltip>
      <div class="content-wrap__header-right">
        <slot name="header" />
      </div>
    </div>
    <slot />
  </el-card>
</template>

<script>
/**
 * 内容包装卡片（Vue3 src/components/ContentWrap/src/ContentWrap.vue 的 Vue2 等价实现）
 * 属性与插槽与 Vue3 版本对齐：title / message / bodyStyle，default 与 header 插槽
 */
export default {
  name: 'ContentWrap',
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    bodyStyle: {
      type: Object,
      default: () => ({ padding: '10px', overflow: 'hidden' })
    }
  }
}
</script>

<style scoped>
.content-wrap {
  margin-bottom: 15px;
  border-radius: 4px;
}

.content-wrap__header {
  display: flex;
  align-items: center;
}

.content-wrap__title {
  font-size: 16px;
  font-weight: 700;
}

.content-wrap__icon {
  margin-left: 5px;
  font-size: 14px;
  color: #1890ff;
  cursor: help;
}

.content-wrap__message {
  max-width: 200px;
}

.content-wrap__header-right {
  flex-grow: 1;
  padding-left: 20px;
}
</style>
