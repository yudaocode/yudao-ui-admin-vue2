<template>
  <div class="app-container pms-knowledge-library">
    <doc-alert title="【PMS】知识库管理" url="https://doc.iocoder.cn/pms/kb/library/" />

    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="知识库名称" prop="name">
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入知识库名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['pms:kb:library:create']"
          type="primary"
          @click="openForm('create')"
        >新建知识库</el-button>
        <el-button
          v-hasPermi="['pms:kb:library:update']"
          plain
          type="primary"
          @click="openGroupForm"
        >新建分组</el-button>
        <el-button
          v-hasPermi="['pms:kb:library:update']"
          @click="openGroupManage"
        >管理分组</el-button>
      </el-form-item>
    </el-form>

    <el-tabs v-model="activeGroupId" @tab-click="handleGroupQuery">
      <el-tab-pane
        v-for="group in groupList"
        :key="group.id"
        :label="group.name + '（' + (group.libraryCount == null ? 0 : group.libraryCount) + '）'"
        :name="String(group.id)"
      />
    </el-tabs>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      border
      stripe
    >
      <el-table-column label="知识库" min-width="260">
        <template slot-scope="scope">
          <div class="library-info">
            <el-image class="library-cover" fit="cover" :src="scope.row.coverUrl">
              <div slot="error" class="library-cover-placeholder">
                <i class="el-icon-notebook-2" />
              </div>
            </el-image>
            <div class="library-text">
              <el-link type="primary" @click="openDetail(scope.row.id)">
                {{ scope.row.name }}
              </el-link>
              <div class="library-description">{{ scope.row.description || '暂无简介' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="可见范围" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.openStatus ? 'success' : 'info'">
            {{ scope.row.openStatus ? '公开' : '私有' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="成员" prop="memberCount" width="90" />
      <el-table-column align="center" label="文档数" prop="documentCount" width="90" />
      <el-table-column align="center" label="文件数" prop="fileCount" width="90" />
      <el-table-column label="创建人" prop="creatorUserName" width="120" />
      <el-table-column
        :formatter="dateFormatter"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="是否关注" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.favoriteStatus"
            @change="handleFavoriteStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="280">
        <template slot-scope="scope">
          <div class="library-actions">
            <el-dropdown
              v-if="scope.row.writeStatus"
              v-hasPermi="['pms:kb:library:update']"
              trigger="click"
              @command="handleMoveGroup(scope.row.id, $event)"
            >
              <el-button type="text">移动分组</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="group in moveTargetGroupList"
                  :key="group.id"
                  :command="group.id"
                >{{ group.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button
              v-if="scope.row.adminStatus"
              v-hasPermi="['pms:kb:library:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-if="scope.row.creatorUserId === currentUserId"
              v-hasPermi="['pms:kb:library:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-if="scope.row.exitStatus"
              type="text"
              class="danger-text"
              @click="handleExit(scope.row)"
            >退出</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />

    <!-- 新建或修改知识库 -->
    <knowledge-library-form ref="form" @success="getList" />
    <!-- 新建知识库分组 -->
    <knowledge-group-form ref="groupForm" @success="handleGroupsChanged" />
    <!-- 管理知识库分组 -->
    <knowledge-group-manage-dialog ref="groupManage" @success="handleGroupsChanged" />
  </div>
</template>

<script>
import * as KnowledgeFavoriteApi from '@/api/pms/kb/interaction/favorite'
import * as KnowledgeGroupApi from '@/api/pms/kb/library/group'
import * as KnowledgeLibraryApi from '@/api/pms/kb/library'
import * as KnowledgeLibraryMemberApi from '@/api/pms/kb/library/member'
import { getCurrentUserId } from '@/utils/auth'
import { dateFormatter } from '@/utils/formatTime'
import { PmsKnowledgeGroupType, PmsKnowledgeObjectType } from '@/views/pms/kb/utils/constants'
import KnowledgeGroupForm from './KnowledgeGroupForm.vue'
import KnowledgeGroupManageDialog from './KnowledgeGroupManageDialog.vue'
import KnowledgeLibraryForm from './KnowledgeLibraryForm.vue'

export default {
  name: 'PmsKnowledgeLibrary',
  components: { KnowledgeGroupForm, KnowledgeGroupManageDialog, KnowledgeLibraryForm },
  data() {
    return {
      currentUserId: getCurrentUserId(),
      loading: true,
      total: 0,
      list: [],
      groupList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        groupId: undefined
      }
    }
  },
  computed: {
    activeGroupId: {
      get() {
        return this.queryParams.groupId == null ? '' : String(this.queryParams.groupId)
      },
      set(value) {
        this.queryParams.groupId = value === '' ? undefined : Number(value)
      }
    },
    moveTargetGroupList() {
      return this.groupList.filter(group => group.type !== PmsKnowledgeGroupType.ALL)
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    dateFormatter,
    async initPage() {
      await this.getGroupList()
      await this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeLibraryApi.getKnowledgeLibraryPage(this.queryParams)
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    handleGroupQuery(tab) {
      this.queryParams.groupId = Number(tab.name)
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    openGroupForm() {
      this.$refs.groupForm.open('create')
    },
    openGroupManage() {
      this.$refs.groupManage.open()
    },
    openDetail(id) {
      this.$router.push('/pms/kb/library/' + id)
    },
    async handleDelete(library) {
      try {
        await this.$modal.confirm('确认删除知识库“' + library.name + '”吗？')
        await KnowledgeLibraryApi.deleteKnowledgeLibrary(library.id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消时不改变列表。
      }
    },
    async handleExit(library) {
      try {
        await this.$modal.confirm(
          '确认退出知识库“' + library.name + '”吗？退出后将无法访问私有内容。'
        )
        await KnowledgeLibraryMemberApi.exitKnowledgeLibrary(library.id)
        this.$modal.msgSuccess('已退出知识库')
        await this.getGroupList()
        await this.getList()
      } catch (error) {
        // 用户取消时不改变列表。
      }
    },
    async handleFavoriteStatusChange(library) {
      try {
        const text = library.favoriteStatus ? '关注' : '取消关注'
        await this.$modal.confirm('确认' + text + '知识库“' + library.name + '”吗？')
        if (library.favoriteStatus) {
          await KnowledgeFavoriteApi.createKnowledgeFavorite({
            type: PmsKnowledgeObjectType.LIBRARY,
            entityId: library.id
          })
        } else {
          await KnowledgeFavoriteApi.deleteKnowledgeFavorite(
            PmsKnowledgeObjectType.LIBRARY,
            library.id
          )
        }
        await this.getList()
      } catch (error) {
        library.favoriteStatus = !library.favoriteStatus
      }
    },
    async getGroupList() {
      const response = await KnowledgeGroupApi.getKnowledgeGroupList()
      this.groupList = response.data
      if (!this.groupList.some(group => group.id === this.queryParams.groupId)) {
        this.queryParams.groupId = this.groupList.length ? this.groupList[0].id : undefined
      }
    },
    async handleMoveGroup(libraryId, groupId) {
      await KnowledgeGroupApi.moveKnowledgeLibraryToGroup(libraryId, groupId)
      this.$modal.msgSuccess('移动成功')
      await this.getGroupList()
      await this.getList()
    },
    async handleGroupsChanged() {
      await this.getGroupList()
      await this.getList()
    }
  }
}
</script>

<style scoped>
.library-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.library-cover,
.library-cover-placeholder {
  width: 64px;
  height: 44px;
  border-radius: 4px;
}

.library-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #f5f7fa;
}

.library-text {
  min-width: 0;
}

.library-description {
  max-width: 360px;
  overflow: hidden;
  color: #909399;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.library-actions .el-button,
.library-actions .el-dropdown {
  margin: 0;
}

.danger-text {
  color: #f56c6c;
}
</style>
