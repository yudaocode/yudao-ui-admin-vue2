<template>
  <Dialog title="设定" v-model="dialogVisible" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="130px"
    >
      <el-form-item label="角色设定" prop="systemMessage">
        <el-input
          v-model="formData.systemMessage"
          type="textarea"
          :rows="4"
          placeholder="请输入角色设定"
        />
      </el-form-item>
      <el-form-item label="模型" prop="modelId">
        <el-select v-model="formData.modelId" placeholder="请选择模型" style="width: 100%">
          <el-option v-for="model in models" :key="model.id" :label="model.name" :value="model.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="温度参数" prop="temperature">
        <el-input-number
          v-model="formData.temperature"
          :min="0"
          :max="2"
          :precision="2"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="回复数 Token 数" prop="maxTokens">
        <el-input-number v-model="formData.maxTokens" :min="0" :max="8192" style="width: 100%" />
      </el-form-item>
      <el-form-item label="上下文数量" prop="maxContexts">
        <el-input-number v-model="formData.maxContexts" :min="0" :max="20" style="width: 100%" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </Dialog>
</template>

<script>
import { ChatConversationApi } from '@/api/ai/chat/conversation'
import { ModelApi } from '@/api/ai/model/model'
import { AiModelTypeEnum } from '@/views/ai/utils/constants'
import Dialog from '@/components/Dialog'

export default {
  name: 'ChatConversationUpdateForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      models: [],
      formData: this.getDefaultForm(),
      formRules: {
        modelId: [{ required: true, message: '模型不能为空', trigger: 'change' }],
        temperature: [{ required: true, message: '温度参数不能为空', trigger: 'blur' }],
        maxTokens: [{ required: true, message: '回复数 Token 数不能为空', trigger: 'blur' }],
        maxContexts: [{ required: true, message: '上下文数量不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        systemMessage: undefined,
        modelId: undefined,
        temperature: undefined,
        maxTokens: undefined,
        maxContexts: undefined
      }
    },
    async open(id) {
      this.dialogVisible = true
      this.formData = this.getDefaultForm()
      this.$nextTick(() => { if (this.$refs.form) this.$refs.form.clearValidate() })
      if (id) {
        this.formLoading = true
        try {
          const conversation = (await ChatConversationApi.getChatConversationMy(id)).data
          this.formData = Object.keys(this.formData).reduce((result, key) => {
            if (Object.prototype.hasOwnProperty.call(conversation, key)) {
              result[key] = conversation[key]
            }
            return result
          }, {})
        } finally {
          this.formLoading = false
        }
      }
      this.models = (await ModelApi.getModelSimpleList(AiModelTypeEnum.CHAT)).data
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        await ChatConversationApi.updateChatConversationMy(this.formData)
        this.$modal.msgSuccess('对话配置已更新')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
