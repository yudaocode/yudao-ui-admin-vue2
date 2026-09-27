<template>
  <Dialog title="还车申请详情" v-model="dialogVisible" width="900px">
    <vehicle-return-detail v-if="dialogVisible && detailId" :key="detailId" :id="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import VehicleReturnDetail from './detail/index.vue'

export default {
  name: 'OaVehicleReturnDetail',
  components: { Dialog, VehicleReturnDetail },
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
