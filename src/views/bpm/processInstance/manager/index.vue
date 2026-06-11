<template>
  <div class="app-container">
    <doc-alert title="工作流手册" url="https://doc.iocoder.cn/bpm/" />

    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="发起人" prop="startUserId">
        <el-select v-model="queryParams.startUserId" clearable filterable placeholder="请选择发起人" class="w-240">
          <el-option v-for="user in userList" :key="user.id" :label="user.nickname || user.name" :value="user.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="流程名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入流程名称" clearable class="w-240" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="所属流程" prop="processDefinitionId">
        <el-input
          v-model="queryParams.processDefinitionId"
          placeholder="请输入流程定义的编号"
          clearable
          class="w-240"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程分类" prop="category">
        <el-select v-model="queryParams.category" clearable placeholder="请选择流程分类" class="w-240">
          <el-option v-for="item in categoryList" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="流程状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择流程状态" class="w-240">
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发起时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="w-240"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />

    <el-table v-loading="loading" :data="list">
      <el-table-column label="流程名称" align="center" prop="name" min-width="200" fixed="left" />
      <el-table-column label="流程分类" align="center" prop="categoryName" min-width="100" fixed="left" />
      <el-table-column label="流程发起人" align="center" min-width="120">
        <template v-slot="scope">{{ userName(scope.row.startUser) || scope.row.startUserNickname }}</template>
      </el-table-column>
      <el-table-column label="发起部门" align="center" min-width="120">
        <template v-slot="scope">{{ scope.row.startUser && scope.row.startUser.deptName }}</template>
      </el-table-column>
      <el-table-column label="流程状态" align="center" prop="status" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发起时间" align="center" prop="startTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.startTime || scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="耗时" align="center" prop="durationInMillis" width="169">
        <template v-slot="scope">{{ scope.row.durationInMillis > 0 ? formatPast2(scope.row.durationInMillis) : '-' }}</template>
      </el-table-column>
      <el-table-column label="当前审批任务" align="center" prop="tasks" min-width="120">
        <template v-slot="scope">
          <el-button v-for="task in scope.row.tasks || []" :key="task.id" type="text" size="mini">
            {{ task.name }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="流程编号" align="center" prop="id" min-width="320" show-overflow-tooltip />
      <el-table-column label="操作" align="center" fixed="right" width="180">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.status === TaskStatusEnum.RUNNING"
            type="text"
            size="mini"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
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
  </div>
</template>

<script>
import {
  cancelProcessInstanceByAdmin,
  getProcessInstanceManagerPage
} from '@/api/bpm/processInstance'
import { listSimpleUsers } from '@/api/system/user'
import { TaskStatusEnum } from '@/api/bpm/task'
import { getCategorySimpleList } from '@/api/bpm/category'
import { formatPast2 } from '@/utils'

export default {
  name: 'BpmProcessInstanceManager',
  data() {
    return {
      TaskStatusEnum,
      loading: false,
      showSearch: true,
      total: 0,
      list: [],
      userList: [],
      categoryList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        startUserId: undefined,
        name: '',
        processDefinitionId: undefined,
        category: undefined,
        status: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.loadOptions()
    this.getList()
  },
  methods: {
    formatPast2,
    async loadOptions() {
      const [userResp, categoryResp] = await Promise.all([
        listSimpleUsers(),
        getCategorySimpleList()
      ])
      this.userList = userResp.data || []
      this.categoryList = categoryResp.data || []
    },
    async getList() {
      this.loading = true
      try {
        const response = await getProcessInstanceManagerPage(this.queryParams)
        this.list = response.data.list || []
        this.total = response.data.total || 0
      } finally {
        this.loading = false
      }
    },
    userName(user) {
      return user ? (user.nickname || user.name || user.id) : ''
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleDetail(row) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.id }})
    },
    async handleCancel(row) {
      const { value } = await this.$prompt('请输入取消原因', '取消流程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\s\S]*.*\S[\s\S]*$/,
        inputErrorMessage: '取消原因不能为空'
      })
      await cancelProcessInstanceByAdmin(row.id, value)
      this.$modal.msgSuccess('取消成功')
      this.getList()
    }
  }
}
</script>
