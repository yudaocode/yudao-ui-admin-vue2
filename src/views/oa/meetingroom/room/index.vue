<template>
  <div class="app-container oa-meeting-room">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="110px"
      @submit.native.prevent
    >
      <el-form-item label="会议室名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入会议室名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议室位置" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入会议室位置"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议室类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择会议室类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="managerName">
        <el-input
          v-model="queryParams.managerName"
          placeholder="请输入负责人姓名"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="可用状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择可用状态"
          clearable
          style="width: 240px"
        >
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
          v-hasPermi="['oa:meeting-room:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="会议室图片" width="110" align="center">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            class="room-pic"
          />
        </template>
      </el-table-column>
      <el-table-column label="会议室名称" prop="name" min-width="180" show-overflow-tooltip />
      <el-table-column label="坐席数" prop="seatCount" width="90" align="center" />
      <el-table-column label="会议室类型" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="会议室位置" prop="location" min-width="180" show-overflow-tooltip />
      <el-table-column label="负责人" prop="managerName" min-width="120" show-overflow-tooltip />
      <el-table-column label="联系方式" prop="managerPhone" min-width="140" show-overflow-tooltip />
      <el-table-column label="可用状态" min-width="100" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="会议室设备" min-width="200">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_EQUIPMENT" :value="scope.row.equipments" />
        </template>
      </el-table-column>
      <el-table-column label="允许预定" min-width="100" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.allowBooking" />
        </template>
      </el-table-column>
      <el-table-column label="需审批" min-width="100" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.needApproval" />
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" prop="sort" width="90" align="center" />
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column label="操作" align="center" fixed="right" width="220">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:meeting-room:query', 'oa:meeting-room-booking:query']"
            type="text"
            size="mini"
            @click="$refs.scheduleDialog.open(scope.row.id, scope.row.name)"
          >预定信息</el-button>
          <el-button
            v-hasPermi="['oa:meeting-room:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['oa:meeting-room:delete']"
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

    <!-- 表单弹窗 -->
    <oa-meeting-room-form ref="form" @success="getList" />
    <!-- 预定信息弹窗 -->
    <oa-meeting-room-schedule-dialog ref="scheduleDialog" />
  </div>
</template>

<script>
import * as MeetingRoomApi from '@/api/oa/meetingroom/room'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaMeetingRoomForm from './OaMeetingRoomForm.vue'
import OaMeetingRoomScheduleDialog from './components/OaMeetingRoomScheduleDialog.vue'

export default {
  name: 'OaMeetingRoom',
  components: { OaMeetingRoomForm, OaMeetingRoomScheduleDialog },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        location: undefined,
        type: undefined,
        managerName: undefined,
        status: undefined
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return MeetingRoomApi.getMeetingRoomPage(this.queryParams).then(response => {
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
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除会议室编号为“' + id + '”的数据项？').then(() => {
        return MeetingRoomApi.deleteMeetingRoom(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.room-pic {
  width: 70px;
  height: 50px;
  border-radius: 4px;
}

.danger-text {
  color: #f56c6c;
}
</style>
