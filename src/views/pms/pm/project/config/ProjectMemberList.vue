<template>
  <div>
    <!-- 成员列表标题与操作 -->
    <div class="mb-16px flex items-center justify-between gap-16px">
      <h3 class="m-0 text-18px font-600">项目成员</h3>
      <el-button
        v-if="project.adminStatus && editable"
        v-hasPermi="['pms:pm:project-member:update']"
        type="primary"
        @click="openForm('create')"
      >
        新增成员
      </el-button>
    </div>

    <!-- 成员列表 -->
    <el-table v-loading="loading" :data="memberList">
      <el-table-column label="成员" min-width="200">
        <template slot-scope="scope">
          <div class="flex items-center">
            <el-avatar :size="30" :src="scope.row.avatar">
              {{ scope.row.nickname && scope.row.nickname.slice(0, 1) }}
            </el-avatar>
            <span class="ml-8px">{{ scope.row.nickname || `用户 #${scope.row.userId}` }}</span>
            <el-tag v-if="scope.row.creatorStatus" class="ml-8px" effect="plain" type="success">
              创建人
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="项目级别" min-width="160">
        <template slot-scope="scope">
          {{ formatProjectMemberLevel(scope.row.level) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="project.adminStatus && editable"
        align="center"
        fixed="right"
        label="操作"
        width="140"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['pms:pm:project-member:update']"
            :disabled="scope.row.creatorStatus" type="text"
            @click="openForm('update', scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['pms:pm:project-member:update']"
            :disabled="scope.row.creatorStatus" type="text" class="delete-button"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 成员表单 -->
    <ProjectMemberForm ref="memberFormRef" @success="getMemberList" />
  </div>
</template>

<script>
import * as ProjectMemberApi from '@/api/pms/pm/project/member'
import { formatProjectMemberLevel } from '@/views/pms/pm/utils/format'
import ProjectMemberForm from './ProjectMemberForm.vue'
export default {
  name: 'PmsProjectMemberList',
  components: { ProjectMemberForm },
  props: { project: { type: Object, required: true }, editable: Boolean },
  data() { return { loading: false, memberList: [] } },
  watch: { 'project.id': { immediate: true, handler() { this.getMemberList() } } },
  methods: {
    formatProjectMemberLevel,
    openForm(type, member) { this.$refs.memberFormRef.open(type, this.project.id, this.project.name, this.memberList, member) },
    async getMemberList() {
      this.loading = true
      try {
        const response = await ProjectMemberApi.getProjectMemberList(this.project.id)
        this.memberList = response.data
      } finally { this.loading = false }
    },
    async handleDelete(member) {
      try { await this.$confirm('确认将“' + member.nickname + '”移出项目吗？', '提示', { type: 'warning' }) }
      catch (error) { if (error === 'cancel' || error === 'close') return; throw error }
      await ProjectMemberApi.deleteProjectMember(this.project.id, member.userId)
      this.$message.success('成员已移出项目')
      await this.getMemberList()
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

