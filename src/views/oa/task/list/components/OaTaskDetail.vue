<template>
  <div>
    <Dialog title="任务详情" v-model="dialogVisible" width="900px">
    <div v-loading="loading" class="task-detail">
      <!-- 任务信息 -->
      <el-card v-if="task" shadow="never" class="detail-card">
        <div slot="header" class="card-header">
          <span class="card-title">任务信息</span>
        </div>
        <el-descriptions :column="2" border class="task-descriptions">
          <el-descriptions-item label="任务标题" :span="2">{{ task.title }}</el-descriptions-item>
          <el-descriptions-item label="发布人">
            {{ task.publisherUserName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布部门">
            {{ task.publisherDeptName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="任务类型">
            <dict-tag :type="DICT_TYPE.OA_TASK_TYPE" :value="task.type" />
          </el-descriptions-item>
          <el-descriptions-item label="总体状态">
            <dict-tag :type="DICT_TYPE.OA_TASK_STATUS" :value="task.status" />
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDate(task.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ formatDate(task.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="是否置顶">
            <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="task.top || false" />
          </el-descriptions-item>
          <el-descriptions-item label="是否取消">
            <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="task.canceled || false" />
          </el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">
            <div class="pre-wrap">{{ task.description }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="任务评价" :span="2">
            <div class="pre-wrap">{{ task.comment || '-' }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 总体进度 -->
        <div class="progress-block">
          <div class="progress-title">总体进度</div>
          <el-progress :percentage="getTaskStatusProgress(task.status)" />
        </div>
      </el-card>

      <!-- 接收人状态 -->
      <el-card v-if="task" shadow="never" class="detail-card">
        <div slot="header" class="card-header">
          <span class="card-title">接收人状态</span>
        </div>
        <el-table :data="task.receivers || []" border stripe>
          <el-table-column label="接收人" prop="userName" min-width="120" />
          <el-table-column label="部门" prop="deptName" min-width="120" />
          <el-table-column label="状态" prop="status" align="center" width="110">
            <template slot-scope="scope">
              <dict-tag :type="DICT_TYPE.OA_TASK_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="进度" prop="status" min-width="180">
            <template slot-scope="scope">
              <el-progress :percentage="getTaskStatusProgress(scope.row.status)" />
            </template>
          </el-table-column>
          <el-table-column
            label="更新时间"
            prop="updateTime"
            :formatter="dateFormatter"
            align="center"
            width="180"
          />
        </el-table>
      </el-card>

      <!-- 反馈日志 -->
      <el-card v-if="task" shadow="never" class="detail-card">
        <div slot="header" class="card-header card-header--between">
          <span class="card-title">反馈日志</span>
          <el-button
            v-if="!task.canceled"
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="
              loading ||
              (detailMode !== 'published' &&
                (task.receiverStatus || OA_TASK_STATUS.NEW) >= OA_TASK_STATUS.SUBMITTED)
            "
            @click="openFeedbackForm"
          >新增反馈</el-button>
        </div>
        <el-table :data="task.logs || []" border stripe>
          <el-table-column label="反馈人" prop="userName" align="center" width="120" />
          <el-table-column label="任务状态" prop="status" align="center" width="110">
            <template slot-scope="scope">
              <dict-tag
                v-if="scope.row.status"
                :type="DICT_TYPE.OA_TASK_STATUS"
                :value="scope.row.status"
              />
            </template>
          </el-table-column>
          <el-table-column label="反馈内容" prop="content" min-width="260">
            <template slot-scope="scope">
              <div class="pre-wrap">{{ scope.row.content }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="反馈时间"
            prop="createTime"
            :formatter="dateFormatter"
            align="center"
            width="180"
          />
        </el-table>
      </el-card>
    </div>
    </Dialog>
    <!-- 新增反馈弹窗，与详情分离 -->
    <oa-task-feedback-form v-if="dialogVisible" ref="feedbackFormRef" @success="handleFeedbackSuccess" />
  </div>
</template>

<script>
import * as TaskApi from '@/api/oa/task'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { getTaskStatusProgress } from '@/views/oa/utils/format-collab'
import { OA_TASK_STATUS } from '@/views/oa/utils/constants-collab'
import OaTaskFeedbackForm from './OaTaskFeedbackForm.vue'

export default {
  name: 'OaTaskDetail',
  components: { Dialog, OaTaskFeedbackForm },
  data() {
    return {
      DICT_TYPE,
      OA_TASK_STATUS,
      dialogVisible: false,
      loading: false,
      task: undefined,
      detailMode: 'published'
    }
  },
  methods: {
    dateFormatter,
    formatDate,
    getTaskStatusProgress,
    /** 打开详情 */
    open(id, mode) {
      this.dialogVisible = true
      this.detailMode = mode
      this.task = undefined
      this.getTask(id)
    },
    /** 查询任务详情 */
    getTask(id) {
      this.loading = true
      return TaskApi.getTask(id).then(response => {
        this.task = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    /** 打开反馈表单 */
    openFeedbackForm() {
      if (!this.task || this.task.canceled) return
      this.$refs.feedbackFormRef.open(this.task, this.detailMode)
    },
    /** 反馈成功后刷新详情和列表 */
    handleFeedbackSuccess() {
      this.$emit('success')
      if (this.task && this.task.id) {
        return this.getTask(this.task.id)
      }
      return Promise.resolve()
    }
  }
}
</script>

<style scoped>
.task-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card >>> .el-card__header {
  padding: 10px 16px;
}

.card-header--between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-weight: 700;
}

.progress-block {
  margin-top: 16px;
}

.progress-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
}

.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.task-descriptions >>> .el-descriptions__label {
  width: 100px;
  white-space: nowrap;
}
</style>
