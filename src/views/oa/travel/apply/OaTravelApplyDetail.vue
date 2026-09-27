<template>
  <dialog-component title="出差申请详情" v-model="dialogVisible" width="1200px">
    <travel-apply-detail v-if="dialogVisible && detailId" :id="detailId" :key="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </dialog-component>
</template>

<script>
import DialogComponent from '@/components/Dialog'
import TravelApplyDetail from './detail/index.vue'

export default {
  name: 'OaTravelApplyDetailDialog',
  components: { DialogComponent, TravelApplyDetail },
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
