<template>
  <Dialog
    v-model="dialogVisible"
    title="立即推送频道消息"
    width="640px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item
        label="所属频道"
        prop="channelId"
      >
        <ChannelSelect
          v-model="formData.channelId"
          placeholder="请选择频道（用于加载素材）"
        />
      </el-form-item>
      <el-form-item
        label="素材"
        prop="materialId"
      >
        <MaterialSelect
          v-model="formData.materialId"
          :channel-id="formData.channelId"
          placeholder="请选择素材"
        />
      </el-form-item>
      <el-form-item label="受众">
        <el-radio-group v-model="formData.receiverUserType">
          <el-radio label="all">全员</el-radio>
          <el-radio label="users">指定用户</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="formData.receiverUserType === 'users'"
        label="接收用户"
        prop="receiverUserIds"
      >
        <UserSelectV2
          v-model="formData.receiverUserIds"
          :multiple="true"
          placeholder="请选择接收用户"
          @change="handleReceiverUserChange"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确认推送</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { sendManagerChannelMessage } from '@/api/im/manager/channel/message'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import ChannelSelect from '../list/components/ChannelSelect.vue'
import MaterialSelect from '../material/components/MaterialSelect.vue'

export default {
  name: 'ImChannelMessageSendForm',
  components: { Dialog, ChannelSelect, MaterialSelect, UserSelectV2 },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: this.getDefaultFormData(),
      formRules: {
        channelId: [{ required: true, message: '请选择频道', trigger: 'change' }],
        materialId: [{ required: true, message: '请选择素材', trigger: 'change' }],
        receiverUserIds: [{ required: true, message: '请至少选择一个接收用户', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { channelId: undefined, materialId: undefined, receiverUserType: 'all', receiverUserIds: [] }
    },
    open() {
      this.dialogVisible = true
      this.resetForm()
    },
    handleReceiverUserChange() {
      if (this.$refs.form) this.$refs.form.validateField('receiverUserIds')
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        await sendManagerChannelMessage({
          materialId: this.formData.materialId,
          receiverUserIds: this.formData.receiverUserType === 'users' ? this.formData.receiverUserIds : undefined
        })
        this.$modal.msgSuccess('推送成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
