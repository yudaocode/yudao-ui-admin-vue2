<template>
  <div class="user-card">
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="60">
          <svg-icon icon-class="ep:avatar" :size="60" />
        </el-avatar>
        <span class="user-name">芋道源码</span>
      </div>
      <svg-icon icon-class="tdesign:qrcode" :size="20" />
    </div>
    <div class="bind-mobile">
      <span class="bind-tip">点击绑定手机号</span>
      <span class="bind-button">去绑定</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    property: { type: Object, required: true }
  }
}
</script>

<style scoped lang="scss">
.user-card {
  display: flex;
  flex-direction: column;
}
.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 18px;
}
.user-info {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 16px;
}
.user-name {
  font-size: 18px;
  font-weight: bold;
}
.bind-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  font-size: 12px;
  background: #fff;
}
.bind-tip {
  color: #ff690d;
}
.bind-button {
  padding: 5px 8px;
  color: #fff;
  background: #ff6100;
  border-radius: 26px;
}
</style>

