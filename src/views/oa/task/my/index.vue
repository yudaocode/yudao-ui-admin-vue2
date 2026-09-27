<template>
  <div class="app-container oa-task-my">
    <!-- 搜索工作栏 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" size="small" @submit.native.prevent>
      <el-form-item label="任务标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入任务标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable style="width: 240px">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="取消状态" prop="canceled">
        <el-select v-model="queryParams.canceled" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="正常" :value="false" />
          <el-option label="已取消" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布人" prop="publisherUserId">
        <user-select-v2 v-model="queryParams.publisherUserId" style="width: 240px" />
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime">
        <el-date-picker
          v-model="queryParams.publishTime"
          style="width: 360px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 任务列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="任务标题" prop="title" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" class="link-button" @click="openDetail(scope.row.id)">
            {{ scope.row.title }}
          </el-button>
          <el-tag v-if="scope.row.top" class="top-tag" size="small" type="danger">置顶</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_TASK_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="发布人" prop="publisherUserName" align="center" width="110" />
      <el-table-column label="发布部门" prop="publisherDeptName" align="center" width="120" />
      <el-table-column label="我的状态" align="center" width="105">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_TASK_STATUS" :value="scope.row.receiverStatus" />
        </template>
      </el-table-column>
      <el-table-column label="进度" min-width="150">
        <template slot-scope="scope">
          <el-progress :percentage="getTaskStatusProgress(scope.row.receiverStatus)" />
        </template>
      </el-table-column>
      <el-table-column label="任务周期" min-width="220">
        <template slot-scope="scope">
          {{ formatDate(scope.row.startTime, 'YYYY-MM-DD') }}
          至 {{ formatDate(scope.row.endTime, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="取消状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.canceled ? 'danger' : 'success'">
            {{ scope.row.canceled ? '已取消' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="publishTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column label="操作" align="center" width="80" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.canceled"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
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

    <!-- 任务详情 -->
    <oa-task-detail ref="detailRef" @success="getList" />
  </div>
</template>

<script>
import * as TaskApi from '@/api/oa/task'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { getTaskStatusProgress } from '@/views/oa/utils/format-collab'
import OaTaskDetail from '../list/components/OaTaskDetail.vue'

export default {
  name: 'OaTaskMy',
  components: { UserSelectV2, OaTaskDetail },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        status: undefined,
        canceled: undefined,
        publisherUserId: undefined,
        publishTime: undefined
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_TASK_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_TASK_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatDate,
    getTaskStatusProgress,
    getList() {
      this.loading = true
      return TaskApi.getReceivedTaskPage(this.queryParams).then(response => {
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
      return this.handleQuery()
    },
    openDetail(id) {
      this.$refs.detailRef.open(id, 'received')
    },
    handleDelete(id) {
      return this.$modal.confirm('确认从“我的任务”中删除该任务吗？该操作不会影响其他接收人。').then(() => {
        return TaskApi.deleteReceivedTask(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}

.top-tag {
  margin-left: 6px;
}
</style>
