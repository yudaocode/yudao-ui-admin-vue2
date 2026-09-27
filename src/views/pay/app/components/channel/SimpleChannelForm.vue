<template>
  <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="800px" append-to-body v-dialogDrag>
    <el-form ref="form" v-loading="formLoading" :model="form" :rules="rules" label-width="180px">
      <el-form-item label="渠道状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="toNumber(dict.value)">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createChannel, getChannel, updateChannel } from '@/api/pay/channel'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'SimpleChannelForm',
  props: { configName: { type: String, default: 'mock-conf' } },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      form: {},
      rules: { status: [{ required: true, message: '渠道状态不能为空', trigger: 'change' }] }
    }
  },
  methods: {
    getDictDatas,
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    open(appId, code) {
      this.form = { appId, code, status: CommonStatusEnum.ENABLE, feeRate: 0, remark: '', config: { name: this.configName } }
      this.dialogTitle = '创建支付渠道'
      this.dialogVisible = true
      this.formLoading = true
      getChannel(appId, code).then((response) => {
        const data = response.data
        if (data && data.id) {
          this.form = { ...data, config: JSON.parse(data.config) }
          this.dialogTitle = '编辑支付渠道'
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    close() {
      this.dialogVisible = false
      this.form = {}
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const data = { ...this.form, config: JSON.stringify(this.form.config || {}) }
        const action = data.id ? updateChannel(data) : createChannel(data)
        action.then(() => {
          this.$modal.msgSuccess(data.id ? '修改成功' : '新增成功')
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
