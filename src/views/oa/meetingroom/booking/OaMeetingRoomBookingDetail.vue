<template>
  <Dialog title="会议室预定详情" v-model="dialogVisible" width="950px">
    <!-- 复用独立业务详情，列表与 BPM 审批页保持一致 -->
    <meeting-room-booking-detail v-if="dialogVisible && detailId" :key="detailId" :id="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import MeetingRoomBookingDetail from './detail/index.vue'

export default {
  name: 'OaMeetingRoomBookingDetail',
  components: { Dialog, MeetingRoomBookingDetail },
  data() {
    return {
      dialogVisible: false,
      detailId: undefined
    }
  },
  methods: {
    // 打开弹窗
    open(id) {
      this.detailId = id
      this.dialogVisible = true
    }
  }
}
</script>
