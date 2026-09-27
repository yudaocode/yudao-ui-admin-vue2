<template>
  <div class="app-container oa-meeting-room-booking">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="110px"
      @submit.native.prevent
    >
      <el-form-item label="单据编号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入单据编号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单据状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择单据状态"
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
      <el-form-item label="会议室名称" prop="roomName">
        <el-input
          v-model="queryParams.roomName"
          placeholder="请输入会议室名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议主题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入会议主题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="主持人" prop="moderatorName">
        <el-input
          v-model="queryParams.moderatorName"
          placeholder="请输入主持人"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请部门" prop="deptId">
        <dept-select v-model="queryParams.deptId" style="width: 240px" />
      </el-form-item>
      <el-form-item label="使用状态" prop="useStatus">
        <el-select
          v-model="queryParams.useStatus"
          placeholder="请选择使用状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in useStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会议开始时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="会议结束时间" prop="endTime">
        <el-date-picker
          v-model="queryParams.endTime"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <user-select-v2 v-model="queryParams.creator" style="width: 240px" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
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
          v-hasPermi="['oa:meeting-room-booking:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="单据编号" prop="no" min-width="220">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openDetail(scope.row.id)">{{ scope.row.no }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="单据状态" min-width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
            未提交
          </el-tag>
          <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="使用状态" min-width="110" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_USE_STATUS" :value="scope.row.useStatus" />
        </template>
      </el-table-column>
      <el-table-column label="会议室名称" prop="roomName" min-width="160" show-overflow-tooltip />
      <el-table-column label="会议室位置" prop="roomLocation" min-width="160" show-overflow-tooltip />
      <el-table-column label="会议室类型" width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_TYPE" :value="scope.row.roomType" />
        </template>
      </el-table-column>
      <el-table-column label="会议主题" prop="title" min-width="180" show-overflow-tooltip />
      <el-table-column
        label="会议开始时间"
        prop="startTime"
        min-width="180"
        :formatter="dateFormatter"
        align="center"
      />
      <el-table-column
        label="会议结束时间"
        prop="endTime"
        min-width="180"
        :formatter="dateFormatter"
        align="center"
      />
      <el-table-column label="主持人" prop="moderatorName" min-width="120" show-overflow-tooltip />
      <el-table-column label="申请人" prop="creatorName" min-width="120" show-overflow-tooltip />
      <el-table-column label="申请部门" prop="deptName" min-width="140" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        prop="createTime"
        min-width="180"
        :formatter="dateFormatter"
        align="center"
      />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.processInstanceId"
            type="text"
            size="mini"
            @click="handleProcessDetail(scope.row)"
          >进度</el-button>
          <template v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START">
            <el-button
              v-hasPermi="['oa:meeting-room-booking:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >修改</el-button>
            <el-button
              v-hasPermi="['oa:meeting-room-booking:create']"
              type="text"
              size="mini"
              @click="handleSubmit(scope.row.id)"
            >提交</el-button>
            <el-button
              v-hasPermi="['oa:meeting-room-booking:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
          <el-button
            v-if="
              scope.row.status === BpmProcessInstanceStatus.APPROVE &&
                scope.row.useStatus === OaMeetingRoomUseStatus.PENDING
            "
            v-hasPermi="['oa:meeting-room-booking:update']"
            type="text"
            size="mini"
            @click="handleStart(scope.row.id)"
          >开始</el-button>
          <el-button
            v-if="
              scope.row.status === BpmProcessInstanceStatus.APPROVE &&
                scope.row.useStatus === OaMeetingRoomUseStatus.IN_USE
            "
            v-hasPermi="['oa:meeting-room-booking:update']"
            type="text"
            size="mini"
            @click="handleFinish(scope.row.id)"
          >完成</el-button>
          <el-button
            v-if="
              scope.row.status === BpmProcessInstanceStatus.RUNNING ||
                (scope.row.status === BpmProcessInstanceStatus.APPROVE &&
                  scope.row.useStatus === OaMeetingRoomUseStatus.PENDING)
            "
            v-hasPermi="['oa:meeting-room-booking:update']"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleCancel(scope.row.id)"
          >取消</el-button>
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

    <!-- 表单弹窗 -->
    <oa-meeting-room-booking-form ref="form" @success="getList" />
    <!-- 详情弹窗 -->
    <oa-meeting-room-booking-detail ref="detail" />
  </div>
</template>

<script>
import * as MeetingRoomBookingApi from '@/api/oa/meetingroom/booking'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import { OaMeetingRoomUseStatus } from '@/views/oa/utils/constants'
import OaMeetingRoomBookingDetail from './OaMeetingRoomBookingDetail.vue'
import OaMeetingRoomBookingForm from './OaMeetingRoomBookingForm.vue'

export default {
  name: 'OaMeetingRoomBooking',
  components: { UserSelectV2, DeptSelect, OaMeetingRoomBookingDetail, OaMeetingRoomBookingForm },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      OaMeetingRoomUseStatus,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        deptId: undefined,
        no: undefined,
        roomName: undefined,
        title: undefined,
        moderatorName: undefined,
        status: undefined,
        useStatus: undefined,
        startTime: [],
        endTime: [],
        creator: undefined,
        createTime: []
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS).filter(
        item => item.value !== BpmProcessInstanceStatus.NOT_START
      )
    },
    useStatusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_USE_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return MeetingRoomBookingApi.getMeetingRoomBookingPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
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
      this.$refs.form.open(type, id)
    },
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除会议室预定编号为“' + id + '”的数据项？').then(() => {
        return MeetingRoomBookingApi.deleteMeetingRoomBooking(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    // 跳转流程进度页
    handleProcessDetail(row) {
      this.$router.push({
        path: '/bpm/process-instance/detail',
        query: { id: row.processInstanceId }
      })
    },
    // 提交预定
    handleSubmit(id) {
      return this.$modal.confirm('确定提交这条会议室预定吗？').then(() => {
        return MeetingRoomBookingApi.submitMeetingRoomBooking(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    // 取消预定
    handleCancel(id) {
      return this.$modal.confirm('确定取消这条会议室预定吗？').then(() => {
        return MeetingRoomBookingApi.cancelMeetingRoomBooking(id)
      }).then(() => {
        this.$modal.msgSuccess('取消成功')
        return this.getList()
      }).catch(() => {})
    },
    // 开始使用预定
    handleStart(id) {
      return this.$modal.confirm('确定开始使用这条会议室预定吗？').then(() => {
        return MeetingRoomBookingApi.startMeetingRoomBooking(id)
      }).then(() => {
        this.$modal.msgSuccess('开始使用成功')
        return this.getList()
      }).catch(() => {})
    },
    // 完成使用预定
    handleFinish(id) {
      return this.$modal.confirm('确定完成使用这条会议室预定吗？').then(() => {
        return MeetingRoomBookingApi.finishMeetingRoomBooking(id)
      }).then(() => {
        this.$modal.msgSuccess('完成使用成功')
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
</style>
