<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" v-dialogDrag append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="提现标题" prop="subject">
        <el-input v-model="form.subject" placeholder="请输入提现标题" />
      </el-form-item>
      <el-form-item label="提现类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">支付宝</el-radio>
          <el-radio :label="2">微信余额</el-radio>
          <el-radio :label="3">钱包</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="提现金额(元)" prop="price">
        <el-input-number v-model="form.price" :min="0.01" :precision="2" :step="0.01" style="width: 200px" />
      </el-form-item>
      <el-form-item label="收款人账号" prop="userAccount">
        <el-input v-model="form.userAccount" :placeholder="getAccountPlaceholder()" />
      </el-form-item>
      <el-form-item label="收款人姓名" prop="userName">
        <el-input v-model="form.userName" placeholder="请输入收款人姓名" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createDemoWithdraw } from '@/api/pay/demo/withdraw'
import { yuanToFen } from '@/views/pay/utils/amount'

export default {
  name: 'DemoWithdrawForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '创建示例提现单',
      formLoading: false,
      form: {
        subject: '',
        price: 0,
        type: 1,
        userName: '',
        userAccount: ''
      },
      rules: {
        subject: [{ required: true, message: '提现标题不能为空', trigger: 'blur' }],
        price: [{ required: true, message: '提现金额不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '提现类型不能为空', trigger: 'change' }],
        userAccount: [{ required: true, message: '收款人账号不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(type) {
      this.dialogTitle = type === 'create' ? '创建示例提现单' : '示例提现单'
      this.dialogVisible = true
      this.reset()
    },
    close() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = { subject: '', price: 0, type: 1, userName: '', userAccount: '' }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    getAccountPlaceholder() {
      if (this.form.type === 1) return '请输入支付宝账号'
      if (this.form.type === 2) return '请输入微信 openid'
      if (this.form.type === 3) return '请输入钱包编号'
      return '请输入收款人账号'
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const data = { ...this.form, price: yuanToFen(this.form.price) }
        createDemoWithdraw(data).then(() => {
          this.$modal.msgSuccess('新增成功')
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
