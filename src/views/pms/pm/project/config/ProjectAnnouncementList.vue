<template>
  <div>
    <!-- 公告列表标题与操作 -->
    <div class="mb-16px flex items-center justify-between">
      <h3 class="m-0 text-18px font-600">项目公告（{{ list.length }}）</h3>
      <el-button
        v-if="editable"
        v-hasPermi="['pms:pm:project:update']"
        type="primary"
        @click="openForm('create')"
      >
        发布公告
      </el-button>
    </div>

    <!-- 公告列表 -->
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true">
      <el-table-column label="公告内容" min-width="360">
        <template slot-scope="scope">
          <div class="line-clamp-2 whitespace-pre-wrap leading-22px">
            {{ scope.row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="附件" width="110">
        <template slot-scope="scope">
          <el-dropdown v-if="scope.row.fileUrls && scope.row.fileUrls.length" trigger="click">
            <el-button type="text">{{ scope.row.fileUrls.length }} 个附件</el-button>
            <template slot="dropdown">
              <el-dropdown-menu>
                <el-dropdown-item v-for="(url, index) in scope.row.fileUrls" :key="url">
                  <el-link :href="url" target="_blank">附件 {{ Number(index) + 1 }}</el-link>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="发布人" min-width="140" prop="creatorUserName" />
      <el-table-column :formatter="dateFormatter" label="发布时间" prop="createTime" width="180" />
      <el-table-column v-if="editable" align="center" fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['pms:pm:project:update']" type="text"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['pms:pm:project:update']" type="text" class="delete-button"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改项目公告对话框 -->
    <ProjectAnnouncementForm ref="formRef" @success="getList" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import * as ProjectAnnouncementApi from '@/api/pms/pm/project/announcement'
import ProjectAnnouncementForm from './ProjectAnnouncementForm.vue'
export default {
  name: 'PmsProjectAnnouncementList',
  components: { ProjectAnnouncementForm },
  props: { projectId: { type: Number, required: true }, editable: Boolean },
  data() { return { loading: true, list: [] } },
  watch: { projectId: { immediate: true, handler() { this.getList() } } },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await ProjectAnnouncementApi.getProjectAnnouncementList(this.projectId)
        this.list = response.data
      } finally { this.loading = false }
    },
    openForm(type, id) { this.$refs.formRef.open(type, this.projectId, id) },
    async handleDelete(id) {
      try { await this.$confirm('是否确认删除该公告？', '提示', { type: 'warning' }) }
      catch (error) { if (error === 'cancel' || error === 'close') return; throw error }
      await ProjectAnnouncementApi.deleteProjectAnnouncement(id)
      this.$message.success('删除成功')
      await this.getList()
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

