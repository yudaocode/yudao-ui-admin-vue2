<template>
  <oa-home-panel title="我的笔记" v-loading="loading">
    <template slot="actions">
      <el-button type="text" @click="$router.push('/oa/note')">更多</el-button>
    </template>
    <div v-if="loadError" class="load-error">
      加载失败，
      <el-button type="text" @click="getList">重新加载</el-button>
    </div>
    <el-empty v-if="list.length === 0" :image-size="56" description="暂无笔记" />
    <div
      v-for="item in list"
      v-else
      :key="item.id"
      class="note-row"
    >
      <div class="note-main">
        <div class="note-title">{{ item.title }}</div>
        <div class="note-content">{{ item.content || '暂无内容' }}</div>
      </div>
      <span class="note-date">{{ formatDate(item.createTime, 'MM-DD') }}</span>
    </div>
    <div v-hasPermi="['oa:note:create']" class="quick-note">
      <el-input
        v-model="quickNote"
        maxlength="255"
        placeholder="输入笔记内容"
        @keyup.enter.native="createQuickNote"
      />
      <el-button :loading="saving" type="primary" @click="createQuickNote">添加</el-button>
    </div>
  </oa-home-panel>
</template>

<script>
import OaHomePanel from './OaHomePanel.vue'
import * as NoteApi from '@/api/oa/note'
import { formatDate } from '@/utils/formatTime'
import { OA_NOTE_TYPE, OA_PRIORITY } from '@/views/oa/utils/constants-collab'

export default {
  name: 'OaHomeNote',
  components: { OaHomePanel },
  data() {
    return {
      loading: false,
      loadError: false,
      list: [],
      quickNote: '',
      saving: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatDate,
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return NoteApi.getMyNotePage({ pageNo: 1, pageSize: 5 }).then(response => {
        this.list = response.data.list
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    },
    /** 新增快捷笔记 */
    createQuickNote() {
      if (this.saving) return Promise.resolve()
      const content = this.quickNote.trim()
      if (!content) {
        this.$modal.msgWarning('请输入笔记内容')
        return Promise.resolve()
      }
      if (content.length < 10) {
        this.$modal.msgWarning('笔记内容不能少于 10 个字')
        return Promise.resolve()
      }
      this.saving = true
      return NoteApi.createNote({
        type: OA_NOTE_TYPE.MINE,
        priority: OA_PRIORITY.NORMAL,
        title: content,
        content,
        fileUrls: []
      }).then(() => {
        this.$modal.msgSuccess('笔记添加成功')
        this.quickNote = ''
        return this.getList()
      }).finally(() => {
        this.saving = false
      })
    }
  }
}
</script>

<style scoped>
.load-error {
  margin-bottom: 12px;
  font-size: 13px;
  color: #f56c6c;
}

.note-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.note-main {
  flex: 1;
  min-width: 0;
}

.note-title {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-content {
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  color: #909399;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-date {
  font-size: 12px;
  color: #909399;
}

.quick-note {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
</style>
