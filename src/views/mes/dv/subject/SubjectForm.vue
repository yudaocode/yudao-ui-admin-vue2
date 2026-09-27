<!-- MES 点检保养项目表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入项目编码">
              <el-button slot="append" @click="generateCode">生成</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12"><el-form-item label="项目名称" prop="name"><el-input v-model="formData.name" placeholder="请输入项目名称" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio v-for="dict in subjectTypeOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="项目内容" prop="content"><el-input v-model="formData.content" type="textarea" placeholder="请输入项目内容" /></el-form-item>
      <el-form-item label="标准" prop="standard"><el-input v-model="formData.standard" type="textarea" placeholder="请输入标准" /></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { DvSubjectApi } from '@/api/mes/dv/subject'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'

const COMMON_STATUS = 'common_status'
const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'

export default {
  name: 'SubjectForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultForm(),
      subjectTypeOptions: getIntDictOptions(MES_DV_SUBJECT_TYPE),
      statusOptions: getIntDictOptions(COMMON_STATUS),
      formRules: {
        code: [{ required: true, message: '项目编码不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '项目类型不能为空', trigger: 'change' }],
        content: [{ required: true, message: '项目内容不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, code: undefined, name: undefined, type: undefined, content: undefined, standard: undefined, status: CommonStatusEnum.ENABLE, remark: undefined }
    },
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.DV_SUBJECT_CODE)
      this.formData.code = response.data
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增点检保养项目' : '修改点检保养项目'
      this.formType = type
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          const response = await DvSubjectApi.getSubject(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') {
            await DvSubjectApi.createSubject(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await DvSubjectApi.updateSubject(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
