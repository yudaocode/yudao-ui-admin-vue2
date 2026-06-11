<template>
  <div class="app-container">
    <doc-alert title="审批通过、不通过、驳回" url="https://doc.iocoder.cn/bpm/task-todo-done/" />
    <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />
    <doc-alert title="审批转办、委派、抄送" url="https://doc.iocoder.cn/bpm/task-delegation-and-cc/" />

    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch" label-width="68px" class="task-toolbar-form">
      <el-form-item label="" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable class="w-240" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
      <el-form-item label="" prop="category" class="toolbar-right toolbar-right--category">
        <el-select v-model="queryParams.category" placeholder="请选择流程分类" clearable class="w-155" @change="handleQuery">
          <el-option
            v-for="category in categoryList"
            :key="category.code"
            :label="category.name"
            :value="category.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="toolbar-right toolbar-right--advanced">
        <el-popover
          v-model="showAdvancedSearch"
          placement="bottom-end"
          width="400"
          trigger="click"
          :visible-arrow="false"
        >
          <el-form-item label="所属流程" prop="processDefinitionKey" class="task-advanced-form-item">
            <el-select
              v-model="queryParams.processDefinitionKey"
              placeholder="请选择流程定义"
              clearable
              filterable
              :popper-append-to-body="false"
              @change="handleQuery"
            >
              <el-option
                v-for="item in processDefinitionList"
                :key="item.key"
                :label="item.name"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发起时间" prop="createTime" class="task-advanced-form-item">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
              :append-to-body="false"
            />
          </el-form-item>
          <div class="task-advanced-actions">
            <el-button @click="resetQuery">清空</el-button>
            <el-button @click="showAdvancedSearch = false">取消</el-button>
            <el-button type="primary" @click="handleAdvancedQuery">确认</el-button>
          </div>
          <el-button slot="reference" icon="el-icon-plus">高级筛选</el-button>
        </el-popover>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="流程" align="center" prop="processInstance.name" min-width="180" />
      <el-table-column label="摘要" prop="processInstance.summary" min-width="180">
        <template v-slot="scope">
          <div v-if="scope.row.processInstance && scope.row.processInstance.summary && scope.row.processInstance.summary.length">
            <div v-for="(item, index) in scope.row.processInstance.summary" :key="index" class="task-summary-item">
              {{ item.key }} : {{ item.value }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="发起人" align="center" min-width="100">
        <template v-slot="scope">{{ processStartUserName(scope.row.processInstance) }}</template>
      </el-table-column>
      <el-table-column label="发起时间" align="center" prop="processInstance.createTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.processInstance && scope.row.processInstance.createTime) }}</template>
      </el-table-column>
      <el-table-column label="当前任务" align="center" prop="name" min-width="150" />
      <el-table-column label="任务时间" align="center" prop="createTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="流程编号" align="center" prop="processInstanceId" min-width="220" show-overflow-tooltip />
      <el-table-column label="任务编号" align="center" prop="id" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" align="center" fixed="right" width="90">
        <template v-slot="scope">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleAudit(scope.row)">办理</el-button>
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
import { getTaskTodoPage } from '@/api/bpm/task'
import { getCategorySimpleList } from '@/api/bpm/category'
import { getSimpleProcessDefinitionList } from '@/api/bpm/definition'

export default {
  name: 'BpmTodoTask',
  data() {
    return {
      loading: false,
      showSearch: true,
      showAdvancedSearch: false,
      total: 0,
      list: [],
      categoryList: [],
      processDefinitionList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        category: undefined,
        processDefinitionKey: '',
        createTime: []
      }
    }
  },
  created() {
    this.getList()
    this.loadSearchOptions()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await getTaskTodoPage(this.queryParams)
        this.list = response.data.list || []
        this.total = response.data.total || 0
      } finally {
        this.loading = false
      }
    },
    userName(user) {
      return user ? (user.nickname || user.name || user.id) : ''
    },
    processStartUserName(processInstance) {
      if (!processInstance) {
        return ''
      }
      return this.userName(processInstance.startUser) || processInstance.startUserNickname || ''
    },
    async loadSearchOptions() {
      try {
        const [categoryResp, definitionResp] = await Promise.all([
          getCategorySimpleList(),
          getSimpleProcessDefinitionList()
        ])
        this.categoryList = categoryResp.data || []
        this.processDefinitionList = definitionResp.data || []
      } catch (e) {
        this.categoryList = []
        this.processDefinitionList = []
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    handleAdvancedQuery() {
      this.showAdvancedSearch = false
      this.handleQuery()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNo: 1,
        pageSize: this.queryParams.pageSize,
        name: '',
        category: undefined,
        processDefinitionKey: '',
        createTime: []
      }
      this.showAdvancedSearch = false
      this.handleQuery()
    },
    handleAudit(row) {
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: {
          id: row.processInstance && row.processInstance.id,
          taskId: row.id
        }
      })
    }
  }
}
</script>

<style scoped>
.task-advanced-form-item {
  display: block;
  margin-bottom: 16px;
}

.task-advanced-form-item .el-select,
.task-advanced-form-item .el-date-editor {
  width: 100%;
}

.task-advanced-actions {
  text-align: right;
}

.task-summary-item {
  color: #909399;
  line-height: 20px;
}

.task-toolbar-form {
  position: relative;
  min-height: 40px;
}

.task-toolbar-form .w-240 {
  width: 240px;
}

.task-toolbar-form .w-155 {
  width: 155px;
}

.toolbar-right {
  position: absolute;
}

.toolbar-right--category {
  right: 130px;
}

.toolbar-right--advanced {
  right: 0;
}
</style>
