<template>
  <Dialog title="选择会议室" v-model="dialogVisible" width="1050px">
    <!-- 会议室搜索 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" size="small" label-width="90px">
      <el-form-item label="会议室名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入会议室名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议室位置" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入会议室位置"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议室类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择会议室类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 单选列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      highlight-current-row
      @row-click="handleSelect"
    >
      <el-table-column width="55" align="center">
        <template slot-scope="scope">
          <el-radio
            v-model="selectedId"
            :label="scope.row.id"
            @change="handleSelect(scope.row)"
          ><span></span></el-radio>
        </template>
      </el-table-column>
      <el-table-column label="会议室名称" prop="name" min-width="180" show-overflow-tooltip />
      <el-table-column label="会议室位置" prop="location" min-width="180" show-overflow-tooltip />
      <el-table-column label="会议室类型" width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="坐席数" prop="seatCount" width="85" align="center" />
      <el-table-column label="可用状态" width="100" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_MEETING_ROOM_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="负责人" prop="managerName" width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="130" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click.stop="$refs.scheduleDialog.open(scope.row.id, scope.row.name)">
            查看预定信息
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
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="loading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
    <oa-meeting-room-schedule-dialog ref="scheduleDialog" :show-bookings="false" />
  </Dialog>
</template>

<script>
import * as MeetingRoomApi from '@/api/oa/meetingroom/room'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import OaMeetingRoomScheduleDialog from './OaMeetingRoomScheduleDialog.vue'

export default {
  name: 'OaMeetingRoomSelectDialog',
  components: { Dialog, OaMeetingRoomScheduleDialog },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      selectedId: undefined,
      selectedRoom: undefined,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        location: undefined,
        type: undefined
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_TYPE)
    }
  },
  methods: {
    // 打开弹窗
    open(roomId) {
      this.dialogVisible = true
      this.selectedId = roomId
      this.selectedRoom = undefined
      this.list = []
      this.total = 0
      this.resetQuery()
    },
    // 查询列表
    getList() {
      this.loading = true
      return MeetingRoomApi.getBookableMeetingRoomPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        const room = this.list.find(item => item.id === this.selectedId)
        if (room) {
          this.selectedRoom = room
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) {
        this.$refs.queryForm.resetFields()
      }
      return this.handleQuery()
    },
    // 选中会议室
    handleSelect(room) {
      this.selectedId = room.id
      this.selectedRoom = room
    },
    // 确认选择
    submitForm() {
      const room = this.selectedRoom
      // 未重新选择时保留原会议室，不要求原记录位于当前页
      if (!room && this.selectedId) {
        this.dialogVisible = false
        return
      }
      if (!room) {
        this.$modal.msgWarning('请选择会议室')
        return
      }
      this.$emit('select', room)
      this.dialogVisible = false
    }
  }
}
</script>
