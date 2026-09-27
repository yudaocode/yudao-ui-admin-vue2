<template>
  <Dialog title="用车申请详情" v-model="dialogVisible" width="900px">
    <!-- 复用独立业务详情，列表与 BPM 审批页保持一致 -->
    <vehicle-apply-detail v-if="dialogVisible && detailId" :key="detailId" :id="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import VehicleApplyDetail from './detail/index.vue'

export default {
  name: 'OaVehicleApplyDetail',
  components: { Dialog, VehicleApplyDetail },
  data() {
    return {
      dialogVisible: false,
      detailId: undefined
    }
  },
  methods: {
    open(id) {
      this.detailId = id
      this.dialogVisible = true
    }
  }
}
</script>
