<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" append-to-body v-dialogDrag>
    <el-form ref="form" v-loading="formLoading" :model="form" :rules="rules" label-width="160px">
      <el-form-item label="应用名" prop="name"><el-input v-model="form.name" placeholder="请输入应用名" /></el-form-item>
      <el-form-item label="应用标识" prop="appKey"><el-input v-model="form.appKey" placeholder="请输入应用标识" /></el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="toNumber(dict.value)">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="支付结果的回调地址" prop="orderNotifyUrl"><el-input v-model="form.orderNotifyUrl" placeholder="请输入支付结果的回调地址" /></el-form-item>
      <el-form-item label="退款结果的回调地址" prop="refundNotifyUrl"><el-input v-model="form.refundNotifyUrl" placeholder="请输入退款结果的回调地址" /></el-form-item>
      <el-form-item label="转账结果的回调地址" prop="transferNotifyUrl"><el-input v-model="form.transferNotifyUrl" placeholder="请输入转账结果的回调地址" /></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createApp, getApp, updateApp } from '@/api/pay/app'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'PayAppForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      form: {},
      rules: {
        name: [{ required: true, message: '应用名不能为空', trigger: 'blur' }],
        appKey: [{ required: true, message: '应用标识不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '开启状态不能为空', trigger: 'change' }],
        orderNotifyUrl: [{ required: true, message: '支付结果的回调地址不能为空', trigger: 'blur' }],
        refundNotifyUrl: [{ required: true, message: '退款结果的回调地址不能为空', trigger: 'blur' }]
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
      this.dialogTitle = type === 'update' ? '修改支付应用信息' : '新增支付应用信息'
      this.dialogVisible = true
      this.reset()
      if (type === 'update' && id !== undefined && id !== null) {
        this.formLoading = true
        getApp(id).then((response) => {
          this.form = { ...this.defaultForm(), ...response.data }
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    close() {
      this.dialogVisible = false
      this.reset()
    },
    defaultForm() {
      return {
        id: undefined,
        appKey: undefined,
        name: undefined,
        status: CommonStatusEnum.ENABLE,
        remark: undefined,
        orderNotifyUrl: undefined,
        refundNotifyUrl: undefined,
        transferNotifyUrl: undefined
      }
    },
    reset() {
      this.form = this.defaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const action = this.formType === 'update' ? updateApp(this.form) : createApp(this.form)
        action.then(() => {
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
