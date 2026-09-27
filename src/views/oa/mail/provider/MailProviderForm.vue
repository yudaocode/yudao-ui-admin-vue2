<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="680px">
    <!-- 邮箱服务配置 -->
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入邮箱服务名称" />
      </el-form-item>
      <template v-for="protocol in protocols">
        <el-divider :key="protocol.key + '-divider'" content-position="left">{{ protocol.label }}</el-divider>
        <el-form-item :key="protocol.key + '-host'" label="服务器域名" :prop="protocol.key + '.host'" :rules="hostRules">
          <el-input v-model="formData[protocol.key].host" placeholder="请输入服务器域名" />
        </el-form-item>
        <el-form-item :key="protocol.key + '-port'" label="端口">
          <el-input-number v-model="formData[protocol.key].port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item :key="protocol.key + '-security'" label="连接加密">
          <el-radio-group :value="formData[protocol.key].sslEnable" @input="value => handleSecurityChange(protocol.key, value)">
            <el-radio :label="true">SSL</el-radio>
            <el-radio :label="false">STARTTLS</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
      <el-form-item label="状态">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <!-- 表单操作 -->
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as ProviderApi from '@/api/oa/mail/provider'

/** 校验服务器域名或 IP 地址 */
function isServerHost(value) {
  if (!value || value.length > 253) return false
  const ipv4 = /^(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
  if (ipv4.test(value)) return true
  // 允许带端口或 IPv6 字面量
  if (value.includes(':')) {
    let address = value
    if (address.includes('.')) {
      const index = address.lastIndexOf(':')
      if (!ipv4.test(address.slice(index + 1))) return false
      address = address.slice(0, index + 1) + '0:0'
    }
    const parts = address.split('::')
    if (
      parts.length > 2 ||
      !parts.every(part => part === '' || /^[\da-f]{1,4}(?::[\da-f]{1,4})*$/i.test(part))
    ) {
      return false
    }
    return true
  }
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(value)
}

function createDefaultFormData() {
  return {
    name: '',
    imap: { host: '', port: 993, sslEnable: true, starttlsEnable: false },
    smtp: { host: '', port: 465, sslEnable: true, starttlsEnable: false },
    status: CommonStatusEnum.ENABLE
  }
}

export default {
  name: 'OaMailProviderForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, // 弹窗是否展示
      dialogTitle: '', // 弹窗标题
      formLoading: false, // 表单加载状态
      formType: 'create', // 表单类型
      protocols: [
        { key: 'imap', label: 'IMAP 收信配置' },
        { key: 'smtp', label: 'SMTP 发信配置' }
      ], // 协议分组
      formData: createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      hostRules: [
        { required: true, message: '请输入服务器域名', trigger: 'blur' },
        {
          validator: (rule, value, callback) =>
            callback(isServerHost(value) ? undefined : new Error('请输入有效的服务器域名或 IP 地址')),
          trigger: 'blur'
        }
      ],
      DICT_TYPE
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.COMMON_STATUS)
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增邮箱服务' : '修改邮箱服务'
      this.formType = type
      this.resetForm()
      // 修改时，设置数据
      if (id) {
        this.formLoading = true
        return ProviderApi.getMailProvider(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
      return Promise.resolve()
    },
    /** 切换连接加密方式 */
    handleSecurityChange(protocol, sslEnable) {
      const config = protocol === 'imap' ? this.formData.imap : this.formData.smtp
      config.sslEnable = Boolean(sslEnable)
      config.starttlsEnable = !config.sslEnable
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? ProviderApi.createMailProvider(this.formData)
          : ProviderApi.updateMailProvider(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
