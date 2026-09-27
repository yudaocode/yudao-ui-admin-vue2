<template>
  <!-- 笔记详情 -->
  <Dialog title="笔记详情" v-model="dialogVisible" width="800px">
    <div v-loading="loading">
      <el-descriptions v-if="note" :column="1" border class="note-detail">
        <el-descriptions-item label="笔记标题">{{ note.title }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ note.creatorUserName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(note.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="笔记目录">{{ note.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="笔记类型">
          <dict-tag :type="DICT_TYPE.OA_NOTE_TYPE" :value="note.type" />
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <dict-tag :type="DICT_TYPE.OA_PRIORITY" :value="note.priority" />
        </el-descriptions-item>
        <el-descriptions-item label="共享给">
          {{ note.receiverUserNames && note.receiverUserNames.join('、') }}
        </el-descriptions-item>
        <el-descriptions-item label="笔记内容">
          <div v-dompurify-html="note.content || ''" class="content-html" />
        </el-descriptions-item>
        <el-descriptions-item label="附件">
          <el-link
            v-for="(url, index) in note.fileUrls"
            :key="url"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            type="primary"
            class="file-link"
          >附件 {{ index + 1 }}</el-link>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </Dialog>
</template>

<script>
import * as NoteApi from '@/api/oa/note'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaNoteDetail',
  components: { Dialog },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      note: undefined
    }
  },
  methods: {
    formatDate,
    /** 打开笔记详情 */
    open(id) {
      this.dialogVisible = true
      this.note = undefined
      this.loading = true
      // 查询详情，由后端校验当前用户是否有权访问
      NoteApi.getNote(id).then(response => {
        this.note = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.note-detail {
  ::v-deep .el-descriptions__table {
    table-layout: fixed;
  }

  ::v-deep .el-descriptions__label {
    width: 100px;
    white-space: nowrap;
  }

  ::v-deep .el-descriptions__content {
    overflow-wrap: anywhere;
  }
}

.content-html {
  min-height: 120px;
}

.file-link {
  margin-right: 10px;
}
</style>
