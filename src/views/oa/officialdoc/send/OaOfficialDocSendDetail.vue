<template>
  <Dialog title="公文发文详情" v-model="dialogVisible" width="1000px">
    <official-doc-send-detail v-if="dialogVisible && detailId" :key="detailId" :id="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import OfficialDocSendDetail from './detail/index.vue'

export default {
  name: 'OaOfficialDocSendDetail',
  components: { Dialog, OfficialDocSendDetail },
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
