<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body width="480px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="凭证字" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入凭证字" />
      </el-form-item>
      <el-form-item label="打印标题" prop="printTitle">
        <el-input v-model="formData.printTitle" maxlength="255" placeholder="请输入打印标题" />
      </el-form-item>
      <el-form-item label="是否默认" prop="defaultStatus">
        <el-radio-group v-model="formData.defaultStatus">
          <el-radio
            v-for="dict in defaultStatusOptions"
            :key="String(dict.value)"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsVoucherWordApi } from '@/api/fms/config/voucher-word'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'FmsVoucherWordForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '凭证字不能为空', trigger: 'blur' }],
        defaultStatus: [{ required: true, message: '请选择是否默认', trigger: 'change' }]
      }
    }
  },
  computed: {
    defaultStatusOptions() {
      return getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING).map(dict => ({
        ...dict,
        value: String(dict.value) === 'true'
      }))
    }
  },
  methods: {
    defaultForm(accountSetId) {
      return {
        id: undefined,
        accountSetId: Number(accountSetId) || 0,
        name: '',
        printTitle: '记账凭证',
        defaultStatus: false
      }
    },
    open(type, accountSetId, row) {
      const resolvedAccountSetId = Number(accountSetId) || 0
      if (!resolvedAccountSetId) return
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.formData = this.defaultForm(resolvedAccountSetId)
      if (row) {
        this.formData = {
          ...row,
          accountSetId: resolvedAccountSetId,
          printTitle: row.printTitle || '记账凭证'
        }
      }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formData.id
          ? FmsVoucherWordApi.updateVoucherWord(this.formData)
          : FmsVoucherWordApi.createVoucherWord(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formData.id ? '修改成功' : '新增成功')
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
