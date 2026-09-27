<template>
  <el-dialog
    title="发送消息模板"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="模板编号">
        <el-input
          v-model="formData.id"
          disabled
        />
      </el-form-item>
      <el-form-item label="模板标题">
        <el-input
          v-model="templateTitle"
          disabled
        />
      </el-form-item>
      <el-form-item
        label="用户"
        prop="userId"
      >
        <el-select
          v-model="formData.userId"
          filterable
          remote
          reserve-keyword
          placeholder="请输入用户昵称搜索"
          :remote-method="searchUser"
          :loading="userLoading"
          class="full-width"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname || user.openid"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="模板数据"
        prop="data"
      >
        <el-input
          v-model="formData.data"
          type="textarea"
          :rows="4"
          :placeholder="templateDataPlaceholder"
        />
      </el-form-item>
      <el-form-item
        label="跳转链接"
        prop="url"
      >
        <el-input
          v-model="formData.url"
          placeholder="请输入跳转链接"
        />
      </el-form-item>
      <el-form-item
        label="小程序 appId"
        prop="miniProgramAppId"
      >
        <el-input
          v-model="formData.miniProgramAppId"
          placeholder="请输入小程序 appId"
        />
      </el-form-item>
      <el-form-item
        label="小程序页面路径"
        prop="miniProgramPagePath"
      >
        <el-input
          v-model="formData.miniProgramPagePath"
          placeholder="请输入小程序页面路径"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="loading"
        @click="submitForm"
      >发 送</el-button>
      <el-button
        :disabled="loading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { MessageTemplateApi } from '@/api/mp/messageTemplate'
import { getUserPage } from '@/api/mp/user'

const createDefaultForm = () => ({
  id: undefined,
  userId: undefined,
  data: '',
  url: '',
  miniProgramAppId: '',
  miniProgramPagePath: ''
})

export default {
  name: 'MessageTemplateSendForm',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      templateTitle: '',
      accountId: undefined,
      templateDataPlaceholder: '请输入模板数据（JSON 格式），例如：{"keyword1": {"value": "测试内容"}}',
      formData: createDefaultForm(),
      formRules: {
        userId: [{ required: true, message: '请选择用户', trigger: 'change' }]
      },
      userLoading: false,
      userList: []
    }
  },
  methods: {
    async open(row) {
      this.resetForm()
      this.dialogVisible = true
      this.formData.id = row.id
      this.accountId = row.accountId
      this.templateTitle = row.title
      await this.searchUser('')
    },
    async searchUser(query) {
      if (!this.accountId) return
      this.userLoading = true
      try {
        const response = await getUserPage({
          pageNo: 1,
          pageSize: 20,
          accountId: this.accountId,
          nickname: query || undefined
        })
        this.userList = response.data.list || []
      } finally {
        this.userLoading = false
      }
    },
    submitForm() {
      if (this.loading || !this.$refs.form) return
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          const sendData = { ...this.formData }
          if (sendData.miniProgramAppId && sendData.miniProgramPagePath) {
            sendData.miniprogram = JSON.stringify({
              appid: sendData.miniProgramAppId,
              pagepath: sendData.miniProgramPagePath
            })
          }
          if (sendData.data) {
            try {
              sendData.data = JSON.parse(sendData.data)
            } catch (error) {
              this.$modal.msgError('模板数据格式不正确，请输入有效的 JSON 格式')
              return
            }
          }
          await MessageTemplateApi.sendMessageTemplate(sendData)
          this.$modal.msgSuccess('发送成功')
          this.dialogVisible = false
        } finally {
          this.loading = false
        }
      })
    },
    resetForm() {
      this.formData = createDefaultForm()
      this.userList = []
      this.templateTitle = ''
      this.accountId = undefined
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
