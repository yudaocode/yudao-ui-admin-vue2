<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="组名" prop="name">
        <el-input v-model="form.name" placeholder="请输入组名" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" placeholder="请输入描述" type="textarea" />
      </el-form-item>
      <el-form-item label="成员" prop="userIds">
        <el-select v-model="form.userIds" multiple filterable placeholder="请选择成员" style="width: 100%">
          <el-option
            v-for="user in userList"
            :key="String(user.id)"
            :label="user.nickname"
            :value="normalizeId(user.id)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="Number(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createUserGroup,
  getUserGroup,
  updateUserGroup
} from '@/api/bpm/userGroup'
import { getSimpleUserList } from '@/api/system/user'
import { CommonStatusEnum } from '@/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    name: undefined,
    description: undefined,
    userIds: [],
    status: CommonStatusEnum.ENABLE
  }
}

/** 可复用的 BPM 用户组表单。 */
export default {
  name: 'UserGroupForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      form: createDefaultForm(),
      userList: [],
      rules: {
        name: [{ required: true, message: '组名不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
        userIds: [{ required: true, message: '成员不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    /** 打开表单并加载编辑详情、可选成员列表。 */
    async open(type, id) {
      if (this.formLoading) {
        return
      }
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'create' ? '添加用户组' : '修改用户组'
      this.resetForm()
      this.dialogVisible = true
      this.formLoading = true
      try {
        const requests = [getSimpleUserList()]
        if (id !== undefined && id !== null) {
          requests.push(getUserGroup(id))
        }
        const responses = await Promise.all(requests)
        this.userList = this.normalizeList(responses[0])
        if (id !== undefined && id !== null) {
          const data = this.normalizeData(responses[1])
          this.form = {
            ...createDefaultForm(),
            ...data,
            userIds: this.normalizeIds(data.userIds),
            status: data.status === undefined || data.status === null
              ? CommonStatusEnum.ENABLE
              : Number(data.status)
          }
        }
      } catch (e) {
        // request 拦截器已统一提示错误，保留弹窗以便用户取消或重试。
      } finally {
        this.formLoading = false
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
    async submitForm() {
      if (this.formLoading) {
        return
      }
      const form = this.$refs.form
      if (!form) {
        return
      }
      const valid = await new Promise(resolve => form.validate(resolve))
      if (!valid) {
        return
      }
      this.formLoading = true
      try {
        const data = {
          ...this.form,
          userIds: this.normalizeIds(this.form.userIds)
        }
        if (this.formType === 'create') {
          await createUserGroup(data)
          this.showSuccess('新增成功')
        } else {
          await updateUserGroup(data)
          this.showSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } catch (e) {
        // request 拦截器已统一展示错误信息。
      } finally {
        this.formLoading = false
      }
    },
    normalizeData(response) {
      return (response && response.data) || {}
    },
    normalizeList(response) {
      const data = response && response.data !== undefined ? response.data : response
      return Array.isArray(data) ? data : []
    },
    normalizeIds(ids) {
      if (!Array.isArray(ids)) {
        return []
      }
      return ids
        .map(id => this.normalizeId(id))
        .filter(id => id !== null)
    },
    // Snowflake IDs exceed JavaScript's safe integer range. Keep those IDs as
    // decimal strings so selection and submission do not silently round them.
    normalizeId(id) {
      if (id === undefined || id === null || String(id).trim() === '') return null
      const text = String(id).trim()
      const number = Number(text)
      if (!Number.isFinite(number)) return null
      return Number.isSafeInteger(number) ? number : text
    },
    showSuccess(message) {
      if (this.$modal && this.$modal.msgSuccess) {
        this.$modal.msgSuccess(message)
      } else if (this.$message) {
        this.$message.success(message)
      }
    },
    resetForm() {
      this.form = createDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    handleClosed() {
      this.formLoading = false
      this.resetForm()
    }
  }
}
</script>
