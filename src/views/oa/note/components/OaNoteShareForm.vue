<template>
  <!-- 笔记共享设置，独立于内容编辑 -->
  <Dialog title="共享笔记" v-model="dialogVisible" width="600px">
    <el-form v-loading="formLoading" label-width="80px">
      <el-form-item label="笔记标题">{{ title }}</el-form-item>
      <el-form-item label="共享给">
        <user-select-v2 v-model="receiverUserIds" multiple placeholder="请选择共享接收人" />
      </el-form-item>
      <div class="share-tip">清空接收人后保存，将取消这篇笔记的全部共享。</div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as NoteApi from '@/api/oa/note'
import Dialog from '@/components/Dialog'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

export default {
  name: 'OaNoteShareForm',
  components: { Dialog, UserSelectV2 },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      noteId: undefined,
      title: '',
      receiverUserIds: []
    }
  },
  methods: {
    /** 打开共享表单 */
    open(id) {
      this.dialogVisible = true
      this.noteId = undefined
      this.title = ''
      this.receiverUserIds = []
      this.formLoading = true
      // 获取最新共享关系，不使用列表中的旧接收人
      NoteApi.getNote(id).then(response => {
        const note = response.data
        this.noteId = id
        this.title = note.title
        this.receiverUserIds = note.receiverUserIds || []
      }).finally(() => {
        this.formLoading = false
      })
    },
    /** 保存共享设置 */
    submitForm() {
      if (this.formLoading || this.noteId === undefined) return
      this.formLoading = true
      // 仅提交接收人，避免覆盖笔记正文和其他字段
      NoteApi.updateNoteShare(this.noteId, this.receiverUserIds).then(() => {
        this.$modal.msgSuccess('共享设置成功')
        this.dialogVisible = false
        this.$emit('success')
      }).finally(() => {
        this.formLoading = false
      })
    }
  }
}
</script>

<style scoped>
.share-tip {
  font-size: 13px;
  color: #909399;
}
</style>
