<template>
  <div
    v-loading="loading"
    class="details-header"
  >
    <div class="header-row">
      <div class="title-wrap">
        <div class="title-line">
          <span class="title">{{ candidate.name || '-' }}</span>
          <dict-tag
            v-if="candidate.status != null"
            :type="DICT_TYPE.HRM_RECRUIT_CANDIDATE_STATUS"
            :value="candidate.status"
          />
        </div>
        <div class="sub-title">候选人编号：{{ candidate.id || '-' }}</div>
      </div>
      <div><slot /></div>
    </div>
    <el-card
      class="summary-card"
      shadow="never"
    >
      <el-descriptions
        :column="5"
        direction="vertical"
      >
        <el-descriptions-item label="应聘职位">{{ candidate.postName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用人部门">{{ candidate.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="招聘负责人">{{ candidate.ownerEmployeeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="招聘渠道">{{ candidate.channelName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前面试">{{ candidate.interviewTime ? formatDate(candidate.interviewTime) : '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
export default {
  name: 'HrmRecruitCandidateDetailsHeader',
  props: { candidate: { type: Object, required: true }, loading: { type: Boolean, required: true }},
  data() { return { DICT_TYPE } },
  methods: { formatDate }
}
</script>
<style scoped>
.details-header { padding: 20px; background: #fff; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.title-wrap { min-width: 0; }
.title-line { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.title { font-size: 20px; font-weight: 700; word-break: break-all; }
.sub-title { margin-top: 6px; color: #909399; font-size: 14px; }
.summary-card { margin-top: 10px; }
</style>
