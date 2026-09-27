<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="封禁群"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="群名称"><span>{{ formData.groupName }}</span></el-form-item>
      <el-form-item
        label="封禁原因"
        prop="reason"
      >
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入封禁原因"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :loading="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { banManagerGroup } from '@/api/im/manager/group'

export default {
  name: 'ImGroupBanForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: { id: 0, groupName: '', reason: '' },
      formRules: {
        reason: [{ required: true, whitespace: true, message: '封禁原因不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(row) {
      this.formData.id = row.id
      this.formData.groupName = row.name
      this.formData.reason = ''
      this.dialogVisible = true
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        await banManagerGroup({ id: this.formData.id, reason: this.formData.reason })
        this.$modal.msgSuccess('封禁成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
