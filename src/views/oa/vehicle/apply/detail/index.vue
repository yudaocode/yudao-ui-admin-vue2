<template>
  <div class="app-container oa-vehicle-apply-detail">
    <!-- 申请信息 -->
    <el-descriptions v-loading="detailLoading" :column="2" border>
      <el-descriptions-item label="申请单号">{{ detailData.no }}</el-descriptions-item>
      <el-descriptions-item label="车牌号">{{ detailData.vehicleNo }}</el-descriptions-item>
      <el-descriptions-item label="预计出车时间">
        {{ formatDate(detailData.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="预计回车时间">
        {{ formatDate(detailData.endTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="出车地点">{{ detailData.startLocation }}</el-descriptions-item>
      <el-descriptions-item label="预计回车地点">{{ detailData.endLocation }}</el-descriptions-item>
      <el-descriptions-item label="用车事由" :span="2">
        {{ detailData.reason }}
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
      <el-descriptions-item label="还车状态">
        {{ getDictLabel(DICT_TYPE.OA_VEHICLE_RETURN_STATUS, detailData.returnStatus) }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      <el-descriptions-item label="附件" :span="2">
        <upload-file :model-value="detailData.fileUrls || []" disabled :is-show-tip="false" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import * as VehicleApplyApi from '@/api/oa/vehicle/apply'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'

export default {
  name: 'OaVehicleApplyBusinessDetail',
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
      detailData: { fileUrls: [] }
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
    getDictLabel,
    // 获得申请详情
    getInfo() {
      const id = this.detailId
      if (!id) {
        return
      }
      this.detailLoading = true
      this.detailData = { fileUrls: [] }
      VehicleApplyApi.getVehicleApply(Number(id)).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    }
  }
}
</script>
