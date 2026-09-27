<template>
  <Dialog
    title="费用报销详情"
    v-model="dialogVisible"
    width="1100px"
    append-to-body
  >
    <oa-reimbursement-detail v-if="dialogVisible && detailId" :id="detailId" :key="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import OaReimbursementDetail from './detail/index.vue'

export default {
  name: 'OaReimbursementDetailDialog',
  components: { Dialog, OaReimbursementDetail },
  data() {
    return {
      dialogVisible: false, // 弹窗是否展示
      detailId: undefined // 申请编号
    }
  },
  methods: {
    /** 打开弹窗 */
    open(id) {
      this.detailId = id
      this.dialogVisible = true
    }
  }
}
</script>
