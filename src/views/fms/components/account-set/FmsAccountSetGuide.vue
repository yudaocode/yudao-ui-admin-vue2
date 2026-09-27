<!-- FMS 账套开通引导：提示用户创建账套或完成账套初始化 -->
<template>
  <el-dialog
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
    append-to-body
    title="账套开通引导"
    width="560px"
  >
    <el-result icon="warning" :title="title" :sub-title="description">
      <template slot="extra">
        <el-button v-if="canHandle" type="primary" @click="goAccountSet">前往账套管理</el-button>
        <el-button @click="close">{{ canHandle ? '稍后处理' : '我知道了' }}</el-button>
      </template>
    </el-result>
  </el-dialog>
</template>

<script>
import { checkPermi } from '@/utils/permission'

const FMS_ACCOUNT_SET_PATH = '/fms/config/account-set'

export default {
  name: 'FmsAccountSetGuide',
  data() {
    return {
      dialogVisible: false,
      reason: 'empty'
    }
  },
  computed: {
    canHandle() {
      return this.reason === 'empty'
        ? checkPermi(['fms:config:account-set:create'])
        : checkPermi(['fms:config:account-set:initialize'])
    },
    title() {
      return this.reason === 'empty' ? '当前账号暂无账套' : '当前账套尚未初始化'
    },
    description() {
      if (this.reason === 'empty') {
        return this.canHandle
          ? '请先创建账套并完成初始化，再进入财务管理。'
          : '请联系管理员创建账套，或将当前账号加入已有账套。'
      }
      return this.canHandle
        ? '请前往账套管理，选择账套并点击【开始记账】完成初始化。'
        : '请联系管理员完成账套初始化后再进入财务管理。'
    }
  },
  methods: {
    open(reason) {
      this.reason = reason
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
    },
    goAccountSet() {
      this.close()
      this.$router.push(FMS_ACCOUNT_SET_PATH)
    }
  }
}
</script>
