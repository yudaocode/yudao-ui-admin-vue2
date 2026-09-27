<template>
  <div class="app-container oa-plan-list">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="计划标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入计划标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划标签" prop="label">
        <el-input
          v-model="queryParams.label"
          placeholder="请输入计划标签"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择计划类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择计划状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:plan:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 工作计划列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="计划标题" prop="title" min-width="180" show-overflow-tooltip />
      <el-table-column label="标签" prop="label" width="120" show-overflow-tooltip />
      <el-table-column label="类型" prop="type" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PLAN_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PLAN_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="开始时间"
        prop="startTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column
        label="结束时间"
        prop="endTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column
        label="发布时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column label="发布人" prop="userName" align="center" width="110" />
      <el-table-column label="部门" prop="deptName" align="center" width="120" />
      <el-table-column label="点评" min-width="180">
        <template slot-scope="scope">
          <div class="pre-line">{{ scope.row.comment || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="附件" width="80" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.fileUrls && scope.row.fileUrls.length">{{ scope.row.fileUrls.length }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="140">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:plan:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['oa:plan:delete']"
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

    <!-- 工作计划表单 -->
    <oa-plan-form ref="formRef" @success="getList" />
  </div>
</template>

<script>
import * as PlanApi from '@/api/oa/plan'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaPlanForm from './OaPlanForm.vue'

export default {
  name: 'OaPlanList',
  components: { OaPlanForm },
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
        label: undefined,
        type: undefined,
        status: undefined,
        createTime: undefined
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PLAN_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PLAN_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return PlanApi.getPlanPage(this.queryParams).then(response => {
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
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除工作计划编号为“' + id + '”的数据项？').then(() => {
        return PlanApi.deletePlan(id)
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

.pre-line {
  white-space: pre-line;
}
</style>
