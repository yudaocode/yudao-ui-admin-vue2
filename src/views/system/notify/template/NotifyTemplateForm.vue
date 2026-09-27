<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
    v-dialogDrag
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-form-item label="模版编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入模版编码" />
      </el-form-item>
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模版名称" />
      </el-form-item>
      <el-form-item label="发件人名称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入发件人名称" />
      </el-form-item>
      <el-form-item label="模板内容" prop="content">
        <el-input v-model="formData.content" type="textarea" placeholder="请输入模板内容" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型">
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="toNumber(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createNotifyTemplate, getNotifyTemplate, updateNotifyTemplate } from '@/api/system/notify/template'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'SystemNotifyTemplateForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        type: [{ required: true, message: '消息类型不能为空', trigger: 'change' }],
        status: [{ required: true, message: '开启状态不能为空', trigger: 'change' }],
        code: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
        nickname: [{ required: true, message: '发件人姓名不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '模板内容不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDictDatas,
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    defaultForm() {
      return {
        id: undefined,
        name: '',
        nickname: '',
        code: '',
        content: '',
        type: undefined,
        params: '',
        status: Number(CommonStatusEnum.ENABLE),
        remark: ''
      }
    },
    /** 打开新增或编辑弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改站内信模板' : '添加站内信模板'
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id === undefined || id === null) return

      this.formLoading = true
      getNotifyTemplate(id)
        .then(response => {
          this.formData = response.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.formData = this.defaultForm()
      this.formType = 'create'
      this.formLoading = false
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const saveRequest = this.formType === 'create'
          ? createNotifyTemplate(this.formData)
          : updateNotifyTemplate(this.formData)
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
.dialog-footer {
  text-align: right;
}
</style>
