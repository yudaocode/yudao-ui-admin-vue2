<template>
  <div
    ref="contentDetailWrap"
    class="content-detail-wrap-container"
  >
    <Sticky :offset="offset">
      <div class="content-detail-wrap-header">
        <div class="content-detail-wrap-header__back">
          <el-button @click="$emit('back')">
            <i class="el-icon-back content-detail-wrap-header__back-icon" />
            返回
          </el-button>
        </div>
        <div class="content-detail-wrap-header__title">
          <slot name="title">
            <label class="content-detail-wrap-header__title-label">{{ title }}</label>
          </slot>
        </div>
        <div class="content-detail-wrap-header__right">
          <slot name="right" />
        </div>
      </div>
    </Sticky>
    <div class="content-detail-wrap-body-wrapper">
      <el-card
        class="content-detail-wrap-body"
        shadow="never"
      >
        <slot />
      </el-card>
    </div>
  </div>
</template>

<script>
/**
 * 详情页包装（Vue3 src/components/ContentDetailWrap/src/ContentDetailWrap.vue 的 Vue2 等价实现）
 * 属性与插槽与 Vue3 版本对齐：title / message，back 事件，title / right / default 插槽
 */
export default {
  name: 'ContentDetailWrap',
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      offset: 85
    }
  },
  mounted() {
    this.offset = this.$refs.contentDetailWrap.getBoundingClientRect().top
  }
}
</script>

<style scoped>
.content-detail-wrap-header {
  display: flex;
  align-items: center;
  height: 50px;
  text-align: center;
  background: #fff;
  border-bottom: 1px solid #dfe6ec;
  padding-right: 10px;
}

.content-detail-wrap-header__back {
  display: flex;
  padding: 0 10px;
}

.content-detail-wrap-header__back-icon {
  margin-right: 5px;
}

.content-detail-wrap-header__title {
  flex: 1;
  display: flex;
  justify-content: center;
}

.content-detail-wrap-header__title-label {
  font-size: 16px;
  font-weight: 700;
}

.content-detail-wrap-header__right {
  display: flex;
  padding: 0 10px;
}

.content-detail-wrap-body-wrapper {
  padding: 15px;
}

.content-detail-wrap-body {
  margin-bottom: 20px;
}
</style>
