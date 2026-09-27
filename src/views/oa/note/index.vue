<template>
  <el-row :gutter="20" class="app-container oa-note">
    <!-- 左侧分类和类型导航 -->
    <el-col :span="4" :xs="24">
      <oa-note-sidebar
        :categories="categoryList"
        :category-id="queryParams.categoryId"
        :type="queryParams.type"
        @category-select="handleCategorySelect"
        @type-select="handleTypeSelect"
        @manage="handleManageCategory"
      />
    </el-col>
    <el-col :span="20" :xs="24">
      <!-- 搜索 -->
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
        label-width="68px"
        @submit.native.prevent
      >
        <el-form-item label="笔记场景">
          <el-radio-group v-model="activeScene" @change="handleSceneChange">
            <el-radio-button :label="OA_NOTE_SCENE_TYPE.MINE">我的笔记</el-radio-button>
            <el-radio-button :label="OA_NOTE_SCENE_TYPE.SHARED">共享给我</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入笔记标题"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="queryParams.priority"
            placeholder="请选择优先级"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in priorityOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="queryParams.createTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="收藏" prop="favorite">
          <el-select
            v-model="queryParams.favorite"
            placeholder="请选择收藏状态"
            clearable
            style="width: 240px"
          >
            <el-option label="已收藏" :value="true" />
            <el-option label="未收藏" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            v-hasPermi="['oa:note:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <div v-if="activeScene === OA_NOTE_SCENE_TYPE.MINE" class="batch-bar">
        <el-button
          v-hasPermi="['oa:note:delete']"
          type="danger"
          plain
          size="small"
          :disabled="!selectedIds.length || loading || deleteLoading"
          icon="el-icon-delete"
          @click="handleDeleteList"
        >批量删除</el-button>
      </div>
      <el-table
        v-loading="loading || deleteLoading"
        :data="list"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="activeScene === OA_NOTE_SCENE_TYPE.MINE"
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column label="收藏" width="80" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              :class="{ 'favorite-text': scope.row.favorite }"
              @click="handleFavorite(scope.row)"
            >{{ scope.row.favorite ? '已收藏' : '收藏' }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" class="link-button" @click="openDetail(scope.row.id)">
              {{ scope.row.title }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="目录" prop="categoryName" align="center" width="120" />
        <el-table-column label="类型" align="center" width="100">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_NOTE_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="优先级" align="center" width="90">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_PRIORITY" :value="scope.row.priority" />
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="creatorUserName" align="center" width="120" />
        <el-table-column label="共享给" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ (scope.row.receiverUserNames && scope.row.receiverUserNames.join('、')) || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          :formatter="dateFormatter"
          align="center"
          width="180"
        />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <template v-if="activeScene === OA_NOTE_SCENE_TYPE.MINE">
              <el-button
                v-hasPermi="['oa:note:update']"
                type="text"
                size="mini"
                @click="openForm('update', scope.row.id)"
              >修改</el-button>
              <el-button
                v-hasPermi="['oa:note:delete']"
                type="text"
                size="mini"
                class="danger-text"
                @click="handleDelete(scope.row.id)"
              >删除</el-button>
              <el-button
                v-hasPermi="['oa:note:update']"
                type="text"
                size="mini"
                @click="$refs.shareFormRef.open(scope.row.id)"
              >共享</el-button>
            </template>
            <el-button
              v-else
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDeleteReceived(scope.row.id)"
            >移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-col>

    <!-- 笔记表单与目录管理 -->
    <oa-note-detail ref="detailRef" />
    <oa-note-share-form ref="shareFormRef" @success="getList" />
    <oa-note-form ref="formRef" @success="getList" />
    <oa-note-category-list ref="categoryDialogRef" @success="handleCategoryChange" />
  </el-row>
</template>

<script>
import * as NoteApi from '@/api/oa/note'
import * as NoteCategoryApi from '@/api/oa/note/category'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaNoteForm from './OaNoteForm.vue'
import OaNoteShareForm from './components/OaNoteShareForm.vue'
import OaNoteSidebar from './components/OaNoteSidebar.vue'
import OaNoteDetail from './components/OaNoteDetail.vue'
import OaNoteCategoryList from './components/OaNoteCategoryList.vue'
import { OA_NOTE_SCENE_TYPE, OA_PRIORITY } from '../utils/constants-collab'

export default {
  name: 'OaNote',
  components: { OaNoteForm, OaNoteShareForm, OaNoteSidebar, OaNoteDetail, OaNoteCategoryList },
  data() {
    return {
      DICT_TYPE,
      OA_NOTE_SCENE_TYPE,
      loading: true,
      deleteLoading: false,
      total: 0,
      list: [],
      categoryList: [],
      selectedIds: [],
      activeScene: OA_NOTE_SCENE_TYPE.MINE,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        categoryId: undefined,
        type: undefined,
        priority: undefined,
        favorite: undefined,
        createTime: []
      }
    }
  },
  computed: {
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY).filter(item => item.value <= OA_PRIORITY.IMPORTANT)
    }
  },
  created() {
    this.getCategoryList()
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.selectedIds = []
      this.loading = true
      const getPage = this.activeScene === OA_NOTE_SCENE_TYPE.MINE
        ? NoteApi.getMyNotePage
        : NoteApi.getReceivedNotePage
      return getPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    getCategoryList() {
      return NoteCategoryApi.getNoteCategoryList().then(response => {
        this.categoryList = response.data
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 切换左侧分类 */
    handleCategorySelect(index) {
      // 目录属于本人，选择目录时回到我的笔记；最近展示当前场景全部目录。
      this.queryParams.categoryId = index === 'all' ? undefined : Number(index)
      if (this.queryParams.categoryId !== undefined) {
        this.activeScene = OA_NOTE_SCENE_TYPE.MINE
      }
      return this.handleQuery()
    },
    /** 切换左侧笔记类型 */
    handleTypeSelect(index) {
      this.queryParams.type = index === 'all' ? undefined : Number(index)
      return this.handleQuery()
    },
    /** 切换笔记场景 */
    handleSceneChange() {
      this.queryParams.categoryId = undefined
      return this.handleQuery()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.activeScene = OA_NOTE_SCENE_TYPE.MINE
      this.queryParams.categoryId = undefined
      this.queryParams.type = undefined
      return this.handleQuery()
    },
    handleManageCategory() {
      this.$refs.categoryDialogRef.open()
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, id, this.queryParams.categoryId)
    },
    openDetail(id) {
      this.$refs.detailRef.open(id)
    },
    /** 修改收藏状态 */
    handleFavorite(note) {
      if (!note.id) return
      return NoteApi.updateNoteFavorite(note.id, !note.favorite).then(() => {
        return this.getList()
      })
    },
    /** 表格多选变更 */
    handleSelectionChange(notes) {
      this.selectedIds = notes.map(note => note.id).filter(id => id !== undefined)
    },
    /** 批量删除本人笔记，单条失败不阻断其他条目 */
    handleDeleteList() {
      if (this.deleteLoading || !this.selectedIds.length) return
      const ids = [...this.selectedIds]
      return this.$modal.confirm(
        '确认处理选中的 ' + ids.length + ' 条笔记？共享笔记仅退出本人访问，其他笔记将被删除。'
      ).then(() => {
        this.deleteLoading = true
        return Promise.allSettled(ids.map(id => NoteApi.deleteNote(id)))
      }).then(results => {
        const successCount = results.filter(result => result.status === 'fulfilled').length
        const failedCount = results.length - successCount
        if (failedCount) {
          this.$modal.msgWarning('删除成功 ' + successCount + ' 条，失败 ' + failedCount + ' 条')
        } else {
          this.$modal.msgSuccess('删除成功 ' + successCount + ' 条')
        }
        return this.getList()
      }).catch(() => {}).finally(() => {
        this.deleteLoading = false
      })
    },
    /** 删除笔记 */
    handleDelete(id) {
      return this.$modal.confirm(
        '共享笔记仅退出本人访问，其他接收人仍可查看；非共享笔记将被删除，是否继续？'
      ).then(() => {
        return NoteApi.deleteNote(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    /** 移除收到的共享笔记 */
    handleDeleteReceived(id) {
      return this.$modal.confirm('确认移除这条共享笔记？笔记正文和其他接收人不受影响。').then(() => {
        return NoteApi.deleteReceivedNote(id)
      }).then(() => {
        this.$modal.msgSuccess('移除成功')
        return this.getList()
      }).catch(() => {})
    },
    /** 目录修改成功 */
    handleCategoryChange() {
      return this.getCategoryList().then(() => {
        this.queryParams.categoryId = undefined
        return this.handleQuery()
      })
    }
  }
}
</script>

<style scoped>
.batch-bar {
  margin-bottom: 12px;
}

.danger-text {
  color: #f56c6c;
}

.favorite-text {
  color: #e6a23c;
}
</style>
