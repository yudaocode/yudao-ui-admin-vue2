<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" v-dialogDrag append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="套餐名" prop="name"><el-input v-model="form.name" placeholder="请输入套餐名" /></el-form-item>
      <el-form-item label="支付金额(元)" prop="payPrice"><el-input-number v-model="form.payPrice" :min="0" :precision="2" :step="0.01" /></el-form-item>
      <el-form-item label="赠送金额(元)" prop="bonusPrice"><el-input-number v-model="form.bonusPrice" :min="0" :precision="2" :step="0.01" /></el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="toNumber(dict.value)">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getWalletRechargePackage, createWalletRechargePackage, updateWalletRechargePackage } from '@/api/pay/wallet/rechargePackage'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { yuanToFen } from '@/views/pay/utils/amount'

export default {
  name: 'WalletRechargePackageForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      form: { id: undefined, name: undefined, payPrice: undefined, bonusPrice: undefined, status: undefined },
      rules: {
        name: [{ required: true, message: '套餐名不能为空', trigger: 'blur' }],
        payPrice: [{ required: true, message: '支付金额不能为空', trigger: 'blur' }],
        bonusPrice: [{ required: true, message: '赠送金额不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDictDatas,
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    open(type, id) {
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改钱包充值套餐' : '新增钱包充值套餐'
      this.dialogVisible = true
      this.reset()
      if (type === 'update' && id !== undefined && id !== null) {
        this.formLoading = true
        return getWalletRechargePackage(id).then((response) => {
          const data = response.data
          this.form = {
            ...data,
            payPrice: data.payPrice === undefined ? undefined : Number(data.payPrice) / 100,
            bonusPrice: data.bonusPrice === undefined ? undefined : Number(data.bonusPrice) / 100
          }
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    close() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = { id: undefined, name: undefined, payPrice: undefined, bonusPrice: undefined, status: undefined }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const data = {
          ...this.form,
          payPrice: yuanToFen(this.form.payPrice),
          bonusPrice: yuanToFen(this.form.bonusPrice)
        }
        const action = this.formType === 'update' ? updateWalletRechargePackage(data) : createWalletRechargePackage(data)
        return action.then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>
