<template>
  <dialog-component title="领用申请详情" v-model="dialogVisible" width="1000px">
    <supply-apply-detail v-if="dialogVisible && detailId" :id="detailId" :key="detailId" />
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </dialog-component>
</template>

<script>
import DialogComponent from '@/components/Dialog'
import SupplyApplyDetail from './detail/index.vue'

export default {
  name: 'OaSupplyApplyDetailDialog',
  components: { DialogComponent, SupplyApplyDetail },
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
