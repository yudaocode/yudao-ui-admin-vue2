<template>
  <div>
    <el-dialog title="管理文档标签" :visible.sync="dialogVisible" width="720px" append-to-body>
      <div class="label-toolbar">
        <span>文档标签可用于归类和快速筛选知识文档</span>
        <el-button
          v-hasPermi="['pms:kb:library:update']"
          type="primary"
          @click="openLabelForm('create')"
        >新增标签</el-button>
      </div>
      <el-table v-loading="loading" :data="labelList" :show-overflow-tooltip="true" border>
        <el-table-column label="标签" min-width="220">
          <template slot-scope="scope">
            <el-tag :color="scope.row.color" effect="dark">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="颜色" prop="color" width="140" />
        <el-table-column align="center" label="操作" width="160">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['pms:kb:library:update']"
              type="text"
              @click="openLabelForm('update', scope.row.id)"
            >编辑</el-button>
            <el-popconfirm
              v-hasPermi="['pms:kb:library:delete']"
              cancel-button-text="取消"
              confirm-button-text="确定"
              :title="'确认删除标签“' + scope.row.name + '”吗？'"
              @confirm="handleDelete(scope.row)"
            >
              <el-button slot="reference" class="danger-text" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <knowledge-label-form ref="labelForm" @success="handleLabelChanged" />
  </div>
</template>

<script>
import * as KnowledgeDocumentLabelApi from '@/api/pms/kb/content/document/label'
import KnowledgeLabelForm from './KnowledgeLabelForm.vue'

export default {
  name: 'PmsKnowledgeLabelManageDialog',
  components: { KnowledgeLabelForm },
  data() {
    return { dialogVisible: false, loading: false, labelList: [] }
  },
  methods: {
    async open() {
      this.dialogVisible = true
      await this.getLabelList()
    },
    openLabelForm(type, id) {
      this.$refs.labelForm.open(type, id)
    },
    async getLabelList() {
      this.loading = true
      try {
        const response = await KnowledgeDocumentLabelApi.getKnowledgeDocumentLabelList()
        this.labelList = response.data
      } finally {
        this.loading = false
      }
    },
    async handleDelete(label) {
      await KnowledgeDocumentLabelApi.deleteKnowledgeDocumentLabel(label.id)
      this.$modal.msgSuccess('删除成功')
      await this.handleLabelChanged()
    },
    async handleLabelChanged() {
      await this.getLabelList()
      this.$emit('success')
    }
  }
}
</script>

<style scoped>
.label-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: #909399;
  font-size: 13px;
}

.danger-text {
  color: #f56c6c;
}
</style>
