<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" title="工作项标签管理" width="680px" append-to-body>
      <div class="label-toolbar">
        <el-button type="primary" @click="openForm()">新增标签</el-button>
      </div>
      <el-table v-loading="loading" :data="labelList">
        <el-table-column label="标签" min-width="220" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag :color="scope.row.color" effect="dark">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="颜色" prop="color" width="140" />
        <el-table-column align="center" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="openForm(scope.row)">编辑</el-button>
            <el-popconfirm cancel-button-text="取消" confirm-button-text="确定"
              :title="`确认删除标签“${scope.row.name}”吗？`" @confirm="handleDelete(scope.row)">
              <el-button slot="reference" type="text" class="delete-label">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <WorkItemLabelForm ref="formRef" @success="handleFormSuccess" />
  </div>
</template>

<script>
import * as WorkItemLabelApi from '@/api/pms/pm/workitem/label'
import WorkItemLabelForm from './WorkItemLabelForm.vue'

export default {
  name: 'PmsWorkItemLabelList',
  components: { WorkItemLabelForm },
  data() {
    return { dialogVisible: false, loading: false, labelList: [] }
  },
  methods: {
    async open() {
      this.dialogVisible = true
      await this.getWorkItemLabelList()
    },
    async getWorkItemLabelList() {
      this.loading = true
      try {
        const response = await WorkItemLabelApi.getWorkItemLabelList()
        this.labelList = response.data
      } finally {
        this.loading = false
      }
    },
    openForm(label) {
      return this.$refs.formRef.open(label && label.id)
    },
    async handleFormSuccess() {
      await this.getWorkItemLabelList()
      this.$emit('success')
    },
    async handleDelete(label) {
      if (!label.id) return
      await WorkItemLabelApi.deleteWorkItemLabel(label.id)
      this.$message.success('删除成功')
      await this.getWorkItemLabelList()
      this.$emit('success')
    }
  }
}
</script>

<style scoped>
.label-toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.delete-label { color: #f56c6c; margin-left: 10px; }
</style>
