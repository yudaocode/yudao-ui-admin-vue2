<template>
  <div>
    <!-- 知识库分组管理弹窗 -->
    <el-dialog
      title="管理知识库分组"
      :visible.sync="dialogVisible"
      width="720px"
      append-to-body
    >
      <div class="group-toolbar">
        <span>知识库分组是个人视图，不会影响其他成员</span>
        <el-button
          v-hasPermi="['pms:kb:library:create']"
          type="primary"
          @click="openGroupForm('create')"
        >新增分组</el-button>
      </div>
      <!-- 分组列表 -->
      <el-table ref="table" v-loading="loading" :data="groupList" row-key="id" border>
        <el-table-column align="center" width="60">
          <template>
            <el-tooltip content="拖动排序" placement="top">
              <i class="el-icon-rank drag-handle" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="分组名称" min-width="220" prop="name" />
        <el-table-column align="center" label="操作" width="140">
          <template slot-scope="scope">
            <template v-if="scope.row.type === PmsKnowledgeGroupType.CUSTOM">
              <el-button
                v-hasPermi="['pms:kb:library:update']"
                type="text"
                @click="openGroupForm('update', scope.row.id)"
              >编辑</el-button>
              <el-popconfirm
                v-hasPermi="['pms:kb:library:delete']"
                cancel-button-text="取消"
                confirm-button-text="确定"
                :title="'确认删除分组“' + scope.row.name + '”吗？知识库会回到未分组。'"
                @confirm="handleDelete(scope.row)"
              >
                <el-button slot="reference" type="text" class="danger-text">删除</el-button>
              </el-popconfirm>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-hasPermi="['pms:kb:library:update']"
          :disabled="loading"
          type="primary"
          @click="handleSaveSort"
        >保存排序</el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 新增或修改知识库分组 -->
    <knowledge-group-form ref="groupForm" @success="handleGroupChanged" />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import * as KnowledgeGroupApi from '@/api/pms/kb/library/group'
import { PmsKnowledgeGroupType } from '@/views/pms/kb/utils/constants'
import KnowledgeGroupForm from './KnowledgeGroupForm.vue'

export default {
  name: 'PmsKnowledgeGroupManageDialog',
  components: { KnowledgeGroupForm },
  data() {
    return {
      PmsKnowledgeGroupType,
      dialogVisible: false,
      loading: false,
      groupList: [],
      sortable: null
    }
  },
  beforeDestroy() {
    if (this.sortable) this.sortable.destroy()
  },
  methods: {
    async open() {
      this.dialogVisible = true
      await this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeGroupApi.getKnowledgeGroupList()
        this.groupList = response.data
        await this.$nextTick()
        this.initSortable()
      } finally {
        this.loading = false
      }
    },
    initSortable() {
      if (this.sortable) this.sortable.destroy()
      const tableBody = this.$refs.table && this.$refs.table.$el
        ? this.$refs.table.$el.querySelector('.el-table__body-wrapper tbody')
        : null
      if (!tableBody) {
        this.sortable = null
        return
      }
      this.sortable = Sortable.create(tableBody, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: ({ newIndex, oldIndex }) => {
          if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
          this.groupList.splice(newIndex, 0, this.groupList.splice(oldIndex, 1)[0])
        }
      })
    },
    openGroupForm(type, id) {
      this.$refs.groupForm.open(type, id)
    },
    async handleSaveSort() {
      this.loading = true
      try {
        await KnowledgeGroupApi.updateKnowledgeGroupSort(
          this.groupList.map((group, index) => ({ id: group.id, sort: index }))
        )
        this.$modal.msgSuccess('排序保存成功')
        this.$emit('success')
        await this.getList()
      } finally {
        this.loading = false
      }
    },
    async handleDelete(group) {
      await KnowledgeGroupApi.deleteKnowledgeGroup(group.id)
      this.$modal.msgSuccess('删除成功')
      this.$emit('success')
      await this.getList()
    },
    async handleGroupChanged() {
      this.$emit('success')
      await this.getList()
    }
  }
}
</script>

<style scoped>
.group-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: #909399;
  font-size: 13px;
}

.drag-handle {
  color: #909399;
  cursor: move;
}

.danger-text {
  color: #f56c6c;
}
</style>
