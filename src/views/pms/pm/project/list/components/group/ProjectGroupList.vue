<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" title="管理分组" width="760px" append-to-body @closed="handleClosed">
      <div class="group-toolbar">
        <span>项目分组是个人视图，不会影响其他项目成员</span>
        <el-button v-hasPermi="['pms:pm:project-group:create']" plain type="primary" @click="openForm('create')">新增分组</el-button>
      </div>
      <el-table ref="tableRef" v-loading="loading" :data="groupList" max-height="440" row-key="id">
        <el-table-column align="center" width="60">
          <template slot-scope="scope">
            <el-tooltip content="拖动排序" placement="top">
              <Icon :key="scope.row.id" class="drag-handle" icon="ep:rank" />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="分组名称" min-width="220" prop="name" />
        <el-table-column align="center" label="分组类型" width="130">
          <template slot-scope="scope">{{ getProjectGroupTypeName(scope.row.type) }}</template>
        </el-table-column>
        <el-table-column align="center" label="项目数量" prop="projectCount" width="130" />
        <el-table-column align="center" label="操作" width="140">
          <template slot-scope="scope">
            <template v-if="scope.row.type === PmsProjectGroupType.CUSTOM">
              <el-button v-hasPermi="['pms:pm:project-group:update']" type="text" @click="openForm('update', scope.row)">编辑</el-button>
              <el-button v-hasPermi="['pms:pm:project-group:delete']" type="text" class="delete-button" @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <template slot="footer">
        <el-button v-hasPermi="['pms:pm:project-group:update']" :disabled="!sortChanged" :loading="sortLoading" type="primary" @click="handleSaveSort">保存排序</el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <ProjectGroupForm ref="formRef" @success="handleGroupChanged" />
  </div>
</template>
<script>
import Sortable from 'sortablejs'
import { Icon } from '@/components/Icon'
import { checkPermi } from '@/utils/permission'
import * as ProjectGroupApi from '@/api/pms/pm/project/group'
import { PmsProjectGroupType } from '@/views/pms/pm/utils/constants'
import { getProjectGroupTypeName } from '@/views/pms/pm/utils/format'
import ProjectGroupForm from './ProjectGroupForm.vue'

export default {
  name: 'PmsProjectGroupList',
  components: { Icon, ProjectGroupForm },
  data() {
    return {
      PmsProjectGroupType, dialogVisible: false, loading: true, sortLoading: false,
      sortChanged: false, groupList: []
    }
  },
  beforeDestroy() { this.handleClosed() },
  methods: {
    getProjectGroupTypeName,
    open() {
      this.dialogVisible = true
      return this.getGroupList()
    },
    async getGroupList() {
      this.loading = true
      try {
        const response = await ProjectGroupApi.getProjectGroupList()
        this.groupList = response.data
        this.sortChanged = false
        await this.$nextTick()
        this.initSortable()
      } finally {
        this.loading = false
      }
    },
    async handleGroupChanged() {
      await this.getGroupList()
      this.$emit('success')
    },
    openForm(type, group) { this.$refs.formRef.open(type, group) },
    initSortable() {
      this.handleClosed()
      const table = this.$refs.tableRef
      const body = table && table.$el.querySelector('.el-table__body-wrapper tbody')
      if (!body) return
      this._groupSortable = Sortable.create(body, {
        animation: 150, disabled: !checkPermi(['pms:pm:project-group:update']), handle: '.drag-handle',
        onEnd: ({ newIndex, oldIndex }) => {
          if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
          this.groupList.splice(newIndex, 0, this.groupList.splice(oldIndex, 1)[0])
          this.sortChanged = true
        }
      })
    },
    async handleSaveSort() {
      this.sortLoading = true
      try {
        await ProjectGroupApi.updateProjectGroupSort(this.groupList.map((group, index) => ({ id: group.id, sort: index })))
        this.$message.success('保存排序成功')
        this.$emit('success')
        this.dialogVisible = false
      } finally {
        this.sortLoading = false
      }
    },
    async handleDelete(id) {
      try {
        await this.$confirm('是否确认删除该分组？', '提示', { type: 'warning' })
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      await ProjectGroupApi.deleteProjectGroup(id)
      this.$message.success('删除成功')
      await this.getGroupList()
      this.$emit('success')
    },
    handleClosed() {
      if (this._groupSortable) this._groupSortable.destroy()
      this._groupSortable = undefined
    }
  }
}
</script>
<style scoped>
.group-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.group-toolbar span { color: #909399; font-size: 13px; }
.drag-handle { cursor: move; color: #909399; }
.delete-button { color: #f56c6c; }
</style>
