<!-- MES 排班计划 - 班组列表（左：班组表格，右：成员预览） -->
<template>
  <div>
    <el-button
      v-if="!isDetail"
      type="primary"
      plain
      size="small"
      icon="el-icon-plus"
      class="team-add"
      @click="openTeamSelect"
    >添加班组</el-button>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-table
          v-loading="loading"
          :data="list"
          stripe
          :show-overflow-tooltip="true"
          border
          highlight-current-row
          @current-change="handleTeamSelect"
        >
          <el-table-column label="班组编号" align="center" prop="teamId" width="100" />
          <el-table-column label="班组编码" align="center" prop="teamCode" min-width="100" />
          <el-table-column label="班组名称" align="center" prop="teamName" min-width="100" />
          <el-table-column label="备注" align="center" prop="remark" min-width="120" />
          <el-table-column v-if="!isDetail" label="操作" align="center" width="80">
            <template v-slot="scope">
              <el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never" class="member-card">
          <div slot="header" class="member-card-header">
            <span>{{ selectedTeamName ? `「${selectedTeamName}」班组成员` : '班组成员' }}</span>
          </div>
          <div v-if="!selectedTeamId" class="member-empty-tip">
            <el-empty description="请点击左侧班组查看成员" :image-size="60" />
          </div>
          <el-table
            v-else
            v-loading="memberLoading"
            :data="memberList"
            stripe
            :show-overflow-tooltip="true"
            border
            size="small"
          >
            <el-table-column label="用户昵称" align="center" prop="nickname" min-width="100" />
            <el-table-column label="手机号" align="center" prop="telephone" min-width="120" />
            <el-table-column label="备注" align="center" prop="remark" min-width="100" />
          </el-table>
          <div v-if="selectedTeamId && !memberLoading && memberList.length === 0" class="member-empty-tip">
            <el-empty description="暂无成员" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <cal-team-select-dialog ref="teamDialog" :multiple="true" @selected="handleTeamsSelected" />
  </div>
</template>

<script>
import { CalPlanTeamApi } from '@/api/mes/cal/plan/team'
import { CalTeamMemberApi } from '@/api/mes/cal/team/member'
import CalTeamSelectDialog from '@/views/mes/cal/team/components/CalTeamSelectDialog.vue'

export default {
  name: 'CalPlanTeamList',
  components: { CalTeamSelectDialog },
  props: {
    planId: { type: Number, default: undefined },
    formType: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      list: [],
      selectedTeamId: undefined,
      selectedTeamName: '',
      memberLoading: false,
      memberList: []
    }
  },
  computed: {
    isDetail() {
      return this.formType === 'detail'
    }
  },
  watch: {
    planId: {
      immediate: true,
      handler(value) {
        if (value) this.getList()
      }
    }
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await CalPlanTeamApi.getPlanTeamListByPlan(this.planId)
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    async handleTeamSelect(row) {
      if (!row) {
        this.selectedTeamId = undefined
        this.selectedTeamName = ''
        this.memberList = []
        return
      }
      this.selectedTeamId = row.teamId
      this.selectedTeamName = row.teamName || ''
      this.memberLoading = true
      try {
        const response = await CalTeamMemberApi.getTeamMemberListByTeam(row.teamId)
        this.memberList = response.data
      } finally {
        this.memberLoading = false
      }
    },
    openTeamSelect() {
      this.$refs.teamDialog.open(this.list.map(item => item.teamId))
    },
    async handleTeamsSelected(rows) {
      if (!rows || rows.length === 0) return
      const existingTeamIds = new Set(this.list.map(item => item.teamId))
      const newTeams = rows.filter(team => !existingTeamIds.has(team.id))
      if (newTeams.length === 0) {
        this.$modal.msgWarning('所选班组已全部添加过')
        return
      }
      this.loading = true
      try {
        for (const team of newTeams) {
          await CalPlanTeamApi.createPlanTeam({ planId: this.planId, teamId: team.id })
        }
        this.$modal.msgSuccess(`成功添加 ${newTeams.length} 个班组`)
        await this.getList()
      } finally {
        this.loading = false
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除计划班组？')
        await CalPlanTeamApi.deletePlanTeam(id)
        this.$modal.msgSuccess('删除成功')
        const deletedItem = this.list.find(item => item.id === id)
        if (deletedItem && deletedItem.teamId === this.selectedTeamId) {
          this.selectedTeamId = undefined
          this.selectedTeamName = ''
          this.memberList = []
        }
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    }
  }
}
</script>

<style scoped>
.team-add { margin-bottom: 10px; }
.member-card { height: 100%; }
.member-card-header { display: flex; align-items: center; font-size: 14px; font-weight: 600; }
.member-empty-tip { display: flex; align-items: center; justify-content: center; min-height: 120px; }
</style>
