<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="任务名称" prop="name"><el-input v-model="formData.name" placeholder="请输入任务名称" /></el-form-item>
      <el-form-item label="处理器的名字" prop="handlerName"><el-input v-model="formData.handlerName" :readonly="formData.id !== undefined" placeholder="请输入处理器的名字" /></el-form-item>
      <el-form-item label="处理器的参数" prop="handlerParam"><el-input v-model="formData.handlerParam" placeholder="请输入处理器的参数" /></el-form-item>
      <el-form-item label="CRON 表达式" prop="cronExpression">
        <el-input v-model="formData.cronExpression" placeholder="请输入 CRON 表达式">
          <template slot="append"><el-button type="primary" @click="showCron">生成表达式 <i class="el-icon-time el-icon--right" /></el-button></template>
        </el-input>
      </el-form-item>
      <el-form-item label="重试次数" prop="retryCount"><el-input v-model="formData.retryCount" placeholder="请输入重试次数。设置为 0 时，不进行重试" /></el-form-item>
      <el-form-item label="重试间隔" prop="retryInterval"><el-input v-model="formData.retryInterval" placeholder="请输入重试间隔，单位：毫秒。设置为 0 时，无需间隔" /></el-form-item>
      <el-form-item label="监控超时时间" prop="monitorTimeout"><el-input v-model="formData.monitorTimeout" placeholder="请输入监控超时时间，单位：毫秒" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
    <el-dialog title="Cron 表达式生成器" :visible.sync="cronVisible" append-to-body width="800px" destroy-on-close>
      <crontab :expression="expression" @fill="crontabFill" @hide="cronVisible = false" />
    </el-dialog>
  </el-dialog>
</template>

<script>
import Crontab from '@/components/Crontab'
import { createJob, getJob, updateJob } from '@/api/infra/job'

export default {
  name: 'InfraJobForm',
  components: { Crontab },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      cronVisible: false,
      expression: '',
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
        handlerName: [{ required: true, message: '处理器的名字不能为空', trigger: 'blur' }],
        cronExpression: [{ required: true, message: 'CRON 表达式不能为空', trigger: 'blur' }],
        retryCount: [{ required: true, message: '重试次数不能为空', trigger: 'blur' }],
        retryInterval: [{ required: true, message: '重试间隔不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return { id: undefined, name: '', handlerName: '', handlerParam: '', cronExpression: '', retryCount: undefined, retryInterval: undefined, monitorTimeout: undefined }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改任务' : '添加任务'
      this.formData = this.defaultForm()
      this.cronVisible = false
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        return getJob(id).then(response => { this.formData = response.data }).finally(() => { this.formLoading = false })
      }
    },
    showCron() {
      this.expression = this.formData.cronExpression || ''
      this.cronVisible = true
    },
    crontabFill(value) {
      this.formData.cronExpression = value
      this.cronVisible = false
    },
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create' ? createJob(this.formData) : updateJob(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.formLoading = false })
      })
    }
  }
}
</script>
