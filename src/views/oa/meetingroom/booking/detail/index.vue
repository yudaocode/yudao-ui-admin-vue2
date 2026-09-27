<template>
  <div class="app-container oa-meeting-room-booking-detail">
    <!-- 会议室预定信息 -->
    <el-descriptions v-loading="detailLoading" :column="2" border>
      <el-descriptions-item label="预定单号">{{ detailData.no }}</el-descriptions-item>
      <el-descriptions-item label="会议室">{{ detailData.roomName }}</el-descriptions-item>
      <el-descriptions-item label="位置">{{ detailData.roomLocation }}</el-descriptions-item>
      <el-descriptions-item label="会议室类型">
        <dict-tag
          v-if="detailData.roomType !== undefined"
          :type="DICT_TYPE.OA_MEETING_ROOM_TYPE"
          :value="detailData.roomType"
        />
      </el-descriptions-item>
      <el-descriptions-item label="会议主题">{{ detailData.title }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ detailData.creatorName }}</el-descriptions-item>
      <el-descriptions-item label="申请部门">{{ detailData.deptName }}</el-descriptions-item>
      <el-descriptions-item label="主持人">{{ detailData.moderatorName }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">
        {{ formatDate(detailData.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        {{ formatDate(detailData.endTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="参会人">
        {{ detailData.attendeeNames && detailData.attendeeNames.join('、') }}
      </el-descriptions-item>
      <el-descriptions-item label="提醒方式">
        <dict-tag
          v-if="detailData.reminderType !== undefined"
          :type="DICT_TYPE.OA_MEETING_ROOM_REMINDER_TYPE"
          :value="detailData.reminderType"
        />
      </el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <el-tag v-if="detailData.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
          未提交
        </el-tag>
        <dict-tag
          v-else-if="detailData.status !== undefined"
          :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
          :value="detailData.status"
        />
      </el-descriptions-item>
      <el-descriptions-item label="使用状态">
        <dict-tag
          v-if="detailData.useStatus !== undefined"
          :type="DICT_TYPE.OA_MEETING_ROOM_USE_STATUS"
          :value="detailData.useStatus"
        />
      </el-descriptions-item>
      <el-descriptions-item label="需要审批">
        <dict-tag
          v-if="detailData.needApproval != null"
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="detailData.needApproval"
        />
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="会议内容">{{ detailData.description }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ detailData.remark }}</el-descriptions-item>
      <el-descriptions-item label="附件" :span="2">
        <upload-file :model-value="detailData.fileUrls" disabled :is-show-tip="false" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import * as MeetingRoomBookingApi from '@/api/oa/meetingroom/booking'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'

export default {
  name: 'OaMeetingRoomBookingBusinessDetail',
  props: {
    id: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      detailLoading: false,
      detailData: {
        attendeeUserIds: [],
        fileUrls: []
      }
    }
  },
  computed: {
    detailId() {
      return this.id || this.$route.query.id
    }
  },
  watch: {
    detailId: {
      handler() {
        this.getInfo()
      },
      immediate: true
    }
  },
  methods: {
    formatDate,
    // 获得预定详情
    getInfo() {
      const id = this.detailId
      if (!id) {
        return
      }
      this.detailLoading = true
      MeetingRoomBookingApi.getMeetingRoomBooking(Number(id)).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    }
  }
}
</script>
