<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="签到天数" prop="day">
        <el-input-number v-model="formData.day" :min="1" :max="7" :precision="0" />
        <span class="day-help">只允许设置 1-7，默认签到 7 天为一个周期</span>
      </el-form-item>
      <el-form-item label="奖励积分" prop="point">
        <el-input-number v-model="formData.point" :min="0" :precision="0" />
      </el-form-item>
      <el-form-item label="奖励经验" prop="experience">
        <el-input-number v-model="formData.experience" :min="0" :precision="0" />
      </el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createSignInConfig,
  getSignInConfig,
  updateSignInConfig
} from '@/api/member/signin/config'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: 'SignInConfigForm',
  data() {
    return {
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.defaultForm(),
      formRules: {
        day: [{ required: true, message: '签到天数不能空', trigger: 'blur' }],
        point: [
          { required: true, message: '奖励积分不能空', trigger: 'blur' },
          { validator: (rule, value, callback) => this.validateAward(rule, value, callback), trigger: 'blur' }
        ],
        experience: [
          { required: true, message: '奖励经验不能空', trigger: 'blur' },
          { validator: (rule, value, callback) => this.validateAward(rule, value, callback), trigger: 'blur' }
        ],
        status: [{ required: true, message: '开启状态不能空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        day: undefined,
        point: 0,
        experience: 0,
        status: CommonStatusEnum.ENABLE
      }
    },
    validateAward(rule, value, callback) {
      if (!Number(this.formData.point || 0) && !Number(this.formData.experience || 0)) {
        callback(new Error('奖励积分与奖励经验至少配置一个'))
      } else {
        callback()
      }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改签到规则' : '添加签到规则'
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        getSignInConfig(id)
          .then(response => {
            this.formData = Object.assign(this.defaultForm(), response.data)
          })
          .finally(() => {
            this.formLoading = false
          })
      }
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const saveRequest = this.formType === 'create'
          ? createSignInConfig(this.formData)
          : updateSignInConfig(this.formData)
        saveRequest
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    }
  }
}
</script>

<style scoped>
.day-help {
  margin-left: 10px;
  color: #f56c6c;
}

.dialog-footer {
  text-align: right;
}
</style>
