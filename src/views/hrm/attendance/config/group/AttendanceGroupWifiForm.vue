<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="WiFi 名称" prop="ssid">
        <el-input v-model="formData.ssid" maxlength="50" placeholder="请输入 WiFi 名称" />
      </el-form-item>
      <el-form-item label="MAC 地址" prop="mac">
        <el-input v-model="formData.mac" maxlength="17" placeholder="例如 00:11:22:33:44:55" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
const macPattern = /^((([0-9a-f]{2}:){5})|(([0-9a-f]{2}-){5}))[0-9a-f]{2}$/i

export default {
  name: 'HrmAttendanceGroupWifiForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formData: this.createDefaultWifi(),
      formRules: {
        ssid: [{ required: true, message: 'WiFi 名称不能为空', trigger: 'blur' }],
        mac: [
          { required: true, message: 'MAC 地址不能为空', trigger: 'blur' },
          { pattern: macPattern, message: 'MAC 地址格式不正确', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(wifi) {
      this.dialogVisible = true
      this.dialogTitle = wifi ? '编辑打卡 WiFi' : '新增打卡 WiFi'
      this.resetForm()
      if (wifi) {
        this.formData = { ...wifi }
      }
    },
    /** 提交表单 */
    async submitForm() {
      await this.$refs.form.validate()
      this.$emit('confirm', { ...this.formData })
      this.dialogVisible = false
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.createDefaultWifi()
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    /** 创建默认打卡 WiFi */
    createDefaultWifi() {
      return {
        ssid: '',
        mac: ''
      }
    }
  }
}
</script>
