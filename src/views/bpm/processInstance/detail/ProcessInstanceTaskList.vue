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
      <el-table-column label="审批意见" prop="reason" min-width="180" show-overflow-tooltip />
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
  </div>
</template>

<script>
import { getTaskListByProcessInstanceId } from '@/api/bpm/task'
import { formatPast2 } from '@/utils'

export default {
  name: 'ProcessInstanceTaskList',
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
      list: []
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
    async getList() {
      if (!this.id) {
        return
      }
      this.innerLoading = true
      try {
        const response = await getTaskListByProcessInstanceId(this.id)
        this.list = response.data || []
      } finally {
        this.innerLoading = false
      }
    }
  }
}
</script>
