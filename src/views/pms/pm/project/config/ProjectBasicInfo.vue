<template>
  <div>
    <!-- 基本信息标题与操作 -->
    <div class="mb-16px flex items-center justify-between gap-16px">
      <h3 class="m-0 text-18px font-600">项目基本信息</h3>
      <el-button
        v-if="project.adminStatus && editable"
        v-hasPermi="['pms:pm:project:update']"
        type="primary"
        @click="openForm"
      >
        编辑项目
      </el-button>
    </div>

    <!-- 项目基础字段 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
      <el-descriptions-item label="项目类型">
        {{ formatProjectType(project.type) }}
      </el-descriptions-item>
      <el-descriptions-item label="项目周期">
        {{ formatDate(project.startTime, 'YYYY-MM-DD') || '未设置' }} 至
        {{ formatDate(project.endTime, 'YYYY-MM-DD') || '未设置' }}
      </el-descriptions-item>
      <el-descriptions-item label="可见范围">
        {{ formatProjectOpenStatus(project.openStatus) }}
      </el-descriptions-item>
      <el-descriptions-item label="项目描述" :span="2">
        {{ project.description || '暂无项目描述' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 项目生命周期管理 -->
    <template v-if="project.adminStatus && editable">
      <el-divider content-position="left">项目管理</el-divider>
      <div class="flex items-center justify-between gap-16px">
        <div>
          <div class="font-600">归档项目</div>
          <div class="mt-4px text-13px leading-20px text-[var(--el-text-color-secondary)]">
            归档后项目只允许查看，不能继续维护项目中的迭代和工作项。
          </div>
        </div>
        <el-button @click="handleArchive">归档</el-button>
      </div>
      <el-divider />
      <div class="flex items-center justify-between gap-16px">
        <div>
          <div class="font-600">移入回收站</div>
          <div class="mt-4px text-13px leading-20px text-[var(--el-text-color-secondary)]">
            项目进入回收站后不可访问；只有项目拥有者可以在回收站彻底删除。
          </div>
        </div>
        <el-button type="danger" @click="handleRecycle">移入回收站</el-button>
      </div>
    </template>

    <!-- 项目表单 -->
    <ProjectForm ref="projectFormRef" @success="$emit('success')" />
  </div>
</template>

<script>
import { formatDate } from '@/utils/formatTime'
import * as ProjectApi from '@/api/pms/pm/project'
import { formatProjectOpenStatus, formatProjectType } from '@/views/pms/pm/utils/format'
import ProjectForm from '../components/ProjectForm.vue'
export default {
  name: 'PmsProjectBasicInfo',
  components: { ProjectForm },
  props: { project: { type: Object, required: true }, editable: Boolean },
  methods: {
    formatDate, formatProjectOpenStatus, formatProjectType,
    openForm() { this.$refs.projectFormRef.open('update', this.project.id) },
    async handleArchive() {
      try { await this.$confirm('归档后将不能继续操作项目中的数据，确认归档该项目吗？', '提示', { type: 'warning' }) }
      catch (error) { if (error === 'cancel' || error === 'close') return; throw error }
      await ProjectApi.archiveProject(this.project.id)
      this.$message.success('项目已归档')
      await this.$router.push({ name: 'PmsProjectArchive' })
    },
    async handleRecycle() {
      try { await this.$confirm('确认将该项目移入回收站吗？', '提示', { type: 'warning' }) }
      catch (error) { if (error === 'cancel' || error === 'close') return; throw error }
      await ProjectApi.recycleProject(this.project.id)
      this.$message.success('项目已移入回收站')
      await this.$router.push({ name: 'PmsProjectRecycle' })
    }
  }
}
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mb-16px { margin-bottom: 16px; }
.ml-8px { margin-left: 8px; }
.mt-4px { margin-top: 4px; }
.m-0 { margin: 0; }
.gap-8px { gap: 8px; }
.gap-12px { gap: 12px; }
.gap-16px { gap: 16px; }
.text-13px { font-size: 13px; color: #909399; }
.text-18px { font-size: 18px; }
.text-20px { font-size: 20px; }
.font-600 { font-weight: 600; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.line-clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.leading-22px { line-height: 22px; }
.leading-20px { line-height: 20px; }
.delete-button { color: #f56c6c; }
</style>

