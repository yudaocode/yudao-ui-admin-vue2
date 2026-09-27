<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1080px" top="8vh" @closed="resetClosed">
    <el-form
      ref="form"
      v-loading="formLoading"
      :disabled="readonly"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>
      <el-row :gutter="20">
        <el-col v-if="formData.type === OA_WORK_REPORT_TYPE.WEEKLY" :span="16">
          <el-form-item label="汇报周次">
            <el-select v-model="reportWeek" style="width: 100%" @change="handleWeekChange">
              <el-option
                v-for="item in weekOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type === OA_WORK_REPORT_TYPE.MONTHLY" :span="8">
          <el-form-item label="汇报月份">
            <el-date-picker
              v-model="periodValue"
              type="month"
              value-format="timestamp"
              style="width: 100%"
              :clearable="false"
              @change="handlePeriodChange"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="date"
              value-format="timestamp"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="date"
              value-format="timestamp"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="汇报标题" prop="title">
        <el-input
          v-model="formData.title"
          maxlength="255"
          placeholder="留空时将根据汇报周期自动生成"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="工作总结" prop="summary">
        <el-input
          v-model="formData.summary"
          :rows="3"
          maxlength="5000"
          placeholder="请输入工作总结补充说明"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="工作计划" prop="plan">
        <el-input
          v-model="formData.plan"
          :rows="3"
          maxlength="5000"
          placeholder="请输入工作计划补充说明"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="问题与协调" prop="problem">
        <el-input
          v-model="formData.problem"
          :rows="3"
          maxlength="5000"
          placeholder="请输入存在的问题或需要协调的事项"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          :rows="2"
          maxlength="1000"
          placeholder="请输入备注"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <UploadFile v-model="formData.fileUrls" :limit="10" :file-size="20" :disabled="readonly" />
      </el-form-item>

      <!-- 已完成工作 -->
      <el-divider content-position="left">已完成工作</el-divider>
      <el-table :data="formData.workItems" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="工作内容" min-width="460">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.content"
              maxlength="1000"
              placeholder="请输入已完成的工作内容"
            />
          </template>
        </el-table-column>
        <el-table-column label="完成进度" width="260">
          <template slot-scope="scope">
            <div class="progress-cell">
              <el-slider v-if="!readonly" v-model="scope.row.progress" :step="10" class="progress-slider" />
              <span class="progress-text">{{ scope.row.progress }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!readonly" label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" class="danger-text" @click="removeWorkItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        v-if="!readonly"
        :disabled="formData.workItems.length >= 100"
        class="add-item"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="addWorkItem"
      >新增工作项</el-button>

      <!-- 工作计划 -->
      <el-divider content-position="left">工作计划</el-divider>
      <el-table :data="formData.planItems" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="计划内容" min-width="720">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.content"
              maxlength="1000"
              placeholder="请输入下一阶段工作计划"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="!readonly" label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" class="danger-text" @click="removePlanItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        v-if="!readonly"
        :disabled="formData.planItems.length >= 100"
        class="add-item"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="addPlanItem"
      >新增计划项</el-button>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="!readonly" type="primary" :loading="formLoading" @click="submitForm">
        保 存
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import dayjs from 'dayjs'
import * as WorkReportApi from '@/api/oa/workreport'
import Dialog from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import { OA_WORK_REPORT_TYPE } from '@/views/oa/utils/constants-collab'
import {
  formatWorkReportWeek,
  getWorkReportWeekStart,
  getWorkReportWeekOptions
} from '@/views/oa/utils/format-collab'

function createDefaultFormData(reportType) {
  return {
    id: undefined,
    type: reportType,
    title: '',
    startTime: '',
    endTime: '',
    summary: '',
    plan: '',
    problem: '',
    workItems: [],
    planItems: [],
    fileUrls: [],
    remark: ''
  }
}

export default {
  name: 'OaWorkReportForm',
  components: { Dialog, UploadFile },
  data() {
    return {
      OA_WORK_REPORT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      reportWeek: '',
      weekOptions: getWorkReportWeekOptions(dayjs().year()),
      periodValue: undefined,
      formData: createDefaultFormData(OA_WORK_REPORT_TYPE.DAILY),
      formRules: {
        type: [{ required: true, message: '汇报类型不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束日期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    readonly() {
      return this.formType === 'detail'
    }
  },
  methods: {
    open(type, id, reportType) {
      this.dialogVisible = true
      this.dialogTitle = type === 'detail' ? '工作汇报详情' : (type === 'create' ? '添加工作汇报' : '修改工作汇报')
      this.formType = type
      this.resetForm(reportType || OA_WORK_REPORT_TYPE.DAILY)
      // 修改或查看时，加载工作汇报详情
      if (id) {
        this.formLoading = true
        WorkReportApi.getWorkReport(id).then(response => {
          this.formData = response.data
          // 日期控件使用时间戳格式，回填时转换日期值
          this.formData.startTime = dayjs(this.formData.startTime).valueOf()
          this.formData.endTime = dayjs(this.formData.endTime).valueOf()
          this.periodValue = this.formData.startTime
          this.reportWeek = formatWorkReportWeek(this.periodValue)
          this.weekOptions = getWorkReportWeekOptions(Number(this.reportWeek.split('-')[0]))
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    /** 保存工作汇报草稿 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 统一日期边界，忽略尚未填写的表格空白行
        this.formData.startTime = dayjs(Number(this.formData.startTime)).startOf('day').valueOf()
        this.formData.endTime = dayjs(Number(this.formData.endTime)).endOf('day').valueOf()
        this.formData.workItems = this.formData.workItems.filter(item => item.content)
        this.formData.planItems = this.formData.planItems.filter(item => item.content)
        if (
          !(this.formData.summary && this.formData.summary.trim()) &&
          !(this.formData.plan && this.formData.plan.trim()) &&
          !this.formData.workItems.length &&
          !this.formData.planItems.length
        ) {
          this.$modal.msgWarning('请填写工作总结、计划说明或工作明细')
          return
        }
        // 保存草稿，提交由列表单独操作
        this.formLoading = true
        const request = this.formType === 'create'
          ? WorkReportApi.createWorkReport(this.formData).then(response => {
            this.formData.id = response.data
          })
          : WorkReportApi.updateWorkReport(this.formData)
        request.then(() => {
          this.dialogVisible = false
          this.$modal.msgSuccess('保存成功')
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 处理汇报周期变化 */
    handlePeriodChange(value) {
      if (!value) return
      const date = dayjs(Number(value))
      // 日报默认覆盖当天
      if (this.formData.type === OA_WORK_REPORT_TYPE.DAILY) {
        this.formData.startTime = date.startOf('day').valueOf()
        this.formData.endTime = date.endOf('day').valueOf()
        return
      }
      // 周报默认覆盖周一至周日
      if (this.formData.type === OA_WORK_REPORT_TYPE.WEEKLY) {
        const weekDay = date.day() === 0 ? 7 : date.day()
        const startTime = date.subtract(weekDay - 1, 'day').startOf('day')
        this.formData.startTime = startTime.valueOf()
        this.formData.endTime = startTime.add(6, 'day').endOf('day').valueOf()
        return
      }
      // 月报默认覆盖整月
      this.formData.startTime = date.startOf('month').valueOf()
      this.formData.endTime = date.endOf('month').valueOf()
    },
    /** 选择周次时初始化日期，之后仍可手动调整 */
    handleWeekChange(value) {
      const startTime = getWorkReportWeekStart(value)
      this.formData.startTime = startTime.startOf('day').valueOf()
      this.formData.endTime = startTime.add(6, 'day').endOf('day').valueOf()
    },
    addWorkItem() {
      this.formData.workItems.push({ content: '', progress: 0 })
    },
    removeWorkItem(index) {
      this.formData.workItems.splice(index, 1)
    },
    addPlanItem() {
      this.formData.planItems.push({ content: '' })
    },
    removePlanItem(index) {
      this.formData.planItems.splice(index, 1)
    },
    resetForm(reportType) {
      this.formData = createDefaultFormData(reportType)
      this.periodValue = Date.now()
      this.handlePeriodChange(this.periodValue)
      this.reportWeek = formatWorkReportWeek(this.periodValue)
      this.weekOptions = getWorkReportWeekOptions(Number(this.reportWeek.split('-')[0]))
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    resetClosed() {
      // 弹窗关闭后由下次 open 重新初始化
    }
  }
}
</script>

<style scoped>
.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-slider {
  flex: 1;
}

.progress-text {
  width: 42px;
  text-align: right;
}

.add-item {
  margin-top: 12px;
}

.danger-text {
  color: #f56c6c;
}
</style>
