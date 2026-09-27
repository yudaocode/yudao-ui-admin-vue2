<template>
  <el-dialog
    :title="'移动' + (contentKind === 'folder' ? '文件夹' : '文档')"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="当前内容">
        <el-input :value="contentTitle" disabled />
      </el-form-item>
      <el-form-item label="目标知识库" prop="targetLibraryId">
        <knowledge-library-select
          v-model="formData.targetLibraryId"
          class="full-width"
          placeholder="请选择目标知识库"
          @change="loadTargetTree"
        />
      </el-form-item>
      <el-form-item label="目标位置" prop="targetKey">
        <div class="target-tree-wrap">
          <el-tree
            v-if="targetOptions.length"
            :data="targetOptions"
            default-expand-all
            node-key="value"
            :expand-on-click-node="false"
            :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
            @node-click="handleTargetSelect"
          >
            <span slot-scope="{ data }" class="target-tree-node">
              <i :class="targetIcon(data)" />
              <span>{{ data.label }}</span>
              <el-tag v-if="formData.targetKey === data.value" size="mini">已选择</el-tag>
              <span v-if="data.disabled" class="disabled-text">无管理权限</span>
            </span>
          </el-tree>
          <el-empty v-else :image-size="60" description="暂无可选位置" />
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="loading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import * as KnowledgeFolderApi from '@/api/pms/kb/content/folder'
import KnowledgeLibrarySelect from '@/views/pms/kb/library/components/KnowledgeLibrarySelect.vue'
import { PmsKnowledgeRootId } from '@/views/pms/kb/utils/constants'
import { canManageKnowledgeContent } from '@/views/pms/kb/utils/permission'

export default {
  name: 'PmsKnowledgeContentMoveDialog',
  components: { KnowledgeLibrarySelect },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      contentKind: 'document',
      contentId: 0,
      contentTitle: '',
      sourceLibraryId: 0,
      sourceParentId: 0,
      sourceFolderId: 0,
      targetTree: undefined,
      formData: { targetLibraryId: undefined, targetKey: '' },
      formRules: {
        targetLibraryId: [{ required: true, message: '请选择目标知识库', trigger: 'change' }],
        targetKey: [{ required: true, message: '请选择目标位置', trigger: 'change' }]
      }
    }
  },
  computed: {
    targetOptions() {
      if (!this.targetTree) return []
      return [{
        value: 'root',
        label: '知识库根目录',
        kind: 'root',
        entityId: PmsKnowledgeRootId,
        folderId: PmsKnowledgeRootId,
        disabled: !this.targetTree.manageStatus,
        children: this.targetTree.folders.map(this.buildFolderOption).concat(
          this.contentKind === 'document'
            ? this.targetTree.documents.map(document => this.buildDocumentOption(document, 0))
            : []
        )
      }]
    }
  },
  methods: {
    async open(kind, content) {
      this.dialogVisible = true
      this.contentKind = kind
      this.contentId = content.id
      this.contentTitle = content.title
      this.sourceLibraryId = content.libraryId
      this.sourceParentId = content.parentId
      this.sourceFolderId = kind === 'document' ? content.folderId : PmsKnowledgeRootId
      this.formData.targetLibraryId = content.libraryId
      this.formData.targetKey = ''
      this.loading = true
      try {
        await this.loadTargetTree()
        this.$nextTick(() => {
          if (this.$refs.form) this.$refs.form.clearValidate()
        })
      } finally {
        this.loading = false
      }
    },
    async loadTargetTree() {
      this.formData.targetKey = ''
      if (!this.formData.targetLibraryId) {
        this.targetTree = undefined
        return
      }
      const response = await KnowledgeFolderApi.getKnowledgeTree(this.formData.targetLibraryId)
      this.targetTree = response.data
    },
    buildFolderOption(folder) {
      const isSourceOrDescendant = this.contentKind === 'folder' &&
        this.formData.targetLibraryId === this.sourceLibraryId &&
        this.isSourceFolderOrDescendant(folder.id)
      return {
        value: 'folder-' + folder.id,
        label: folder.title,
        kind: 'folder',
        entityId: folder.id,
        folderId: folder.id,
        disabled: !canManageKnowledgeContent(folder.currentUserLevel) || isSourceOrDescendant,
        children: folder.children.map(this.buildFolderOption).concat(
          this.contentKind === 'document'
            ? folder.documents.map(document => this.buildDocumentOption(document, folder.id))
            : []
        )
      }
    },
    buildDocumentOption(document, folderId) {
      const isSourceOrDescendant = this.formData.targetLibraryId === this.sourceLibraryId &&
        this.isSourceDocumentOrDescendant(document.id)
      return {
        value: 'document-' + document.id,
        label: document.title,
        kind: 'document',
        entityId: document.id,
        folderId,
        disabled: !canManageKnowledgeContent(document.currentUserLevel) || isSourceOrDescendant,
        children: document.children.map(child => this.buildDocumentOption(child, folderId))
      }
    },
    containsFolder(folder, id) {
      return folder.id === id || folder.children.some(child => this.containsFolder(child, id))
    },
    findFolder(folders, id) {
      for (const folder of folders) {
        if (folder.id === id) return folder
        const child = this.findFolder(folder.children, id)
        if (child) return child
      }
      return undefined
    },
    isSourceFolderOrDescendant(targetId) {
      const sourceFolder = this.findFolder((this.targetTree && this.targetTree.folders) || [], this.contentId)
      return sourceFolder ? this.containsFolder(sourceFolder, targetId) : false
    },
    containsDocument(document, id) {
      return document.id === id || document.children.some(child =>
        this.containsDocument(child, id)
      )
    },
    findDocument(documents, id) {
      for (const document of documents) {
        if (document.id === id) return document
        const child = this.findDocument(document.children, id)
        if (child) return child
      }
      return undefined
    },
    isSourceDocumentOrDescendant(targetId) {
      const documents = ((this.targetTree && this.targetTree.documents) || []).slice()
      ;((this.targetTree && this.targetTree.folders) || []).forEach(folder => {
        documents.push(...this.collectFolderDocuments(folder))
      })
      const sourceDocument = this.findDocument(documents, this.contentId)
      return sourceDocument ? this.containsDocument(sourceDocument, targetId) : false
    },
    collectFolderDocuments(folder) {
      const documents = folder.documents.slice()
      folder.children.forEach(child => documents.push(...this.collectFolderDocuments(child)))
      return documents
    },
    findTargetOption(options, value) {
      for (const option of options) {
        if (option.value === value) return option
        const child = this.findTargetOption(option.children, value)
        if (child) return child
      }
      return undefined
    },
    handleTargetSelect(option) {
      if (option.disabled) {
        this.$modal.msgWarning('当前账号不能移动到该位置')
        return
      }
      this.formData.targetKey = option.value
      if (this.$refs.form) this.$refs.form.validateField('targetKey')
    },
    targetIcon(option) {
      if (option.kind === 'root') return 'el-icon-notebook-2'
      return option.kind === 'folder' ? 'el-icon-folder' : 'el-icon-document'
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const target = this.findTargetOption(this.targetOptions, this.formData.targetKey)
        if (!target || !this.formData.targetLibraryId) return
        if (target.disabled) {
          this.$modal.msgWarning('当前账号不能移动到该位置')
          return
        }
        this.moveContent(target)
      })
    },
    async moveContent(target) {
      this.loading = true
      try {
        if (this.contentKind === 'folder') {
          if (this.formData.targetLibraryId === this.sourceLibraryId &&
            target.entityId === this.sourceParentId) {
            this.$modal.msgWarning('内容已在当前目录')
            return false
          }
          await KnowledgeFolderApi.moveKnowledgeFolder({
            id: this.contentId,
            targetLibraryId: this.formData.targetLibraryId,
            targetParentId: target.entityId
          })
        } else {
          const targetFolderId = target.kind === 'folder' ? target.entityId : target.folderId
          const targetParentId = target.kind === 'document' ? target.entityId : PmsKnowledgeRootId
          if (this.formData.targetLibraryId === this.sourceLibraryId &&
            targetFolderId === this.sourceFolderId && targetParentId === this.sourceParentId) {
            this.$modal.msgWarning('内容已在当前目录')
            return false
          }
          await KnowledgeDocumentApi.moveKnowledgeDocument({
            id: this.contentId,
            targetLibraryId: this.formData.targetLibraryId,
            targetFolderId,
            targetParentId
          })
        }
        this.$modal.msgSuccess('移动成功')
        this.dialogVisible = false
        this.$emit('success')
        return true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}

.target-tree-wrap {
  width: 100%;
  max-height: 320px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.target-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
}

.target-tree-node .el-tag,
.disabled-text {
  margin-left: auto;
}

.disabled-text {
  color: #c0c4cc;
  font-size: 12px;
}
</style>
