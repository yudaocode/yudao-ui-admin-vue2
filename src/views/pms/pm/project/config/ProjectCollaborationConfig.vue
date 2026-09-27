<template>
  <div>
    <el-table :data="configurationList">
      <el-table-column label="事项类型" prop="name" width="180" />
      <el-table-column label="适用项目" prop="projectTypeName" min-width="220" />
      <el-table-column label="说明" prop="description" min-width="360" />
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['pms:pm:work-item:update']" type="text"
            @click="openStatus(scope.row.type)"
          >
            状态设置
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <WorkItemStatusList ref="statusListRef" />
  </div>
</template>

<script>
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { PmsWorkItemConfigurationOptions } from '@/views/pms/pm/utils/constants'
import WorkItemStatusList from '@/views/pms/pm/workitem/status/WorkItemStatusList.vue'
export default {
  name: 'PmsProjectCollaborationConfig',
  components: { WorkItemStatusList },
  props: { projectId: { type: Number, required: true }, projectType: { type: Number, required: true } },
  computed: {
    configurationList() {
      return PmsWorkItemConfigurationOptions
        .filter(option => option.projectTypes.includes(this.projectType))
        .map(option => ({
          ...option,
          name: getDictLabel(DICT_TYPE.PMS_WORK_ITEM_TYPE, option.type),
          projectTypeName: option.projectTypes
            .map(projectType => getDictLabel(DICT_TYPE.PMS_PROJECT_TYPE, projectType))
            .join('、')
        }))
    }
  },
  methods: {
    openStatus(type) { this.$refs.statusListRef.open(this.projectId, type) }
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

