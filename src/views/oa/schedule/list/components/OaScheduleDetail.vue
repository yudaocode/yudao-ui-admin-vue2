<template>
  <Dialog title="日程详情" v-model="dialogVisible" width="800px">
    <div v-loading="detailLoading">
      <!-- 日程信息 -->
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="日程标题">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.creatorName }}</el-descriptions-item>
        <el-descriptions-item label="日程类型">
          <dict-tag :type="DICT_TYPE.OA_SCHEDULE_TYPE" :value="detail.type" />
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <dict-tag :type="DICT_TYPE.OA_PRIORITY" :value="detail.priority" />
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatDate(detail.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formatDate(detail.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="日程提醒">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="detail.remind" />
        </el-descriptions-item>
        <el-descriptions-item label="日程描述">
          <div class="description-text">{{ detail.description }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 参与人阅读情况 -->
      <div v-if="detail" class="participants">
        <div class="participants-title">参与人阅读情况</div>
        <el-table :data="detail.participants || []" border>
          <el-table-column label="参与人" prop="userName" min-width="140" />
          <el-table-column label="阅读状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.readStatus ? 'success' : 'info'">
                {{ scope.row.readStatus ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="首次阅读时间"
            prop="readTime"
            :formatter="dateFormatter"
            min-width="180"
          />
        </el-table>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        v-if="detail && String(detail.creator) === String($store.getters.userId)"
        v-hasPermi="['oa:schedule:update']"
        type="primary"
        :disabled="detailLoading"
        @click="handleEdit"
      >修 改</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as ScheduleApi from '@/api/oa/schedule'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate, dateFormatter } from '@/utils/formatTime'

export default {
  name: 'OaScheduleDetail',
  components: { Dialog },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      detailLoading: false,
      detail: undefined
    }
  },
  methods: {
    formatDate,
    dateFormatter,
    /** 修改日程 */
    handleEdit() {
      if (!this.detail || !this.detail.id) return
      this.dialogVisible = false
      this.$emit('edit', this.detail.id)
    },
    /** 打开日程详情 */
    open(id) {
      if (this.detailLoading) return
      this.dialogVisible = true
      this.detail = undefined
      this.detailLoading = true
      // 查询并展示详情，关闭弹窗时不继续标记已读
      ScheduleApi.getSchedule(id).then(response => {
        if (!this.dialogVisible) return
        this.detail = response.data
        return this.$nextTick().then(() => {
          // 仅本人参与且尚未阅读时提交，列表、日历和编辑表单不调用此接口
          const participant = this.detail &&
            (this.detail.participants || []).find(item => item.userId === this.$store.getters.userId)
          if (this.dialogVisible && participant && !participant.readStatus) {
            return ScheduleApi.updateScheduleReadStatus(id).then(() => {
              return ScheduleApi.getSchedule(id).then(refreshResponse => {
                if (this.dialogVisible) {
                  this.detail = refreshResponse.data
                }
              })
            })
          }
        })
      }).finally(() => {
        this.detailLoading = false
      })
    }
  }
}
</script>

<style scoped>
.participants {
  margin-top: 20px;
}

.participants-title {
  margin-bottom: 12px;
  font-weight: 600;
}

.description-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
