<template>
  <el-descriptions :column="column" border size="small">
    <el-descriptions-item label="等级">{{ user.levelName || '无' }}</el-descriptions-item>
    <el-descriptions-item label="成长值">{{ user.experience || 0 }}</el-descriptions-item>
    <el-descriptions-item label="当前积分">{{ user.point || 0 }}</el-descriptions-item>
    <el-descriptions-item label="总积分">{{ user.totalPoint || 0 }}</el-descriptions-item>
    <el-descriptions-item label="当前余额">{{ fenToYuan(wallet.balance) }} 元</el-descriptions-item>
    <el-descriptions-item label="支出金额">{{ fenToYuan(wallet.totalExpense) }} 元</el-descriptions-item>
    <el-descriptions-item label="充值金额">{{ fenToYuan(wallet.totalRecharge) }} 元</el-descriptions-item>
  </el-descriptions>
</template>

<script>
export default {
  name: 'UserAccountInfo',
  props: {
    user: { type: Object, default: () => ({}) },
    wallet: { type: Object, default: () => ({}) },
    column: { type: Number, default: 2 }
  },
  methods: {
    fenToYuan(value) {
      return (Number(value || 0) / 100).toFixed(2)
    }
  }
}
</script>
