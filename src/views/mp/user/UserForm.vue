<template>
  <el-dialog title="修改" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="标签" prop="tagIds">
        <el-select v-model="formData.tagIds" clearable multiple placeholder="请选择标签" style="width: 100%">
          <el-option
            v-for="item in tagList"
            :key="item.tagId"
            :label="item.name"
            :value="item.tagId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button :disabled="formLoading" @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as MpTagApi from '@/api/mp/tag'
import * as MpUserApi from '@/api/mp/user'

export default {
  name: 'MpUserForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {},
      tagList: []
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        nickname: undefined,
        remark: undefined,
        tagIds: []
      }
    },

    /** 打开编辑弹窗。 */
    async open(id) {
      this.dialogVisible = true
      this.formData = this.defaultForm()
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })

      if (id !== undefined && id !== null) {
        this.formLoading = true
        try {
          const response = await MpUserApi.getUser(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
      const response = await MpTagApi.getSimpleTagList()
      this.tagList = response.data
    },

    /** 提交修改。 */
    submitForm() {
      if (!this.$refs.formRef) return
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        if (this.formData.id === undefined || this.formData.id === null) {
          this.$modal.msgWarning('缺少粉丝编号，无法修改')
          return
        }
        this.formLoading = true
        MpUserApi.updateUser(this.formData)
          .then(() => {
            this.$modal.msgSuccess('修改成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },

    /** 取消并清理表单。 */
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
    }
  }
}
</script>
