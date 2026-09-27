<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <!-- 账号配置 -->
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="邮箱地址" prop="mail">
        <el-input
          v-model="formData.mail"
          :disabled="formType !== 'create'"
          placeholder="请输入邮箱地址"
          @blur="handleMailBlur"
        />
      </el-form-item>
      <el-form-item label="邮箱服务" prop="providerId">
        <mail-provider-select v-model="formData.providerId" :disabled="formType !== 'create'" style="width: 100%" />
      </el-form-item>
      <el-form-item label="登录名" prop="username">
        <el-input
          v-model="formData.username"
          :disabled="formType !== 'create'"
          placeholder="请输入登录名"
        />
      </el-form-item>
      <el-form-item label="授权码/密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          show-password
          autocomplete="new-password"
          :placeholder="formType === 'create' ? '请输入授权码或密码' : '留空表示不修改'"
        />
      </el-form-item>
      <el-form-item label="设为默认">
        <el-checkbox v-model="formData.defaultStatus">默认账号</el-checkbox>
      </el-form-item>
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
import * as AccountApi from '@/api/oa/mail/account'
import MailProviderSelect from '../provider/components/MailProviderSelect.vue'

function createDefaultFormData() {
  return {
    providerId: undefined,
    mail: '',
    username: '',
    password: '',
    defaultStatus: false,
    status: CommonStatusEnum.ENABLE
  }
}

export default {
  name: 'OaMailAccountForm',
  components: { Dialog, MailProviderSelect },
  data() {
    return {
      dialogVisible: false, // 弹窗是否展示
      dialogTitle: '', // 弹窗标题
      formLoading: false, // 表单加载状态
      formType: 'create', // 表单类型
      formData: createDefaultFormData(),
      formRules: {
        mail: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确邮箱地址', trigger: 'blur' }
        ],
        providerId: [{ required: true, message: '请选择邮箱服务', trigger: 'change' }],
        username: [{ required: true, message: '请输入登录名', trigger: 'blur' }],
        password: [{ validator: this.validatePassword, trigger: 'blur' }]
      },
      DICT_TYPE
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.COMMON_STATUS)
    }
  },
  watch: {
    dialogVisible(visible) {
      // 关闭时清理当前凭据
      if (!visible) this.formData.password = ''
    }
  },
  methods: {
    /** 校验新增账号的授权码或密码，修改时允许留空 */
    validatePassword(rule, value, callback) {
      if (this.formType === 'create' && !(value && value.trim())) {
        callback(new Error('请输入授权码或密码'))
        return
      }
      callback()
    },
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增账号' : '修改账号'
      this.resetForm()
      this.formLoading = true
      return Promise.resolve()
        .then(() => {
          if (id) {
            // 修改时，设置数据；密码不回显
            return AccountApi.getMailAccount(id).then(response => {
              this.formData = { ...response.data, password: '' }
            })
          }
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 邮箱输入后补充默认登录名 */
    handleMailBlur() {
      if (!this.formData.username) {
        this.formData.username = this.formData.mail
      }
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? AccountApi.createMailAccount(this.formData)
          : AccountApi.updateMailAccount(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.formData.password = ''
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
