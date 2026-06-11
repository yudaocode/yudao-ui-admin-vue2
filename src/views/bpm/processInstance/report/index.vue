<template>
  <div class="app-container">
    <doc-alert title="工作流手册" url="https://doc.iocoder.cn/bpm/" />

    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="72px">
      <el-form-item label="发起人" prop="startUserId">
        <el-select v-model="queryParams.startUserId" clearable filterable placeholder="请选择发起人">
          <el-option v-for="user in userList" :key="user.id" :label="user.nickname || user.name" :value="user.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="流程名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入流程名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="流程状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择流程状态">
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
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="queryParams.endTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item
        v-for="field in formFields"
        :key="field.field"
        :label="field.title"
      >
        <el-input
          v-model="queryParams.formFieldsParams[field.field]"
          :placeholder="'请输入' + field.title"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="流程名称" align="center" prop="name" fixed="left" width="200" />
      <el-table-column label="流程发起人" align="center" min-width="120">
        <template v-slot="scope">{{ userName(scope.row.startUser) }}</template>
      </el-table-column>
      <el-table-column label="流程状态" align="center" prop="status" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发起时间" align="center" prop="startTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.startTime || scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="170">
        <template v-slot="scope">{{ parseTime(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column
        v-for="field in formFields"
        :key="field.field"
        :label="field.title"
        :prop="'formVariables.' + field.field"
        width="120"
      >
        <template v-slot="scope">{{ getFormValue(scope.row, field.field) }}</template>
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
import { cancelProcessInstanceByAdmin, getProcessInstanceManagerPage } from '@/api/bpm/processInstance'
import { getProcessDefinition } from '@/api/bpm/definition'
import { listSimpleUsers } from '@/api/system/user'
import { parseFormFields } from '@/components/FormCreate/src/utils'
import { TaskStatusEnum } from '@/api/bpm/task'

export default {
  name: 'BpmProcessInstanceReport',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      formFields: [],
      userList: [],
      TaskStatusEnum,
      processDefinitionId: this.$route.query.processDefinitionId,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        startUserId: undefined,
        name: '',
        processDefinitionKey: this.$route.query.processDefinitionKey,
        status: undefined,
        createTime: [],
        endTime: [],
        formFieldsParams: {}
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      await Promise.all([this.loadProcessDefinition(), this.loadUsers()])
      this.getList()
    },
    async loadProcessDefinition() {
      if (!this.processDefinitionId) {
        return
      }
      const response = await getProcessDefinition(this.processDefinitionId)
      const definition = response.data || {}
      this.formFields = this.parseFormCreateFields(definition.formFields)
    },
    async loadUsers() {
      const response = await listSimpleUsers()
      this.userList = response.data || []
    },
    parseFormCreateFields(formFields) {
      const result = []
      const fields = formFields || []
      fields.forEach((fieldStr) => {
        try {
          parseFormFields(JSON.parse(fieldStr), result)
        } catch (e) {
          // Ignore invalid historical form field config.
        }
      })
      return result
    },
    async getList() {
      this.loading = true
      try {
        const response = await getProcessInstanceManagerPage({
          ...this.queryParams,
          formFieldsParams: JSON.stringify(this.queryParams.formFieldsParams || {})
        })
        this.list = response.data.list || []
        this.total = response.data.total || 0
      } finally {
        this.loading = false
      }
    },
    userName(user) {
      return user ? (user.nickname || user.name || user.id) : ''
    },
    getFormValue(row, field) {
      return row.formVariables && row.formVariables[field] !== undefined ? row.formVariables[field] : ''
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.formFieldsParams = {}
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
