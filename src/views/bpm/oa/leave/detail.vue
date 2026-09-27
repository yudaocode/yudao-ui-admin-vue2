<template>
  <div class="app-container">
    <el-descriptions
      v-loading="detailLoading"
      :column="1"
      border
    >
      <el-descriptions-item label="请假类型">
        <dict-tag
          :type="DICT_TYPE.BPM_OA_LEAVE_TYPE"
          :value="form.type"
        />
      </el-descriptions-item>
      <el-descriptions-item label="开始时间">
        {{ parseTime(form.startTime, '{y}-{m}-{d}') }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        {{ parseTime(form.endTime, '{y}-{m}-{d}') }}
      </el-descriptions-item>
      <el-descriptions-item label="原因">
        {{ form.reason }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getLeave } from '@/api/bpm/leave'
import { DICT_TYPE } from '@/utils/dict'
export default {
  name: 'BpmOALeaveDetail',
  components: {
  },
  props: {
    id: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      leaveId: undefined, // 请假编号
      detailLoading: false,
      form: {},
      DICT_TYPE
    }
  },
  created() {
    this.leaveId = this.id || this.$route.query.id
    this.getInfo()
  },
  methods: {
    /** 获得请假信息 */
    async getInfo() {
      this.detailLoading = true
      try {
        const response = await getLeave(this.leaveId)
        this.form = response.data
      } finally {
        this.detailLoading = false
      }
    }
  }
}
</script>
