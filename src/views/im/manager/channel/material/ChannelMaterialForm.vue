<template>
  <Dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="720px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="所属频道"
        prop="channelId"
      >
        <ChannelSelect
          v-model="formData.channelId"
          placeholder="请选择频道"
        />
      </el-form-item>
      <el-form-item
        label="内容类型"
        prop="type"
      >
        <el-radio-group v-model="formData.type">
          <el-radio
            v-for="dict in materialTypeOptions"
            :key="dict.value"
            :label="dict.value"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="标题"
        prop="title"
      >
        <el-input
          v-model="formData.title"
          placeholder="图文标题"
          maxlength="128"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        label="封面图"
        prop="coverUrl"
      >
        <UploadImg
          v-model="formData.coverUrl"
          :limit="1"
        />
      </el-form-item>
      <el-form-item
        label="摘要"
        prop="summary"
      >
        <el-input
          v-model="formData.summary"
          placeholder="一句话摘要"
          type="textarea"
          :rows="2"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        v-if="formData.type === 1"
        label="正文"
        prop="content"
      >
        <Editor
          v-model="formData.content"
          :min-height="320"
        />
      </el-form-item>
      <el-form-item
        v-else
        label="跳转链接"
        prop="url"
      >
        <el-input
          v-model="formData.url"
          placeholder="https://example.com/..."
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
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import Editor from '@/components/Editor'
import UploadImg from '@/components/UploadImg'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  createManagerChannelMaterial,
  getManagerChannelMaterial,
  updateManagerChannelMaterial
} from '@/api/im/manager/channel/material'
import ChannelSelect from '../list/components/ChannelSelect.vue'

export default {
  name: 'ImChannelMaterialForm',
  components: { Dialog, ChannelSelect, Editor, UploadImg },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      materialTypeOptions: getIntDictOptions(DICT_TYPE.IM_CHANNEL_MATERIAL_TYPE),
      formData: this.getDefaultFormData(),
      formRules: {
        channelId: [{ required: true, message: '所属频道不能为空', trigger: 'change' }],
        type: [{ required: true, message: '内容类型不能为空', trigger: 'change' }],
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { id: undefined, channelId: undefined, type: 1, title: '', coverUrl: '', summary: '', content: '', url: '' }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getManagerChannelMaterial(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createManagerChannelMaterial(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateManagerChannelMaterial(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
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
