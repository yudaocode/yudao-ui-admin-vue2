<template>
  <el-dialog
    title="回复"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="回复内容"
        prop="replyContent"
      >
        <el-input
          v-model="form.replyContent"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容"
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
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { replyComment } from '@/api/mall/product/comment'

export default {
  name: 'ProductCommentReplyForm',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        id: undefined,
        replyContent: undefined
      },
      rules: {
        replyContent: [{ required: true, message: '回复内容不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(id) {
      this.reset()
      this.form.id = id
      this.dialogVisible = true
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        replyComment(this.form).then(() => {
          this.$modal.msgSuccess('回复成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.loading = false
        })
      })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        replyContent: undefined
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>
