<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="微信号" prop="account">
        <span slot="label">
          <el-tooltip
            content="在微信公众平台（mp.weixin.qq.com）的菜单 [设置与开发 - 公众号设置 - 账号详情] 中能找到「微信号」"
            placement="top"
          >
            <i class="el-icon-question" />
          </el-tooltip>
          微信号
        </span>
        <el-input v-model="formData.account" placeholder="请输入微信号" />
      </el-form-item>
      <el-form-item label="appId" prop="appId">
        <span slot="label">
          <el-tooltip
            content="在微信公众平台（mp.weixin.qq.com）的菜单 [设置与开发 - 公众号设置 - 基本设置] 中能找到「开发者ID(AppID)」"
            placement="top"
          >
            <i class="el-icon-question" />
          </el-tooltip>
          appId
        </span>
        <el-input v-model="formData.appId" placeholder="请输入公众号 appId" />
      </el-form-item>
      <el-form-item label="appSecret" prop="appSecret">
        <span slot="label">
          <el-tooltip
            content="在微信公众平台（mp.weixin.qq.com）的菜单 [设置与开发 - 公众号设置 - 基本设置] 中能找到「开发者密码(AppSecret)」"
            placement="top"
          >
            <i class="el-icon-question" />
          </el-tooltip>
          appSecret
        </span>
        <el-input v-model="formData.appSecret" placeholder="请输入公众号 appSecret" />
      </el-form-item>
      <el-form-item label="token" prop="token">
        <el-input v-model="formData.token" placeholder="请输入公众号token" />
      </el-form-item>
      <el-form-item label="消息加解密密钥" prop="aesKey">
        <el-input v-model="formData.aesKey" placeholder="请输入消息加解密密钥" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createAccount,
  getAccount,
  updateAccount
} from '@/api/mp/account'

export default {
  name: 'MpAccountForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        account: [{ required: true, message: '公众号账号不能为空', trigger: 'blur' }],
        appId: [{ required: true, message: '公众号 appId 不能为空', trigger: 'blur' }],
        appSecret: [{ required: true, message: '公众号密钥不能为空', trigger: 'blur' }],
        token: [{ required: true, message: '公众号 token 不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: '',
        account: '',
        appId: '',
        appSecret: '',
        token: '',
        aesKey: '',
        remark: ''
      }
    },
    /** 打开新增/编辑弹窗。 */
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'update' ? '修改公众号账号' : '新增公众号账号'
      this.formType = type || 'create'
      this.formData = this.defaultForm()
      this.formLoading = false
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
      if (id === undefined || id === null) return
      this.formLoading = true
      getAccount(id)
        .then(response => {
          this.formData = response.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 提交新增/编辑表单。 */
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'update'
          ? updateAccount(this.formData)
          : createAccount(this.formData)
        request
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
    }
  }
}
</script>
