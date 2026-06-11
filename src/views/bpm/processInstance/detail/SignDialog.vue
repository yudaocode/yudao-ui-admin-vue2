<template>
  <el-dialog title="签名" :visible.sync="visible" width="520px" append-to-body>
    <el-input v-model="signPicUrl" placeholder="请输入签名图片 URL" />
    <div slot="footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SignDialog',
  data() {
    return {
      visible: false,
      signPicUrl: ''
    }
  },
  methods: {
    open(value) {
      this.signPicUrl = value || ''
      this.visible = true
    },
    submit() {
      this.$emit('success', this.signPicUrl)
      this.visible = false
    }
  }
}
</script>
