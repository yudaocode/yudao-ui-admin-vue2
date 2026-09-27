<template>
  <div class="mail-compose">
    <!-- 写信操作 -->
    <div class="mail-compose__toolbar">
      <span class="mail-compose__title">{{ formData.draftId ? '编辑草稿' : '写信' }}</span>
      <div>
        <el-button type="primary" size="small" :loading="formLoading" @click="submitForm">发送</el-button>
        <el-button size="small" :disabled="formLoading" @click="handleSaveDraft">存草稿</el-button>
        <el-button
          v-if="formData.draftId"
          type="danger"
          plain
          size="small"
          :disabled="formLoading"
          @click="handleDelete"
        >
          删除
        </el-button>
        <el-button size="small" :disabled="formLoading" @click="handleClose">关闭</el-button>
      </div>
    </div>
    <!-- 写信表单 -->
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      label-width="80px"
      class="mail-compose__form"
    >
      <el-form-item label="收件人" prop="recipients">
        <mail-address-select v-model="formData.recipients" />
      </el-form-item>
      <el-form-item label="抄送人" prop="ccs">
        <mail-address-select v-model="formData.ccs" />
      </el-form-item>
      <el-form-item label="主题" prop="subject">
        <el-input v-model="formData.subject" placeholder="请输入主题" maxlength="65535" />
      </el-form-item>
      <el-form-item label="附件">
        <div class="mail-compose__attachments">
          <div
            v-for="attachment in formData.attachments || []"
            :key="attachment.part"
            class="mail-compose__attachment"
          >
            <span>{{ attachment.name }}</span>
            <el-button
              type="text"
              size="mini"
              class="danger-text"
              :disabled="formLoading"
              @click="removeAttachment(attachment.part)"
            >
              移除
            </el-button>
          </div>
          <el-upload
            :file-list="fileList"
            :auto-upload="false"
            multiple
            :disabled="formLoading"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button size="small" :disabled="formLoading">添加附件</el-button>
            <div slot="tip" class="el-upload__tip">单个文件不超过 16 MB，总请求不超过 32 MB</div>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="正文" prop="content">
        <div class="mail-compose__editor">
          <div class="mail-compose__word-count">{{ wordCount }} 字</div>
          <Editor
            ref="editor"
            v-model="formData.content"
            height="360px"
            @change="handleEditorChange"
          />
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as MessageApi from '@/api/oa/mail/message'
import MailAddressSelect from '../account/components/MailAddressSelect.vue'

export default {
  name: 'OaMailMessageForm',
  components: { MailAddressSelect },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formLoading: false, // 表单提交中
      fileList: [], // 本次新增附件
      wordCount: 0, // 正文字数（不计空白字符）
      formData: { ...this.data } // 表单数据
    }
  },
  created() {
    // 初始化正文字数
    this.$nextTick(() => {
      if (this.$refs.editor && this.$refs.editor.getEditorRef) {
        this.$refs.editor.getEditorRef().then(editor => {
          this.handleEditorChange(editor)
        })
      }
    })
  },
  methods: {
    /** 更新正文字数 */
    handleEditorChange(editor) {
      if (!editor || !editor.getText) return
      this.wordCount = Array.from(editor.getText().replace(/\s/g, '')).length
    },
    /** 本次新增附件变化 */
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
    },
    /** 移除草稿或转发邮件中不再保留的附件 */
    removeAttachment(part) {
      this.formData.attachments = (this.formData.attachments || []).filter(item => item.part !== part)
      this.formData.attachmentParts = (this.formData.attachments || []).map(item => item.part)
    },
    /** 正文与本次选择的文件一起提交，不预先上传到公共附件库 */
    buildFormData() {
      const data = new FormData()
      data.append('data', new Blob([JSON.stringify(this.formData)], { type: 'application/json' }))
      for (const file of this.fileList) {
        if (file.raw) data.append('files', file.raw, file.name)
      }
      return data
    },
    /** 发送邮件 */
    submitForm() {
      if (!this.formData.recipients || !this.formData.recipients.length) {
        this.$modal.msgWarning('请填写收件人')
        return Promise.resolve()
      }
      // 发送的二次确认
      return this.$modal.confirm('确认发送这封邮件？').then(() => {
        this.formLoading = true
        return MessageApi.sendMailMessage(this.buildFormData())
      }).then(result => {
        this.$modal.alert(result.data)
        // 发送操作成功的事件
        this.$emit('success')
      }).finally(() => {
        this.formLoading = false
      })
    },
    /** 保存草稿，保留返回编号供后续修改 */
    handleSaveDraft() {
      this.formLoading = true
      // 提交草稿并保留编号，后续保存更新同一封草稿
      return MessageApi.saveMailMessageDraft(this.buildFormData()).then(response => {
        this.formData.draftId = response.data
        this.fileList = []
        this.formData.attachmentParts = undefined
        return MessageApi.getMailMessageCompose(this.formData.draftId, 'draft')
      }).then(response => {
        this.formData = response.data
        this.$modal.msgSuccess('保存成功')
      }).finally(() => {
        this.formLoading = false
      })
    },
    /** 删除草稿 */
    handleDelete() {
      if (!this.formData.draftId) return Promise.resolve()
      // 删除的二次确认
      return this.$modal.confirm('确认将这封草稿移至已删除？').then(() => {
        this.formLoading = true
        return MessageApi.deleteMailMessage(this.formData.draftId)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.$emit('success')
      }).finally(() => {
        this.formLoading = false
      })
    },
    /** 关闭前确认，避免丢失未保存内容 */
    handleClose() {
      return this.$modal.confirm('确认关闭写信？未保存的内容将丢失。').then(() => {
        this.$emit('close')
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.mail-compose {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;

    .el-button + .el-button {
      margin-left: 8px;
    }
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
  }

  &__form {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }

  &__attachments {
    width: 100%;
  }

  &__attachment {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__editor {
    width: 100%;
  }

  &__word-count {
    margin-bottom: 8px;
    font-size: 12px;
    color: #909399;
    text-align: right;
  }

  .danger-text {
    color: #f56c6c;
  }
}
</style>
