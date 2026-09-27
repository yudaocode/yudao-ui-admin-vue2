<template>
  <div ref="list" class="role-list" v-loading="loading" @scroll="handleScroll">
    <el-empty v-if="!loading && roleList.length === 0" description="暂无角色" :image-size="72" />
    <el-card v-for="role in roleList" :key="role.id" class="role-card" shadow="hover">
      <el-dropdown
        v-if="showMore"
        class="role-card__more"
        trigger="click"
        @command="handleMoreClick"
      >
        <el-button type="text" icon="el-icon-more" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="['edit', role]" icon="el-icon-edit">编辑</el-dropdown-item>
          <el-dropdown-item :command="['delete', role]" icon="el-icon-delete" class="is-danger">
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-avatar :size="44" shape="square" :src="role.avatar || defaultAvatar" />
      <div class="role-card__body">
        <div class="role-card__name">{{ role.name }}</div>
        <div class="role-card__description">{{ role.description || '暂无描述' }}</div>
        <div class="role-card__footer">
          <el-button type="primary" size="mini" @click="$emit('on-use', role)">使用</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AiChatRoleList',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    roleList: {
      type: Array,
      required: true
    },
    showMore: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { defaultAvatar: require('@/assets/images/profile.jpg') }
  },
  methods: {
    handleMoreClick(command) {
      this.$emit(command[0] === 'delete' ? 'on-delete' : 'on-edit', command[1])
    },
    handleScroll() {
      const element = this.$refs.list
      if (!element || this.loading) return
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 20) {
        this.$emit('on-page')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.role-list {
  display: grid;
  align-content: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  height: 100%;
  padding: 14px 12px 120px;
  overflow-y: auto;
}

.role-card {
  position: relative;
  min-width: 0;

  ::v-deep .el-card__body {
    display: flex;
    min-height: 126px;
    padding: 16px;
  }
}

.role-card__more {
  position: absolute;
  top: 3px;
  right: 10px;
}

.role-card__body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  margin-left: 12px;
}

.role-card__name {
  padding-right: 24px;
  overflow: hidden;
  color: #303133;
  font-size: 17px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-card__description {
  display: -webkit-box;
  min-height: 40px;
  margin-top: 8px;
  overflow: hidden;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.role-card__footer {
  margin-top: auto;
  text-align: right;
}

@media (max-width: 720px) {
  .role-list { grid-template-columns: 1fr; }
}
</style>

<style>
.el-dropdown-menu__item.is-danger { color: #f56c6c; }
</style>
