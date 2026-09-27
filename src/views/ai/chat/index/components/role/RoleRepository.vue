<template>
  <el-container class="role-repository">
    <chat-role-form ref="form" @success="getActiveTabRole" />
    <el-main class="role-repository__main">
      <div class="role-repository__query">
        <el-input
          v-model="search"
          clearable
          placeholder="请输入搜索的内容"
          prefix-icon="el-icon-search"
          @change="getActiveTabRole"
        />
        <el-button v-if="activeTab === 'my-role'" type="primary" @click="handleAddRole">
          <i class="el-icon-user" />
          添加角色
        </el-button>
      </div>

      <el-tabs v-model="activeTab" class="role-repository__tabs" @tab-click="handleTabClick">
        <el-tab-pane label="我的角色" name="my-role">
          <role-list
            :loading="loading"
            :role-list="myRoleList"
            show-more
            @on-delete="handleCardDelete"
            @on-edit="handleCardEdit"
            @on-use="handleCardUse"
            @on-page="handleCardPage('my')"
          />
        </el-tab-pane>
        <el-tab-pane label="公共角色" name="public-role">
          <role-category-list
            :category-list="categoryList"
            :active="activeCategory"
            @on-category-click="handleCategoryClick"
          />
          <role-list
            :loading="loading"
            :role-list="publicRoleList"
            @on-use="handleCardUse"
            @on-page="handleCardPage('public')"
          />
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import RoleList from './RoleList.vue'
import RoleCategoryList from './RoleCategoryList.vue'
import ChatRoleForm from '@/views/ai/model/chatRole/ChatRoleForm.vue'
import { ChatRoleApi } from '@/api/ai/model/chatRole'
import { ChatConversationApi } from '@/api/ai/chat/conversation'

export default {
  name: 'AiChatRoleRepository',
  components: { ChatRoleForm, RoleList, RoleCategoryList },
  data() {
    return {
      loading: false,
      activeTab: 'my-role',
      search: '',
      myRoleParams: { pageNo: 1, pageSize: 50 },
      publicRoleParams: { pageNo: 1, pageSize: 50 },
      myRoleList: [],
      publicRoleList: [],
      activeCategory: '全部',
      categoryList: []
    }
  },
  async mounted() {
    await this.getRoleCategoryList()
    await this.getActiveTabRole()
  },
  methods: {
    async handleTabClick(tab) {
      this.activeTab = tab.name
      await this.getActiveTabRole()
    },
    async getMyRole(append) {
      const response = await ChatRoleApi.getMyPage(Object.assign({}, this.myRoleParams, {
        name: this.search,
        publicStatus: false
      }))
      const { list } = response.data
      if (append) {
        this.myRoleList.push.apply(this.myRoleList, list)
      } else {
        this.myRoleList = list
      }
    },
    async getPublicRole(append) {
      const response = await ChatRoleApi.getMyPage(Object.assign({}, this.publicRoleParams, {
        category: this.activeCategory === '全部' ? '' : this.activeCategory,
        name: this.search,
        publicStatus: true
      }))
      const { list } = response.data
      if (append) {
        this.publicRoleList.push.apply(this.publicRoleList, list)
      } else {
        this.publicRoleList = list
      }
    },
    async getActiveTabRole() {
      if (this.activeTab === 'my-role') {
        this.myRoleParams.pageNo = 1
        await this.getMyRole(false)
      } else {
        this.publicRoleParams.pageNo = 1
        await this.getPublicRole(false)
      }
    },
    async getRoleCategoryList() {
      const data = (await ChatRoleApi.getCategoryList()).data
      this.categoryList = ['全部'].concat(data)
    },
    async handleCategoryClick(category) {
      this.activeCategory = category
      await this.getActiveTabRole()
    },
    handleAddRole() {
      this.$refs.form.open('my-create', null, '添加角色')
    },
    handleCardEdit(role) {
      this.$refs.form.open('my-update', role.id, '编辑角色')
    },
    async handleCardDelete(role) {
      await ChatRoleApi.deleteMy(role.id)
      await this.getActiveTabRole()
    },
    async handleCardPage(type) {
      this.loading = true
      try {
        if (type === 'public') {
          this.publicRoleParams.pageNo += 1
          await this.getPublicRole(true)
        } else {
          this.myRoleParams.pageNo += 1
          await this.getMyRole(true)
        }
      } finally {
        this.loading = false
      }
    },
    async handleCardUse(role) {
      // 1. 创建对话
      const conversationId = (await ChatConversationApi.createChatConversationMy({ roleId: role.id })).data
      // 2. 关闭当前标签页并跳转到新对话
      this.$store.dispatch('tagsView/delView', this.$route)
      await this.$router.replace({ name: 'AiChat', query: { conversationId } })
    }
  }
}
</script>

<style lang="scss" scoped>
.role-repository {
  height: calc(100vh - 110px);
  margin-top: -20px;
  background: #fff;
}

.role-repository__main {
  position: relative;
  min-width: 0;
  padding: 0;
  overflow: hidden;
}

.role-repository__query {
  position: absolute;
  z-index: 2;
  top: 4px;
  right: 10px;
  display: flex;
  gap: 10px;

  .el-input { width: 240px; }
}

.role-repository__tabs {
  height: 100%;

  ::v-deep .el-tabs__content,
  ::v-deep .el-tab-pane {
    height: calc(100% - 28px);
  }

  ::v-deep .el-tabs__header { margin: 0; }
}

::v-deep .role-category-list { padding: 12px; }
</style>
