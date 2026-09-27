<template>
  <div class="app-container">
    <doc-alert
      title="【流程】考勤、请假、加班、转正与离职"
      url="https://doc.iocoder.cn/oa/attendance-application/"
    />
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审批状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审批状态"
          clearable
          style="width: 240px"
        >
          <el-option label="未提交" :value="BpmProcessInstanceStatus.NOT_START" />
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:leave-apply:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 本人申请列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="标题" min-width="240">
        <template slot-scope="scope">
          <el-button type="text" @click="openDetail(scope.row.id)">{{ scope.row.title }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="紧急程度" width="110" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_APPLY_URGENCY" :value="scope.row.urgency" />
        </template>
      </el-table-column>
      <el-table-column label="申请人" prop="creatorName" width="120" align="center" />
      <el-table-column
        label="申请时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column label="审批状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info">
            未提交
          </el-tag>
          <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START"
            v-hasPermi="['oa:leave-apply:create']"
            type="text"
            size="mini"
            @click="handleSubmit(scope.row.id)"
          >提交</el-button>
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START"
            v-hasPermi="['oa:leave-apply:create']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="scope.row.processInstanceId"
            type="text"
            size="mini"
            @click="handleProcessDetail(scope.row.processInstanceId)"
          >审批进度</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改请假申请弹窗 -->
    <oa-leave-apply-form ref="formRef" @success="getList" />
    <!-- 请假申请详情弹窗 -->
    <oa-leave-apply-detail ref="detailRef" />
  </div>
</template>

<script>
import * as LeaveApplyApi from '@/api/oa/leave'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/views/oa/utils/constants'
import OaLeaveApplyForm from './OaLeaveApplyForm.vue'
import OaLeaveApplyDetail from './OaLeaveApplyDetail.vue'

export default {
  name: 'OaLeaveApply',
  components: { OaLeaveApplyForm, OaLeaveApplyDetail },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        status: undefined
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)
        .filter(item => item.value !== BpmProcessInstanceStatus.NOT_START)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 查询列表 */
    getList() {
      this.loading = true
      return LeaveApplyApi.getLeaveApplyPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    },
    /** 查看详情操作 */
    openDetail(id) {
      this.$refs.detailRef.open(id)
    },
    /** 查看审批进度 */
    handleProcessDetail(id) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id }})
    },
    /** 提交审批 */
    handleSubmit(id) {
      // 提交二次确认
      return this.$modal.confirm('确认提交申请？').then(() => {
        // 发起审批
        return LeaveApplyApi.submitLeaveApply(id, {})
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        // 刷新列表
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>
