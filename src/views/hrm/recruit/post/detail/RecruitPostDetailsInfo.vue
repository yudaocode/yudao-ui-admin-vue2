<template>
  <el-card shadow="never">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="basicInfo">
        <template slot="title"><span class="collapse-title">基本信息</span></template>
        <el-descriptions :column="4">
          <el-descriptions-item label="职位名称">{{ post.postName || '-' }}</el-descriptions-item>
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
          <el-descriptions-item label="招聘人数">{{ valueOrDash(post.recruitNum) }}</el-descriptions-item>
          <el-descriptions-item label="已入职人数">{{ post.hasEntryNum == null ? 0 : post.hasEntryNum }}</el-descriptions-item>
          <el-descriptions-item
            label="招聘原因"
            :span="2"
          >{{ post.reason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作经验">
            <dict-tag
              v-if="post.workTime != null"
              :type="DICT_TYPE.HRM_RECRUIT_WORK_TIME"
              :value="post.workTime"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="学历要求">
            <dict-tag
              v-if="post.educationRequire != null"
              :type="DICT_TYPE.HRM_RECRUIT_POST_EDUCATION"
              :value="post.educationRequire"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="薪资范围">{{ formatRecruitPostSalary(post) }}</el-descriptions-item>
          <el-descriptions-item label="年龄要求">{{ formatRecruitPostAge(post) }}</el-descriptions-item>
          <el-descriptions-item label="最迟到岗时间">{{ post.latestEntryTime ? formatDate(post.latestEntryTime) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="紧急程度">
            <dict-tag
              v-if="post.emergencyLevel != null"
              :type="DICT_TYPE.HRM_RECRUIT_EMERGENCY_LEVEL"
              :value="post.emergencyLevel"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="招聘负责人">{{ post.ownerEmployeeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位类型">{{ post.postTypeName || '-' }}</el-descriptions-item>
          <el-descriptions-item
            label="面试官"
            :span="2"
          >{{ interviewEmployeeNames }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <dict-tag
              v-if="post.status != null"
              :type="DICT_TYPE.HRM_RECRUIT_POST_STATUS"
              :value="post.status"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="post.status === HrmRecruitPostStatus.STOPPED"
            label="停止原因"
            :span="2"
          >{{ post.stopReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ post.createTime ? formatDate(post.createTime) : '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item name="description">
        <template slot="title"><span class="collapse-title">职位描述</span></template>
        <div class="description">{{ post.description || '-' }}</div>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { HrmRecruitPostStatus } from '@/views/hrm/utils/constants'
import { formatRecruitPostAge, formatRecruitPostSalary } from '@/views/hrm/utils/format'

export default {
  name: 'HrmRecruitPostDetailsInfo',
  props: { post: { type: Object, required: true }},
  data() {
    return { DICT_TYPE, HrmRecruitPostStatus, activeNames: ['basicInfo', 'description'] }
  },
  computed: {
    interviewEmployeeNames() {
      return (this.post.interviewEmployeeNames || []).join('、') || '-'
    }
  },
  methods: {
    formatDate,
    formatRecruitPostAge,
    formatRecruitPostSalary,
    valueOrDash(value) { return value == null ? '-' : value }
  }
}
</script>

<style scoped>
.collapse-title { font-size: 16px; font-weight: 700; }
.description { min-height: 32px; white-space: pre-wrap; word-break: break-word; }
</style>
