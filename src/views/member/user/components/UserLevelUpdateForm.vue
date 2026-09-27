<template>
  <el-dialog title="修改用户等级" :visible.sync="dialogVisible" width="600px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="用户编号"><el-input v-model="formData.id" disabled /></el-form-item>
      <el-form-item label="用户昵称"><el-input v-model="formData.nickname" disabled /></el-form-item>
      <el-form-item label="用户等级" prop="levelId"><member-level-select v-model="formData.levelId" /></el-form-item>
      <el-form-item label="修改原因" prop="reason"><el-input v-model="formData.reason" type="textarea" placeholder="请输入修改原因" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as UserApi from '@/api/member/user'
import MemberLevelSelect from '@/views/member/level/components/MemberLevelSelect.vue'

const blank = () => ({ id: undefined, nickname: undefined, levelId: undefined, reason: undefined })
export default {
  name: 'UserLevelUpdateForm',
  components: { MemberLevelSelect },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: blank(),
      formRules: { reason: [{ required: true, message: '修改原因不能为空', trigger: 'blur' }] }
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.formData = blank()
      if (id === undefined || id === null) return
      this.formLoading = true
      UserApi.getUser(id).then(response => {
        this.formData = {
          id: response.data.id,
          nickname: response.data.nickname,
          levelId: undefined,
          reason: undefined
        }
      }).finally(() => { this.formLoading = false })
    },
    cancel() {
      this.dialogVisible = false
      this.formData = blank()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const data = { id: this.formData.id, levelId: this.formData.levelId, reason: this.formData.reason }
        UserApi.updateUserLevel(data).then(() => {
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.formLoading = false })
      })
    }
  }
}
</script>

<style scoped>.dialog-footer { text-align: right; }</style>
