<template>
  <el-dialog title="修改用户积分" :visible.sync="dialogVisible" width="600px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="110px">
      <el-form-item label="用户编号"><el-input v-model="formData.id" disabled /></el-form-item>
      <el-form-item label="用户昵称"><el-input v-model="formData.nickname" disabled /></el-form-item>
      <el-form-item label="变动前积分"><el-input-number v-model="formData.point" disabled /></el-form-item>
      <el-form-item label="变动类型" prop="changeType"><el-radio-group v-model="formData.changeType"><el-radio :label="1">增加</el-radio><el-radio :label="-1">减少</el-radio></el-radio-group></el-form-item>
      <el-form-item label="变动积分" prop="changePoint"><el-input-number v-model="formData.changePoint" :min="0" :precision="0" /></el-form-item>
      <el-form-item label="变动后积分"><el-input-number :value="pointResult" disabled /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as UserApi from '@/api/member/user'

const blank = () => ({ id: undefined, nickname: undefined, point: 0, changePoint: 0, changeType: 1 })
export default {
  name: 'UpdatePointForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: blank(),
      formRules: { changePoint: [{ required: true, message: '变动积分不能为空', trigger: 'blur' }] }
    }
  },
  computed: {
    pointResult() {
      return Number(this.formData.point || 0) + Number(this.formData.changePoint || 0) * Number(this.formData.changeType || 1)
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
          point: response.data.point,
          changeType: 1,
          changePoint: 0
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
        if (Number(this.formData.changePoint) < 1) { this.$modal.msgError('变动积分不能小于 1'); return }
        if (this.pointResult < 0) { this.$modal.msgError('变动后的积分不能小于 0'); return }
        this.formLoading = true
        UserApi.updateUserPoint({ id: this.formData.id, point: Number(this.formData.changePoint) * Number(this.formData.changeType) }).then(() => {
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
