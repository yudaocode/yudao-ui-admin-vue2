<template>
  <div class="app-container">
    <doc-alert title="流程发起、取消、重新发起" url="https://doc.iocoder.cn/bpm/process-instance/" />

    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch" label-width="68px" class="bpm-toolbar-form">
      <el-form-item label="" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入流程名称" clearable @keyup.enter.native="handleQuery" class="w-240" />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
      <el-form-item label="" prop="category" class="toolbar-right toolbar-right--category">
        <el-select v-model="queryParams.category" clearable placeholder="请选择流程分类" class="w-155" @change="handleQuery">
          <el-option v-for="item in categoryList" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="status" class="toolbar-right toolbar-right--status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择流程状态" class="w-155" @change="handleQuery">
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="toolbar-right toolbar-right--advanced">
        <el-popover
          v-model="showPopover"
          placement="bottom-end"
          width="400"
          trigger="click"
          :visible-arrow="false"
        >
          <el-form-item label="所属流程" prop="processDefinitionKey" class="advanced-form-item">
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
          <el-form-item label="发起时间" prop="createTime" class="advanced-form-item">
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
          <div class="advanced-actions">
            <el-button @click="resetQuery">清空</el-button>
            <el-button @click="showPopover = false">取消</el-button>
            <el-button type="primary" @click="handleQuery">确认</el-button>
          </div>
          <el-button slot="reference" icon="el-icon-plus">高级筛选</el-button>
        </el-popover>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="流程名称" align="center" prop="name" min-width="200" fixed="left" />
      <el-table-column label="摘要" prop="summary" width="180" fixed="left">
        <template v-slot="scope">
          <div v-if="scope.row.summary && scope.row.summary.length">
            <div v-for="(item, index) in scope.row.summary" :key="index" class="summary-item">
              {{ item.key }} : {{ item.value }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="流程分类" align="center" prop="categoryName" min-width="100" fixed="left" />
      <el-table-column label="流程状态" prop="status" min-width="200">
        <template v-slot="scope">
          <template v-if="scope.row.status === 1 && scope.row.tasks && scope.row.tasks.length > 0">
            <span v-if="scope.row.tasks.length === 1">
              <el-button type="text" @click="handleDetail(scope.row)">
                {{ taskAssigneeName(scope.row.tasks[0]) }}
              </el-button>
              ({{ scope.row.tasks[0].name }}) 审批中
            </span>
            <span v-else>
              <el-button type="text" @click="handleDetail(scope.row)">
                {{ taskAssigneeName(scope.row.tasks[0]) }}
              </el-button>
              等 {{ scope.row.tasks.length }} 人 ({{ scope.row.tasks[0].name }})审批中
            </span>
          </template>
          <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发起时间" align="center" prop="startTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.startTime) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.endTime) }}</template>
      </el-table-column>
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
          <el-button v-else type="text" size="mini" @click="handleReCreate(scope.row)">
            重新发起
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
  cancelProcessInstanceByStartUser,
  getProcessInstanceMyPage
} from '@/api/bpm/processInstance'
import { getCategorySimpleList } from '@/api/bpm/category'
import { getProcessDefinition, getSimpleProcessDefinitionList } from '@/api/bpm/definition'
import { TaskStatusEnum } from '@/api/bpm/task'

export default {
  name: 'BpmProcessInstanceMy',
  data() {
    return {
      TaskStatusEnum,
      loading: false,
      showSearch: true,
      showPopover: false,
      total: 0,
      list: [],
      categoryList: [],
      processDefinitionList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        processDefinitionKey: undefined,
        category: undefined,
        status: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.loadSearchOptions()
    this.getList()
  },
  activated() {
    this.getList()
  },
  methods: {
    async loadSearchOptions() {
      const [categoryResp, definitionResp] = await Promise.all([
        getCategorySimpleList(),
        getSimpleProcessDefinitionList()
      ])
      this.categoryList = categoryResp.data || []
      this.processDefinitionList = definitionResp.data || []
    },
    async getList() {
      this.loading = true
      try {
        const response = await getProcessInstanceMyPage(this.queryParams)
        this.list = response.data.list || []
        this.total = response.data.total || 0
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNo: 1,
        pageSize: this.queryParams.pageSize,
        name: '',
        processDefinitionKey: undefined,
        category: undefined,
        status: undefined,
        createTime: []
      }
      this.showPopover = false
      this.handleQuery()
    },
    handleCreate() {
      this.$router.push({ name: 'BpmProcessInstanceCreate' })
    },
    handleDetail(row) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.id }})
    },
    async handleReCreate(row) {
      const response = await getProcessDefinition(row.processDefinitionId)
      const definition = response.data || {}
      if (definition.formType === 20) {
        this.$router.push({
          path: definition.formCustomCreatePath,
          query: {
            id: row.businessKey
          }
        })
        return
      }
      this.$router.push({ name: 'BpmProcessInstanceCreate', query: { processInstanceId: row.id }})
    },
    taskAssigneeName(task) {
      const user = task && task.assigneeUser
      return user ? (user.nickname || user.name || user.id) : ''
    },
    async handleCancel(row) {
      const { value } = await this.$prompt('请输入取消原因', '取消流程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\s\S]*.*\S[\s\S]*$/,
        inputErrorMessage: '取消原因不能为空'
      })
      await cancelProcessInstanceByStartUser(row.id, value)
      this.$modal.msgSuccess('取消成功')
      this.getList()
    }
  }
}
</script>

<style scoped>
.bpm-toolbar-form {
  position: relative;
  min-height: 40px;
}

.bpm-toolbar-form .w-240 {
  width: 240px;
}

.bpm-toolbar-form .w-155 {
  width: 155px;
}

.toolbar-right {
  position: absolute;
}

.toolbar-right--category {
  right: 300px;
}

.toolbar-right--status {
  right: 130px;
}

.toolbar-right--advanced {
  right: 0;
}

.advanced-form-item {
  display: block;
  margin-bottom: 16px;
}

.advanced-form-item .el-select,
.advanced-form-item .el-date-editor {
  width: 100%;
}

.advanced-actions {
  text-align: right;
}

.summary-item {
  color: #909399;
  line-height: 20px;
}
</style>
