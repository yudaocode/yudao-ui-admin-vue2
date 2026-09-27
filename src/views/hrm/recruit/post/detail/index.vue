<template>
  <div class="app-container">
    <recruit-post-details-header
      :loading="loading"
      :post="post"
    >
      <el-button
        v-hasPermi="['hrm:recruit:post:update']"
        :disabled="!post.id"
        type="primary"
        icon="el-icon-edit"
        @click="openForm"
      >编辑</el-button>
    </recruit-post-details-header>

    <el-tabs class="detail-tabs">
      <el-tab-pane label="详细资料">
        <recruit-post-details-info :post="post" />
      </el-tab-pane>
      <el-tab-pane label="操作日志">
        <el-card shadow="never">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in logList"
              :key="index"
              :timestamp="formatDate(log.createTime)"
              placement="top"
            >
              <div class="log-content">
                <el-tag type="success">{{ log.userName }}</el-tag>
                <span>{{ log.action }}</span>
              </div>
              <span
                slot="dot"
                :style="{ backgroundColor: getUserTypeColor(log.userType) }"
                class="log-dot"
              >{{ getUserTypeInitial(log.userType) }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <recruit-post-form
      ref="form"
      @success="getPost"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictData, getDictDataLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { getOperateLogPage } from '@/api/hrm/operate-log'
import { getRecruitPost } from '@/api/hrm/recruit/post'
import RecruitPostForm from '@/views/hrm/recruit/post/RecruitPostForm.vue'
import { HrmBizType } from '@/views/hrm/utils/constants'
import RecruitPostDetailsHeader from './RecruitPostDetailsHeader.vue'
import RecruitPostDetailsInfo from './RecruitPostDetailsInfo.vue'

export default {
  name: 'HrmRecruitPostDetail',
  components: { RecruitPostForm, RecruitPostDetailsHeader, RecruitPostDetailsInfo },
  data() {
    return { postId: undefined, loading: true, post: {}, logList: [] }
  },
  created() {
    this.postId = Number(this.$route.params.id)
    if (!Number.isSafeInteger(this.postId) || this.postId <= 0) {
      this.$modal.msgWarning('参数错误，招聘职位不能为空！')
      this.close()
      return
    }
    this.getPost()
  },
  methods: {
    formatDate,
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmRecruitPost' })
    },
    async getPost() {
      this.loading = true
      try {
        const response = await getRecruitPost(this.postId)
        if (!response.data) {
          this.$modal.msgWarning('招聘职位不存在')
          this.close()
          return
        }
        this.post = response.data
        await this.getOperateLog()
      } finally {
        this.loading = false
      }
    },
    async getOperateLog() {
      const response = await getOperateLogPage({
        bizType: HrmBizType.RECRUIT_POST,
        bizId: this.postId
      })
      this.logList = response.data.list
    },
    openForm() { this.$refs.form.open('update', this.postId) },
    getUserTypeColor(type) {
      const dict = getDictData(DICT_TYPE.USER_TYPE, type)
      const colors = { success: '#67C23A', info: '#909399', warning: '#E6A23C', danger: '#F56C6C' }
      return (dict && colors[dict.colorType]) || '#409EFF'
    },
    getUserTypeInitial(type) {
      return getDictDataLabel(DICT_TYPE.USER_TYPE, type).charAt(0)
    }
  }
}
</script>

<style scoped>
.detail-tabs { margin-top: 16px; }
.log-content { display: flex; align-items: center; gap: 8px; }
.log-dot { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; border-radius: 50%; color: #fff; font-size: 12px; }
</style>
