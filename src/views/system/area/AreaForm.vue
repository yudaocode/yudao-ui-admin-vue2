<template>
  <el-dialog title="IP 查询" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="IP" prop="ip">
        <el-input v-model="formData.ip" placeholder="请输入 IP 地址" />
      </el-form-item>
      <el-form-item label="地址" prop="result">
        <el-input v-model="formData.result" placeholder="展示查询 IP 结果" readonly />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAreaByIp } from '@/api/system/area'

export default {
  name: 'SystemAreaForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: { ip: '', result: undefined },
      formRules: { ip: [{ required: true, message: 'IP 地址不能为空', trigger: 'blur' }] }
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.formData = { ip: '', result: undefined }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        getAreaByIp((this.formData.ip || '').trim()).then(response => {
          this.formData.result = response.data
          this.$modal.msgSuccess('查询成功')
        }).finally(() => { this.formLoading = false })
      })
    }
  }
}
</script>
