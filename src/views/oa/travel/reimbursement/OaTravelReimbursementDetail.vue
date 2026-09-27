<template>
  <dialog-component title="差旅报销详情" v-model="dialogVisible" width="1200px">
    <travel-reimbursement-detail v-if="dialogVisible && detailId" :id="detailId" :key="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </dialog-component>
</template>

<script>
import DialogComponent from '@/components/Dialog'
import TravelReimbursementDetail from './detail/index.vue'

export default {
  name: 'OaTravelReimbursementDetailDialog',
  components: { DialogComponent, TravelReimbursementDetail },
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
