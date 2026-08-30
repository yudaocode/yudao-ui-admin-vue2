<template>
  <div>
    <el-table v-loading="loading || innerLoading" :data="list" border>
      <el-table-column label="任务编号" prop="id" min-width="220" show-overflow-tooltip />
      <el-table-column label="任务名称" prop="name" min-width="140" />
      <el-table-column label="审批人" min-width="120">
        <template v-slot="scope">{{ userName(scope.row.assigneeUser || scope.row.ownerUser) }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="110">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="审批意见" prop="reason" min-width="220" show-overflow-tooltip>
        <template v-slot="scope">
          <span>{{ scope.row.reason }}</span>
          <el-button
            v-if="scope.row.formId > 0"
            class="task-form-button"
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleFormDetail(scope.row)"
          >
            查看表单
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="附件/签名" min-width="220">
        <template v-slot="scope">
          <TaskEvidenceCell
            :attachments="scope.row.attachments"
            :sign-pic-url="scope.row.signPicUrl"
          />
        </template>
      </el-table-column>
      <el-table-column label="开始时间" prop="createTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" prop="endTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="耗时" prop="durationInMillis" width="120">
        <template v-slot="scope">{{ formatPast2(scope.row.durationInMillis) }}</template>
      </el-table-column>
    </el-table>

    <el-dialog title="表单详情" :visible.sync="taskFormVisible" width="600px" append-to-body>
      <form-create
        v-if="taskForm.rule.length"
        v-model="fApi"
        :value="taskForm.value"
        :rule="taskForm.rule"
        :option="taskForm.option"
      />
      <el-empty v-else description="暂无表单信息" />
    </el-dialog>
  </div>
</template>

<script>
import { getTaskListByProcessInstanceId } from '@/api/bpm/task'
import { formatPast2 } from '@/utils'
import { setConfAndFields2 } from '@/utils/formCreate'
import TaskEvidenceCell from '@/views/bpm/task/components/TaskEvidenceCell.vue'

export default {
  name: 'ProcessInstanceTaskList',
  components: {
    TaskEvidenceCell
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerLoading: false,
      list: [],
      listRequestId: 0,
      taskFormVisible: false,
      fApi: {},
      taskForm: {
        rule: [],
        option: {
          submitBtn: false,
          resetBtn: false
        },
        value: {}
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.getList()
      }
    }
  },
  methods: {
    formatPast2,
    userName(user) {
      return user ? (user.nickname || user.name || user.id) : '系统'
    },
    async handleFormDetail(row) {
      setConfAndFields2(this.taskForm, row.formConf, row.formFields, row.formVariables)
      this.taskForm.option.submitBtn = false
      this.taskForm.option.resetBtn = false
      this.taskFormVisible = true
      await this.$nextTick()
      if (this.fApi && this.fApi.btn) {
        this.fApi.btn.show(false)
      }
      if (this.fApi && this.fApi.resetBtn) {
        this.fApi.resetBtn.show(false)
      }
      if (this.fApi && this.fApi.disabled) {
        this.fApi.disabled(true)
      }
    },
    async getList() {
      const requestId = ++this.listRequestId
      const processInstanceId = this.id
      if (!processInstanceId) {
        this.list = []
        return
      }
      this.innerLoading = true
      try {
        const response = await getTaskListByProcessInstanceId(processInstanceId)
        if (requestId === this.listRequestId && processInstanceId === this.id) {
          this.list = response.data || []
        }
      } finally {
        if (requestId === this.listRequestId) {
          this.innerLoading = false
        }
      }
    }
  }
}
</script>

<style scoped>
.task-form-button {
  margin-left: 8px;
}
</style>
