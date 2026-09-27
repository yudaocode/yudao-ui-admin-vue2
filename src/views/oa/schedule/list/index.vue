<template>
  <div class="app-container oa-schedule-list">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="日程范围">
        <el-checkbox v-model="queryParams.includeMine" @change="handleQuery">我的日程</el-checkbox>
        <el-checkbox v-model="queryParams.includeReceived" @change="handleQuery">共享给我</el-checkbox>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入日程标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日程类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择日程类型"
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
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="queryParams.priority"
          placeholder="请选择优先级"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in priorityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:schedule:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 日程列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" class="link-button" @click="openDetail(scope.row.id)">
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_SCHEDULE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PRIORITY" :value="scope.row.priority" />
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
      <el-table-column label="参与人" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ (scope.row.participantUserNames && scope.row.participantUserNames.join('、')) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="发布人" prop="creatorName" align="center" min-width="100" />
      <el-table-column label="部门" prop="creatorDeptName" align="center" min-width="120" show-overflow-tooltip />
      <el-table-column
        label="发布时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column label="提醒" align="center" width="70">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.remind" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="isCreator(scope.row)"
            v-hasPermi="['oa:schedule:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="isCreator(scope.row)"
            v-hasPermi="['oa:schedule:delete']"
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

    <!-- 添加或修改日程对话框 -->
    <oa-schedule-form ref="formRef" @success="getList" />
    <!-- 日程详情对话框 -->
    <oa-schedule-detail ref="detailRef" @edit="openForm('update', $event)" />
  </div>
</template>

<script>
import * as ScheduleApi from '@/api/oa/schedule'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaScheduleForm from './components/OaScheduleForm.vue'
import OaScheduleDetail from './components/OaScheduleDetail.vue'

export default {
  name: 'OaScheduleList',
  components: { OaScheduleForm, OaScheduleDetail },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        includeMine: true,
        includeReceived: true,
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        priority: undefined,
        startTime: []
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SCHEDULE_TYPE)
    },
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return ScheduleApi.getSchedulePage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    isCreator(row) {
      return String(row.creator) === String(this.$store.getters.userId)
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.includeMine = true
      this.queryParams.includeReceived = true
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除日程编号为“' + id + '”的数据项？').then(() => {
        return ScheduleApi.deleteSchedule(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    openDetail(id) {
      this.$refs.detailRef.open(id)
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
