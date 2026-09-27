<template>
  <el-dialog
    title="创建分销员"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-row :gutter="20">
        <el-col
          :span="12"
          :xs="24"
        >
          <el-form-item
            label="分销员"
            prop="userId"
          >
            <el-input
              v-model="formData.userId"
              placeholder="请输入分销员编号"
              @input="clearUserInfo('user')"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="handleGetUser(formData.userId, '分销员')"
              />
            </el-input>
          </el-form-item>
          <el-descriptions
            v-if="userInfo.user"
            :column="1"
            border
          >
            <el-descriptions-item label="头像">
              <el-avatar :src="userInfo.user.avatar" />
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userInfo.user.nickname }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>

        <el-col
          :span="12"
          :xs="24"
        >
          <el-form-item
            label="上级推广人"
            prop="bindUserId"
          >
            <el-input
              v-model="formData.bindUserId"
              placeholder="请输入推广员编号"
              @input="clearUserInfo('bindUser')"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="handleGetUser(formData.bindUserId, '推广员')"
              />
            </el-input>
          </el-form-item>
          <el-descriptions
            v-if="userInfo.bindUser"
            :column="1"
            border
          >
            <el-descriptions-item label="头像">
              <el-avatar :src="userInfo.bindUser.avatar" />
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userInfo.bindUser.nickname }}
            </el-descriptions-item>
            <el-descriptions-item label="推广资格">
              <el-tag v-if="userInfo.bindUser.brokerageEnabled">有</el-tag>
              <el-tag
                v-else
                type="info"
              >无</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="成为推广员的时间">
              {{ formatDate(userInfo.bindUser.brokerageTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
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
      <el-button
        :disabled="formLoading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createBrokerageUser, getBrokerageUser } from '@/api/mall/trade/brokerage/user'
import { getUser } from '@/api/member/user'
import { formatDate } from '@/utils'

export default {
  name: 'BrokerageUserCreateForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: {
        userId: undefined,
        bindUserId: undefined
      },
      formRules: {
        userId: [{ required: true, message: '分销员不能为空', trigger: 'blur' }],
        bindUserId: [{ required: true, message: '推广人不能为空', trigger: 'blur' }]
      },
      userInfo: {
        bindUser: undefined,
        user: undefined
      }
    }
  },
  methods: {
    formatDate,
    open() {
      this.resetForm()
      this.dialogVisible = true
    },
    submitForm() {
      if (this.formLoading || !this.$refs.form) return
      this.$refs.form.validate(async valid => {
        if (!valid) return
        if (this.sameUser(this.formData.userId, this.formData.bindUserId)) {
          this.$modal.msgError('不能绑定自己为推广人')
          return
        }
        this.formLoading = true
        try {
          await createBrokerageUser({
            userId: this.formData.userId,
            bindUserId: this.formData.bindUserId
          })
          this.$modal.msgSuccess('新增成功')
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    resetForm() {
      this.formData = {
        userId: undefined,
        bindUserId: undefined
      }
      this.userInfo = {
        bindUser: undefined,
        user: undefined
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    clearUserInfo(type) {
      this.userInfo[type] = undefined
    },
    sameUser(firstId, secondId) {
      if (firstId === undefined || firstId === null || firstId === '') return false
      if (secondId === undefined || secondId === null || secondId === '') return false
      return String(firstId) === String(secondId)
    },
    async handleGetUser(id, userType) {
      if (id === undefined || id === null || id === '') {
        this.$modal.msgWarning(`请先输入${userType}编号后重试！！！`)
        return
      }
      if (userType === '推广员' && this.sameUser(this.formData.bindUserId, this.formData.userId)) {
        this.$modal.msgError('不能绑定自己为推广人')
        return
      }
      const infoKey = userType === '推广员' ? 'bindUser' : 'user'
      this.userInfo[infoKey] = undefined
      this.formLoading = true
      try {
        const response = userType === '推广员'
          ? await getBrokerageUser(id)
          : await getUser(id)
        const user = response.data
        this.userInfo[infoKey] = user || undefined
        if (!user) this.$modal.msgWarning(`${userType}不存在`)
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
