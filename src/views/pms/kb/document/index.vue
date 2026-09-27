<template>
  <div class="app-container pms-knowledge-library-detail">
    <doc-alert title="【PMS】文档与协作" url="https://doc.iocoder.cn/pms/kb/document/" />
    <div v-loading="loading" class="knowledge-library-workspace">
      <el-card :body-style="{ padding: '0' }" class="sidebar-card" shadow="never">
        <knowledge-library-sidebar
          :active-view="activeView"
          :can-create-document="canCreateDocument"
          :can-create-folder="canCreateFolder"
          :current-node-key="currentNodeKey"
          :tree-data="treeData"
          :write-status="Boolean(tree && tree.writeStatus)"
          @create="handleCreateCommand"
          @home="handleHome"
          @node-click="handleNodeClick"
          @node-action="handleNodeAction"
          @recycle="handleRecycle"
        />
      </el-card>
      <el-card :body-style="{ padding: '24px 32px' }" class="knowledge-library-main" shadow="never">
        <knowledge-recycle-panel
          v-if="activeView === 'recycle'"
          :library-id="libraryId"
          @success="handleRecycleChanged"
        />
        <knowledge-document-detail
          v-else-if="activeView === 'document' && selectedDocument"
          :document="selectedDocument"
          :labels="selectedDocumentLabels"
          @collect="handleDocumentCollect"
          @delete="handleContentDeleted"
          @like="handleDocumentLike"
          @move="openMoveDialog('document', selectedDocument)"
          @permission="openPermissionForm(selectedDocument.permissionId)"
          @share="openShareDialog(selectedDocument.id)"
          @update="openDocumentUpdateForm"
        />
        <knowledge-folder-detail
          v-else-if="activeView === 'folder' && selectedFolder"
          :children="selectedFolderChildren"
          :folder="selectedFolder"
          @collect="handleFolderCollect"
          @delete="handleContentDeleted"
          @move="openMoveDialog('folder', selectedFolder)"
          @node-click="handleNodeClick"
          @permission="openPermissionForm(selectedFolder.permissionId)"
          @update="openFolderForm('update')"
        />
        <knowledge-library-home
          v-else
          :key="libraryId"
          :library="library"
          :tree-data="treeData"
          :favorite-items="favoriteItems"
          :favorite-loading="favoriteLoading"
          :write-status="Boolean(tree && tree.writeStatus)"
          @collect="handleLibraryCollect"
          @exit="handleExitLibrary"
          @member="openMemberForm"
          @node-click="handleNodeClick"
          @search="handleLibrarySearch"
          @tab-change="handleLibraryTabChange"
        />
      </el-card>
    </div>

    <knowledge-folder-form ref="folderForm" @success="handleContentChanged" />
    <knowledge-document-create-form ref="documentCreateForm" @success="handleContentChanged" />
    <knowledge-file-upload-form ref="fileUploadForm" @success="handleContentChanged" />
    <knowledge-document-update-form ref="documentUpdateForm" @success="handleContentChanged" />
    <knowledge-member-form ref="memberForm" @success="getPageData" />
    <knowledge-document-share-dialog ref="shareDialog" />
    <knowledge-content-permission-form ref="permissionForm" @success="handleContentChanged" />
    <knowledge-content-move-dialog ref="moveDialog" @success="handleMoveChanged" />
  </div>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import * as KnowledgeDocumentLabelApi from '@/api/pms/kb/content/document/label'
import * as KnowledgeFolderApi from '@/api/pms/kb/content/folder'
import * as KnowledgeFavoriteApi from '@/api/pms/kb/interaction/favorite'
import * as KnowledgeDocumentLikeApi from '@/api/pms/kb/interaction/like'
import * as KnowledgeLibraryApi from '@/api/pms/kb/library'
import * as KnowledgeLibraryMemberApi from '@/api/pms/kb/library/member'
import KnowledgeContentMoveDialog from './KnowledgeContentMoveDialog.vue'
import KnowledgeContentPermissionForm from './KnowledgeContentPermissionForm.vue'
import KnowledgeDocumentCreateForm from './KnowledgeDocumentCreateForm.vue'
import KnowledgeFileUploadForm from './KnowledgeFileUploadForm.vue'
import KnowledgeDocumentShareDialog from './KnowledgeDocumentShareDialog.vue'
import KnowledgeDocumentUpdateForm from './KnowledgeDocumentUpdateForm.vue'
import KnowledgeFolderForm from './KnowledgeFolderForm.vue'
import KnowledgeMemberForm from '../library/KnowledgeMemberForm.vue'
import KnowledgeDocumentDetail from './KnowledgeDocumentDetail.vue'
import KnowledgeFolderDetail from './KnowledgeFolderDetail.vue'
import KnowledgeLibraryHome from './KnowledgeLibraryHome.vue'
import KnowledgeLibrarySidebar from './KnowledgeLibrarySidebar.vue'
import KnowledgeRecyclePanel from './KnowledgeRecyclePanel.vue'
import { PmsKnowledgeObjectType, PmsKnowledgeRootId } from '@/views/pms/kb/utils/constants'
import { canEditKnowledgeContent } from '@/views/pms/kb/utils/permission'

export default {
  name: 'PmsKnowledgeLibraryDetail',
  components: {
    KnowledgeContentMoveDialog,
    KnowledgeContentPermissionForm,
    KnowledgeDocumentCreateForm,
    KnowledgeDocumentDetail,
    KnowledgeDocumentShareDialog,
    KnowledgeDocumentUpdateForm,
    KnowledgeFileUploadForm,
    KnowledgeFolderDetail,
    KnowledgeFolderForm,
    KnowledgeLibraryHome,
    KnowledgeLibrarySidebar,
    KnowledgeMemberForm,
    KnowledgeRecyclePanel
  },
  data() {
    return {
      loading: false,
      activeView: 'home',
      library: undefined,
      tree: undefined,
      selectedFolder: undefined,
      selectedDocument: undefined,
      labelList: [],
      favoriteItems: [],
      favoriteLoading: false,
      favoriteTabActive: false
    }
  },
  computed: {
    libraryId() {
      return Number(this.$route.params.libraryId)
    },
    treeData() {
      if (!this.tree) return []
      return this.tree.folders.map(this.buildFolderNode)
        .concat(this.tree.documents.map(this.buildDocumentNode))
    },
    currentNodeKey() {
      if (this.activeView === 'folder' && this.selectedFolder) {
        return 'folder-' + this.selectedFolder.id
      }
      if (this.activeView === 'document' && this.selectedDocument) {
        return 'document-' + this.selectedDocument.id
      }
      return undefined
    },
    selectedDocumentLabels() {
      const labelIds = new Set(this.selectedDocument ? this.selectedDocument.labelIds || [] : [])
      return this.labelList.filter(label => labelIds.has(label.id))
    },
    selectedFolderChildren() {
      if (!this.selectedFolder) return []
      const node = this.findTreeNode(this.treeData, 'folder-' + this.selectedFolder.id)
      return node ? node.children : []
    },
    canCreateFolder() {
      return Boolean(this.tree && this.tree.writeStatus) || canEditKnowledgeContent(
        this.selectedFolder && this.selectedFolder.currentUserLevel
      )
    },
    canCreateDocument() {
      return Boolean(this.tree && this.tree.writeStatus) ||
        canEditKnowledgeContent(this.selectedFolder && this.selectedFolder.currentUserLevel) ||
        canEditKnowledgeContent(this.selectedDocument && this.selectedDocument.currentUserLevel)
    }
  },
  watch: {
    $route(to, from) {
      if (to.params.libraryId !== from.params.libraryId) {
        this.getPageData()
        return
      }
      if (
        to.params.folderId !== from.params.folderId ||
        to.params.documentId !== from.params.documentId
      ) {
        this.getRouteContent()
      }
    }
  },
  created() {
    this.getPageData()
  },
  methods: {
    async getPageData() {
      this.loading = true
      try {
        const responses = await Promise.all([
          KnowledgeLibraryApi.getKnowledgeLibrary(this.libraryId),
          KnowledgeFolderApi.getKnowledgeTree(this.libraryId),
          KnowledgeDocumentLabelApi.getKnowledgeDocumentLabelList()
        ])
        this.library = responses[0].data
        this.tree = responses[1].data
        this.labelList = responses[2].data
        this.favoriteItems = []
        this.favoriteTabActive = false
        await this.getRouteContent()
      } finally {
        this.loading = false
      }
    },
    async getRouteContent() {
      if (!this.library || this.library.id !== this.libraryId) return
      const documentId = Number(this.$route.params.documentId)
      if (Number.isFinite(documentId) && documentId > 0) {
        const response = await KnowledgeDocumentApi.getKnowledgeDocument(documentId, true)
        this.selectedDocument = response.data
        this.selectedFolder = undefined
        this.activeView = 'document'
        return
      }
      const folderId = Number(this.$route.params.folderId)
      if (Number.isFinite(folderId) && folderId > 0) {
        const response = await KnowledgeFolderApi.getKnowledgeFolder(folderId, true)
        this.selectedFolder = response.data
        this.selectedDocument = undefined
        this.activeView = 'folder'
        return
      }
      this.activeView = 'home'
      this.selectedFolder = undefined
      this.selectedDocument = undefined
    },
    async getTree() {
      const response = await KnowledgeFolderApi.getKnowledgeTree(this.libraryId)
      this.tree = response.data
    },
    async getFavoriteItems() {
      this.favoriteLoading = true
      try {
        const response = await KnowledgeFavoriteApi.getKnowledgeFavoriteList(this.libraryId)
        this.favoriteItems = response.data
      } finally {
        this.favoriteLoading = false
      }
    },
    async handleLibraryTabChange(tab) {
      this.favoriteTabActive = tab === 'favorite'
      if (this.favoriteTabActive) await this.getFavoriteItems()
    },
    buildFolderNode(folder) {
      return {
        key: 'folder-' + folder.id,
        entityId: folder.id,
        kind: 'folder',
        label: folder.title,
        currentUserLevel: folder.currentUserLevel,
        children: folder.children.map(this.buildFolderNode)
          .concat(folder.documents.map(this.buildDocumentNode))
      }
    },
    buildDocumentNode(document) {
      return {
        key: 'document-' + document.id,
        entityId: document.id,
        kind: 'document',
        label: document.title,
        currentUserLevel: document.currentUserLevel,
        type: document.type,
        children: document.children.map(this.buildDocumentNode)
      }
    },
    async handleNodeClick(node) {
      let targetPath
      if (node.kind === 'folder') {
        targetPath = '/pms/kb/library/' + this.libraryId + '/folder/' + node.entityId
      } else {
        targetPath = '/pms/kb/library/' + this.libraryId + '/document/' + node.entityId
      }
      if (this.$route.path !== targetPath) await this.$router.push(targetPath)
    },
    async handleNodeAction(node, command) {
      if (['create-document', 'create-folder', 'upload'].includes(command)) {
        if (command === 'create-document') {
          this.$refs.documentCreateForm.open(this.libraryId, node.entityId, PmsKnowledgeRootId)
        } else if (command === 'create-folder') {
          this.$refs.folderForm.open('create', this.libraryId, node.entityId)
        } else {
          this.$refs.fileUploadForm.open(this.libraryId, node.entityId, PmsKnowledgeRootId)
        }
        return
      }
      if (node.kind === 'folder') {
        const response = await KnowledgeFolderApi.getKnowledgeFolder(node.entityId)
        const folder = response.data
        if (command === 'rename') {
          this.$refs.folderForm.open('update', this.libraryId, folder.parentId, folder.id)
        } else if (command === 'move') {
          this.$refs.moveDialog.open('folder', folder)
        } else if (command === 'delete') {
          await this.deleteFolder(folder)
        }
        return
      }
      const response = await KnowledgeDocumentApi.getKnowledgeDocument(node.entityId)
      const document = response.data
      if (command === 'rename') this.$refs.documentUpdateForm.open(document.id)
      else if (command === 'move') this.$refs.moveDialog.open('document', document)
      else if (command === 'delete') await this.deleteDocument(document)
    },
    async deleteFolder(folder) {
      try {
        await this.$modal.confirm('确认删除文件夹“' + folder.title + '”吗？')
        await KnowledgeFolderApi.deleteKnowledgeFolder(folder.id)
        this.$modal.msgSuccess('删除成功')
        await this.getTree()
      } catch (error) {
        // 用户取消时不删除。
      }
    },
    async deleteDocument(document) {
      try {
        await this.$modal.confirm('确认删除文档“' + document.title + '”吗？')
        await KnowledgeDocumentApi.deleteKnowledgeDocument(document.id)
        this.$modal.msgSuccess('删除成功')
        await this.getTree()
      } catch (error) {
        // 用户取消时不删除。
      }
    },
    handleLibrarySearch() {
      this.$router.push({ path: '/pms/kb/search', query: { libraryId: String(this.libraryId) }})
    },
    async handleHome() {
      this.activeView = 'home'
      this.selectedFolder = undefined
      this.selectedDocument = undefined
      const targetPath = '/pms/kb/library/' + this.libraryId
      if (this.$route.path !== targetPath) await this.$router.push(targetPath)
      if (this.favoriteTabActive) await this.getFavoriteItems()
    },
    handleRecycle() {
      this.activeView = 'recycle'
      this.selectedFolder = undefined
      this.selectedDocument = undefined
    },
    handleCreateCommand(command) {
      if (command === 'folder') {
        this.openFolderForm('create')
        return
      }
      if (command === 'upload') {
        this.openFileUploadForm()
        return
      }
      this.openDocumentCreateForm()
    },
    openFolderForm(type) {
      this.$refs.folderForm.open(
        type,
        this.libraryId,
        type === 'create' && this.selectedFolder
          ? this.selectedFolder.id
          : PmsKnowledgeRootId,
        type === 'update' && this.selectedFolder ? this.selectedFolder.id : undefined
      )
    },
    openDocumentCreateForm() {
      this.$refs.documentCreateForm.open(
        this.libraryId,
        this.selectedFolder ? this.selectedFolder.id : PmsKnowledgeRootId,
        this.selectedDocument ? this.selectedDocument.id : PmsKnowledgeRootId
      )
    },
    openFileUploadForm() {
      this.$refs.fileUploadForm.open(
        this.libraryId,
        this.selectedFolder ? this.selectedFolder.id : PmsKnowledgeRootId,
        this.selectedDocument ? this.selectedDocument.id : PmsKnowledgeRootId
      )
    },
    openDocumentUpdateForm() {
      if (this.selectedDocument) this.$refs.documentUpdateForm.open(this.selectedDocument.id)
    },
    openMoveDialog(kind, content) {
      this.$refs.moveDialog.open(kind, content)
    },
    openPermissionForm(permissionId) {
      this.$refs.permissionForm.open(permissionId)
    },
    openShareDialog(documentId) {
      this.$refs.shareDialog.open(documentId)
    },
    openMemberForm() {
      this.$refs.memberForm.open(this.libraryId)
    },
    async handleContentDeleted() {
      await this.handleHome()
      await this.getTree()
    },
    async handleLibraryCollect() {
      if (!this.library) return
      this.library.favoriteStatus = await this.toggleFavorite(
        PmsKnowledgeObjectType.LIBRARY,
        this.library.id,
        Boolean(this.library.favoriteStatus)
      )
    },
    async handleFolderCollect() {
      if (!this.selectedFolder) return
      this.selectedFolder.favoriteStatus = await this.toggleFavorite(
        PmsKnowledgeObjectType.FOLDER,
        this.selectedFolder.id,
        this.selectedFolder.favoriteStatus
      )
    },
    async handleDocumentCollect() {
      if (!this.selectedDocument) return
      this.selectedDocument.favoriteStatus = await this.toggleFavorite(
        this.selectedDocument.type,
        this.selectedDocument.id,
        this.selectedDocument.favoriteStatus
      )
    },
    async toggleFavorite(type, entityId, favoriteStatus) {
      if (favoriteStatus) {
        await KnowledgeFavoriteApi.deleteKnowledgeFavorite(type, entityId)
        this.$modal.msgSuccess('已取消关注')
        return false
      }
      await KnowledgeFavoriteApi.createKnowledgeFavorite({ type, entityId })
      this.$modal.msgSuccess('关注成功')
      return true
    },
    async handleDocumentLike() {
      if (!this.selectedDocument) return
      if (this.selectedDocument.likeStatus) {
        await KnowledgeDocumentLikeApi.deleteKnowledgeDocumentLike(this.selectedDocument.id)
      } else {
        await KnowledgeDocumentLikeApi.createKnowledgeDocumentLike(this.selectedDocument.id)
      }
      const response = await KnowledgeDocumentApi.getKnowledgeDocument(this.selectedDocument.id)
      this.selectedDocument = response.data
    },
    async handleExitLibrary() {
      try {
        const name = this.library ? this.library.name : ''
        await this.$modal.confirm(
          '确认退出知识库“' + name + '”吗？退出后将无法访问私有内容。'
        )
        await KnowledgeLibraryMemberApi.exitKnowledgeLibrary(this.libraryId)
        this.$modal.msgSuccess('已退出知识库')
        await this.$router.push('/pms/kb/library')
      } catch (error) {
        // 用户取消时留在当前知识库。
      }
    },
    async handleContentChanged() {
      await this.getTree()
      if (this.selectedDocument) {
        const response = await KnowledgeDocumentApi.getKnowledgeDocument(this.selectedDocument.id)
        this.selectedDocument = response.data
      } else if (this.selectedFolder) {
        const response = await KnowledgeFolderApi.getKnowledgeFolder(this.selectedFolder.id)
        this.selectedFolder = response.data
      }
    },
    async handleRecycleChanged() {
      await this.getTree()
    },
    async handleMoveChanged() {
      await this.handleHome()
      await this.getTree()
    },
    findTreeNode(nodes, key) {
      for (const node of nodes) {
        if (node.key === key) return node
        const child = this.findTreeNode(node.children, key)
        if (child) return child
      }
      return undefined
    }
  }
}
</script>

<style scoped>
.knowledge-library-workspace {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  min-height: calc(100vh - 120px);
  gap: 16px;
}

.sidebar-card,
.knowledge-library-main {
  height: 100%;
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .knowledge-library-workspace {
    grid-template-columns: 1fr;
  }

  ::v-deep .knowledge-library-main .el-card__body {
    padding-right: 16px !important;
    padding-left: 16px !important;
  }
}
</style>
