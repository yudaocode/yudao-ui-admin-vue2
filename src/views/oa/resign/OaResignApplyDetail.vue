<template>
  <Dialog
    title="离职申请详情"
    v-model="dialogVisible"
    width="900px"
    append-to-body
  >
    <oa-resign-apply-detail v-if="dialogVisible && detailId" :id="detailId" :key="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import OaResignApplyDetail from './detail/index.vue'

export default {
  name: 'OaResignApplyDetailDialog',
  components: { Dialog, OaResignApplyDetail },
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
