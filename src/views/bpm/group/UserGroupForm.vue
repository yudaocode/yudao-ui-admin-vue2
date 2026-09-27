<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
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
      <el-form-item label="描述">
        <el-input v-model="form.description" placeholder="请输入描述" type="textarea" />
      </el-form-item>
      <el-form-item label="成员" prop="userIds">
        <el-select v-model="form.userIds" multiple filterable placeholder="请选择成员" style="width: 100%">
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
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
      <el-button type="primary" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
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
    userIds: undefined,
    status: CommonStatusEnum.ENABLE
  }
}

/** 可复用的 BPM 用户组表单。 */
export default {
  name: 'UserGroupForm',
  components: { Dialog },
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
      if (id) {
        this.formLoading = true
        try {
          const response = await getUserGroup(id)
          this.form = response.data
        } finally {
          this.formLoading = false
        }
      }
      const response = await getSimpleUserList()
      this.userList = response.data
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
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
        if (this.formType === 'create') {
          await createUserGroup(this.form)
          this.showSuccess('新增成功')
        } else {
          await updateUserGroup(this.form)
          this.showSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
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
