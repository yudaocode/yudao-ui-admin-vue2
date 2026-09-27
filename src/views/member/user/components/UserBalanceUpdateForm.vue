<template>
  <el-dialog title="修改用户余额" :visible.sync="dialogVisible" width="600px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="130px">
      <el-form-item label="用户编号"><el-input v-model="formData.id" disabled /></el-form-item>
      <el-form-item label="用户昵称"><el-input v-model="formData.nickname" disabled /></el-form-item>
      <el-form-item label="变动前余额(元)"><el-input :value="formData.balance" disabled /></el-form-item>
      <el-form-item label="变动类型" prop="changeType"><el-radio-group v-model="formData.changeType"><el-radio :label="1">增加</el-radio><el-radio :label="-1">减少</el-radio></el-radio-group></el-form-item>
      <el-form-item label="变动余额(元)" prop="changeBalance"><el-input-number v-model="formData.changeBalance" :min="0" :precision="2" :step="0.1" /></el-form-item>
      <el-form-item label="变动后余额(元)"><el-input :value="balanceResult" disabled /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as UserApi from '@/api/member/user'
import * as WalletApi from '@/api/pay/wallet/balance'

const blank = () => ({ id: undefined, nickname: undefined, balance: '0.00', changeBalance: 0, changeType: 1 })
const toFen = value => Math.round(Number(value || 0) * 100)
const toYuan = value => (Number(value || 0) / 100).toFixed(2)

export default {
  name: 'UpdateBalanceForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: blank(),
      formRules: { changeBalance: [{ required: true, message: '变动余额不能为空', trigger: 'blur' }] }
    }
  },
  computed: {
    balanceResult() {
      const result = Number(this.formData.balance || 0) + Number(this.formData.changeBalance || 0) * Number(this.formData.changeType || 1)
      return result.toFixed(2)
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.formData = blank()
      if (id === undefined || id === null) return
      this.formLoading = true
      UserApi.getUser(id).then(userResponse => {
        return WalletApi.getWallet({ userId: userResponse.data.id }).then(walletResponse => {
          this.formData.id = userResponse.data.id
          this.formData.nickname = userResponse.data.nickname
          this.formData.balance = toYuan(walletResponse.data.balance)
          this.formData.changeType = 1
          this.formData.changeBalance = 0
        })
      }).finally(() => { this.formLoading = false })
    },
    cancel() {
      this.dialogVisible = false
      this.formData = blank()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (Number(this.formData.changeBalance) <= 0) { this.$modal.msgError('变动余额不能为零'); return }
        if (Number(this.balanceResult) < 0) { this.$modal.msgError('变动后的余额不能小于 0'); return }
        this.formLoading = true
        WalletApi.updateWalletBalance({ userId: this.formData.id, balance: toFen(this.formData.changeBalance) * Number(this.formData.changeType) }).then(() => {
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.formLoading = false })
      })
    }
  }
}
</script>

<style scoped>.dialog-footer { text-align: right; }</style>
