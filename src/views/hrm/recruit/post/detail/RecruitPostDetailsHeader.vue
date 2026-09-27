<template>
  <div
    v-loading="loading"
    class="details-header"
  >
    <div class="header-row">
      <div class="title-wrap">
        <div class="title-line">
          <span class="title">{{ post.postName || '-' }}</span>
          <dict-tag
            v-if="post.status != null"
            :type="DICT_TYPE.HRM_RECRUIT_POST_STATUS"
            :value="post.status"
          />
        </div>
        <div class="sub-title">职位编号：{{ post.id || '-' }}</div>
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
        <el-descriptions-item label="用人部门">{{ post.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作性质">
          <dict-tag
            v-if="post.jobNature != null"
            :type="DICT_TYPE.HRM_RECRUIT_JOB_NATURE"
            :value="post.jobNature"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="工作城市">{{ post.areaName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="招聘负责人">{{ post.ownerEmployeeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="招聘进度">{{ formatRecruitPostProgress(post) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatRecruitPostProgress } from '@/views/hrm/utils/format'

export default {
  name: 'HrmRecruitPostDetailsHeader',
  props: {
    post: { type: Object, required: true },
    loading: { type: Boolean, required: true }
  },
  data() { return { DICT_TYPE } },
  methods: { formatRecruitPostProgress }
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
