<template>
  <div class="app-container oa-plan-report">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="成员姓名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入成员姓名"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划类型" prop="type">
        <el-radio-group v-model="queryParams.type" @change="handleTypeChange">
          <el-radio-button
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.value"
          >{{ item.label }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="统计周期">
        <el-date-picker
          v-model="periodDate"
          :type="queryParams.type === OA_PLAN_TYPE.MONTH ? 'month' : 'date'"
          :format="queryParams.type === OA_PLAN_TYPE.MONTH ? 'yyyy-MM' : 'yyyy-MM-dd'"
          value-format="yyyy-MM-dd"
          :clearable="false"
          placeholder="请选择统计日期"
          style="width: 240px"
          @change="handlePeriodDateChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handlePeriodChange(-1)">上一周期</el-button>
        <el-button @click="handlePeriodChange(1)">下一周期</el-button>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 报表列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="部门" prop="deptName" min-width="120" />
      <el-table-column label="成员" prop="userName" min-width="110" />
      <el-table-column label="计划" min-width="260">
        <template slot-scope="scope">
          <template v-if="scope.row.planId">
            <div class="plan-title">
              <span v-if="scope.row.label">【{{ scope.row.label }}】</span>{{ scope.row.title }}
            </div>
            <div class="plan-content">{{ scope.row.content }}</div>
            <div v-if="scope.row.fileUrls && scope.row.fileUrls.length" class="plan-files">
              <el-link
                v-for="(fileUrl, index) in scope.row.fileUrls"
                :key="fileUrl"
                :href="fileUrl"
                class="plan-file-link"
                target="_blank"
                type="primary"
              >附件 {{ Number(index) + 1 }}</el-link>
            </div>
          </template>
          <span v-else class="not-submitted">未提交</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag
            v-if="scope.row.planId"
            :type="DICT_TYPE.OA_PLAN_STATUS"
            :value="scope.row.status"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="总结" prop="summary" min-width="180" show-overflow-tooltip />
      <el-table-column label="点评" min-width="180">
        <template slot-scope="scope">
          <div class="pre-line">{{ scope.row.comment || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="90" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.planId"
            v-hasPermi="['oa:plan:comment']"
            type="text"
            size="mini"
            @click="openCommentForm(scope.row.planId)"
          >点评</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 计划点评表单 -->
    <Dialog title="点评工作计划" v-model="commentDialogVisible" width="560px">
      <el-form
        ref="commentForm"
        v-loading="commentLoading"
        :model="commentFormData"
        :rules="commentFormRules"
        label-width="80px"
      >
        <el-form-item label="点评内容" prop="comment">
          <el-input
            v-model="commentFormData.comment"
            type="textarea"
            :rows="5"
            maxlength="1000"
            placeholder="请输入本次点评内容"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="commentLoading" @click="submitComment">确 定</el-button>
        <el-button @click="commentDialogVisible = false">取 消</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as PlanApi from '@/api/oa/plan'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_PLAN_TYPE } from '@/views/oa/utils/constants-collab'

/** 获取起止日期范围（含结束日的最后一秒） */
function getDateRange(beginDate, endDate) {
  return [
    dayjs(beginDate).startOf('d').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(endDate).endOf('d').format('YYYY-MM-DD HH:mm:ss')
  ]
}

export default {
  name: 'OaPlanReport',
  components: { Dialog },
  data() {
    return {
      DICT_TYPE,
      OA_PLAN_TYPE,
      loading: true,
      total: 0,
      list: [],
      periodDate: dayjs().format('YYYY-MM-DD'),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userName: undefined,
        type: OA_PLAN_TYPE.DAY,
        createTime: []
      },
      commentDialogVisible: false,
      commentLoading: false,
      commentFormData: { id: 0, comment: '' },
      commentFormRules: {
        comment: [{ required: true, whitespace: true, message: '点评内容不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PLAN_TYPE)
    }
  },
  created() {
    this.updatePeriod()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return PlanApi.getPlanReportPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.type = OA_PLAN_TYPE.DAY
      this.periodDate = dayjs().format('YYYY-MM-DD')
      this.updatePeriod()
      return this.handleQuery()
    },
    handleTypeChange() {
      this.periodDate = dayjs().format('YYYY-MM-DD')
      this.updatePeriod()
      return this.handleQuery()
    },
    handlePeriodChange(step) {
      const unit =
        this.queryParams.type === OA_PLAN_TYPE.DAY
          ? 'day'
          : this.queryParams.type === OA_PLAN_TYPE.WEEK
            ? 'week'
            : 'month'
      this.periodDate = dayjs(this.periodDate).add(step, unit).format('YYYY-MM-DD')
      this.updatePeriod()
      return this.handleQuery()
    },
    handlePeriodDateChange() {
      this.updatePeriod()
      return this.handleQuery()
    },
    /** 更新统计周期 */
    updatePeriod() {
      // 查询时间覆盖整个自然周期，包含结束日的最后一秒
      const beginTime = this.getPeriodBeginTime(dayjs(this.periodDate))
      this.periodDate = beginTime.format('YYYY-MM-DD')
      const endTime =
        this.queryParams.type === OA_PLAN_TYPE.DAY
          ? beginTime
          : this.queryParams.type === OA_PLAN_TYPE.WEEK
            ? beginTime.add(6, 'day')
            : beginTime.endOf('month')
      this.queryParams.createTime = getDateRange(beginTime, endTime)
    },
    /** 获得统计周期开始时间 */
    getPeriodBeginTime(date) {
      if (this.queryParams.type === OA_PLAN_TYPE.DAY) {
        return date.startOf('day')
      }
      if (this.queryParams.type === OA_PLAN_TYPE.WEEK) {
        // 周报固定从周一开始，周日归入当前周
        const dayOfWeek = date.day()
        return date.subtract(dayOfWeek === 0 ? 6 : dayOfWeek - 1, 'day').startOf('day')
      }
      return date.startOf('month')
    },
    openCommentForm(planId) {
      this.commentFormData = { id: planId, comment: '' }
      this.commentDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.commentForm) this.$refs.commentForm.clearValidate()
      })
    },
    submitComment() {
      this.$refs.commentForm.validate(valid => {
        if (!valid) return
        // 提交请求，禁用按钮避免重复点评
        this.commentLoading = true
        PlanApi.addPlanComment(this.commentFormData.id, this.commentFormData.comment.trim()).then(() => {
          this.$modal.msgSuccess('点评成功')
          this.commentDialogVisible = false
          // 刷新报表
          return this.getList()
        }).finally(() => {
          this.commentLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.pre-line {
  white-space: pre-line;
}

.plan-title {
  font-weight: 500;
}

.plan-content {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
  white-space: pre-line;
}

.plan-files {
  margin-top: 4px;
}

.plan-file-link {
  margin-right: 10px;
}

.not-submitted {
  color: #c0c4cc;
}
</style>
