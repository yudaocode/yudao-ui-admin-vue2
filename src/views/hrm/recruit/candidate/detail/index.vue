<template>
  <div class="app-container">
    <recruit-candidate-details-header
      :candidate="candidate"
      :loading="loading"
    >
      <el-button
        v-hasPermi="['hrm:recruit:candidate:update']"
        :disabled="!candidate.id"
        type="primary"
        icon="el-icon-edit"
        @click="openForm"
      >编辑</el-button>
    </recruit-candidate-details-header>
    <el-tabs
      v-model="activeTab"
      class="detail-tabs"
    >
      <el-tab-pane
        label="详细资料"
        name="detail"
      ><recruit-candidate-details-info :candidate="candidate" /></el-tab-pane>
      <el-tab-pane
        label="材料附件"
        name="file"
        lazy
      ><recruit-candidate-material-files :candidate="candidate" /></el-tab-pane>
      <el-tab-pane
        label="面试记录"
        name="interview"
        lazy
      ><recruit-candidate-interview-list :interview-list="interviewList" /></el-tab-pane>
      <el-tab-pane
        label="操作记录"
        name="operateLog"
      >
        <el-card shadow="never"><el-timeline><el-timeline-item
          v-for="(log, index) in logList"
          :key="index"
          :timestamp="formatDate(log.createTime)"
          placement="top"
        ><div class="log-content"><el-tag type="success">{{ log.userName }}</el-tag><span>{{ log.action }}</span></div><span
          slot="dot"
          :style="{ backgroundColor: getUserTypeColor(log.userType) }"
          class="log-dot"
        >{{ getUserTypeInitial(log.userType) }}</span></el-timeline-item></el-timeline></el-card>
      </el-tab-pane>
    </el-tabs>
    <recruit-candidate-form
      ref="form"
      @success="getCandidate"
    />
  </div>
</template>
<script>
import { DICT_TYPE, getDictData, getDictDataLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { getOperateLogPage } from '@/api/hrm/operate-log'
import { getRecruitCandidate } from '@/api/hrm/recruit/candidate'
import { getRecruitInterviewListByCandidate } from '@/api/hrm/recruit/interview'
import RecruitCandidateForm from '@/views/hrm/recruit/candidate/RecruitCandidateForm.vue'
import { HrmBizType } from '@/views/hrm/utils/constants'
import RecruitCandidateDetailsHeader from './RecruitCandidateDetailsHeader.vue'
import RecruitCandidateDetailsInfo from './RecruitCandidateDetailsInfo.vue'
import RecruitCandidateInterviewList from './RecruitCandidateInterviewList.vue'
import RecruitCandidateMaterialFiles from './RecruitCandidateMaterialFiles.vue'
export default {
  name: 'HrmRecruitCandidateDetail',
  components: { RecruitCandidateForm, RecruitCandidateDetailsHeader, RecruitCandidateDetailsInfo, RecruitCandidateInterviewList, RecruitCandidateMaterialFiles },
  data() { return { candidateId: undefined, loading: true, activeTab: 'detail', candidate: {}, interviewList: [], logList: [] } },
  created() { this.candidateId = Number(this.$route.params.id); if (!Number.isSafeInteger(this.candidateId) || this.candidateId <= 0) { this.$modal.msgWarning('参数错误，招聘候选人不能为空！'); this.close(); return } this.getCandidate() },
  methods: {
    formatDate,
    close() { this.$store.dispatch('tagsView/delView', this.$route); this.$router.push({ name: 'HrmRecruitCandidate' }) },
    async getCandidate() { this.loading = true; try { const response = await getRecruitCandidate(this.candidateId); if (!response.data) { this.$modal.msgWarning('招聘候选人不存在'); this.close(); return } this.candidate = response.data; await Promise.all([this.getInterviewList(), this.getOperateLog()]) } finally { this.loading = false } },
    async getInterviewList() { const response = await getRecruitInterviewListByCandidate(this.candidateId); this.interviewList = response.data },
    async getOperateLog() { const response = await getOperateLogPage({ bizType: HrmBizType.RECRUIT_CANDIDATE, bizId: this.candidateId }); this.logList = response.data.list },
    openForm() { this.$refs.form.open('update', this.candidateId) },
    getUserTypeColor(type) { const dict = getDictData(DICT_TYPE.USER_TYPE, type); const colors = { success: '#67C23A', info: '#909399', warning: '#E6A23C', danger: '#F56C6C' }; return (dict && colors[dict.colorType]) || '#409EFF' },
    getUserTypeInitial(type) { return getDictDataLabel(DICT_TYPE.USER_TYPE, type).charAt(0) }
  }
}
</script>
<style scoped>
.detail-tabs { margin-top: 16px; }
.log-content { display: flex; align-items: center; gap: 8px; }
.log-dot { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; border-radius: 50%; color: #fff; font-size: 12px; }
</style>
