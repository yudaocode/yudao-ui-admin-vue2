<template>
  <el-dialog
    title="修改上级推广人"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item
        label="推广人"
        prop="bindUserId"
      >
        <el-input
          v-model="formData.bindUserId"
          placeholder="请输入推广员编号"
          @input="bindUser = undefined"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleGetUser"
          />
        </el-input>
      </el-form-item>
    </el-form>

    <el-descriptions
      v-if="bindUser"
      :column="1"
      border
    >
      <el-descriptions-item label="头像">
        <el-avatar :src="bindUser.avatar" />
      </el-descriptions-item>
      <el-descriptions-item label="昵称">{{ bindUser.nickname }}</el-descriptions-item>
      <el-descriptions-item label="推广资格">
        <el-tag v-if="bindUser.brokerageEnabled">有</el-tag>
        <el-tag
          v-else
          type="info"
        >无</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="成为推广员的时间">
        {{ formatDate(bindUser.brokerageTime) }}
      </el-descriptions-item>
    </el-descriptions>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :loading="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button
        :disabled="formLoading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBrokerageUser, updateBindUser } from '@/api/mall/trade/brokerage/user'
import { formatDate } from '@/utils'

export default {
  name: 'BrokerageUserUpdateForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: {
        id: undefined,
        bindUserId: undefined
      },
      formRules: {
        bindUserId: [{ required: true, message: '推广人不能为空', trigger: 'blur' }]
      },
      bindUser: undefined
    }
  },
  methods: {
    formatDate,
    async open(row) {
      this.resetForm()
      this.formData.id = row.id
      this.formData.bindUserId = row.bindUserId
      this.dialogVisible = true
      if (row.bindUserId) await this.handleGetUser()
    },
    submitForm() {
      if (this.formLoading || !this.$refs.form) return
      this.$refs.form.validate(async valid => {
        if (!valid) return
        if (this.sameUser(this.formData.bindUserId, this.formData.id)) {
          this.$modal.msgError('不能绑定自己为推广人')
          return
        }
        if (!this.bindUser || !this.sameUser(this.bindUser.id, this.formData.bindUserId)) {
          this.$modal.msgError('请先查询并确认推广人')
          return
        }
        this.formLoading = true
        try {
          await updateBindUser({
            id: this.formData.id,
            bindUserId: this.formData.bindUserId
          })
          this.$modal.msgSuccess('修改成功')
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    resetForm() {
      this.formData = {
        id: undefined,
        bindUserId: undefined
      }
      this.bindUser = undefined
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    sameUser(firstId, secondId) {
      if (firstId === undefined || firstId === null || firstId === '') return false
      if (secondId === undefined || secondId === null || secondId === '') return false
      return String(firstId) === String(secondId)
    },
    async handleGetUser() {
      const bindUserId = this.formData.bindUserId
      if (bindUserId === undefined || bindUserId === null || bindUserId === '') {
        this.$modal.msgWarning('请先输入推广员编号后重试！！！')
        return
      }
      if (this.sameUser(bindUserId, this.formData.id)) {
        this.$modal.msgError('不能绑定自己为推广人')
        return
      }
      this.formLoading = true
      this.bindUser = undefined
      try {
        const response = await getBrokerageUser(bindUserId)
        this.bindUser = response.data
        if (!this.bindUser) this.$modal.msgWarning('推广员不存在')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
