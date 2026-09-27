<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机关/公司名称" prop="authorityName">
            <el-input v-model="formData.authorityName" placeholder="请输入机关/公司名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="名称字号" prop="fontSize">
            <el-input-number v-model="formData.fontSize" :min="18" :max="72" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字号前缀" prop="noPrefix">
            <el-input v-model="formData.noPrefix" placeholder="请输入字号前缀" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="印章图片" prop="sealPicUrl">
            <upload-img v-model="formData.sealPicUrl" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分隔线样式" prop="separatorType">
            <el-select v-model="formData.separatorType" placeholder="请选择分隔线样式" style="width: 100%">
              <el-option
                v-for="dict in separatorTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as TemplateApi from '@/api/oa/officialdoc/template'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { OaOfficialDocSeparatorType } from '@/views/oa/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    name: '',
    authorityName: '',
    fontSize: 36,
    noPrefix: '',
    sealPicUrl: '',
    separatorType: OaOfficialDocSeparatorType.SINGLE,
    status: CommonStatusEnum.ENABLE,
    sort: 0,
    remark: ''
  }
}

export default {
  name: 'OaOfficialDocTemplateForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
        authorityName: [{ required: true, message: '机关/公司名称不能为空', trigger: 'blur' }],
        fontSize: [{ required: true, message: '名称字号不能为空', trigger: 'change' }],
        separatorType: [{ required: true, message: '分隔线样式不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    separatorTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_SEPARATOR_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.COMMON_STATUS)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增套红模板' : '修改套红模板'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        TemplateApi.getTemplate(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const api = this.formType === 'create'
          ? TemplateApi.createTemplate
          : TemplateApi.updateTemplate
        api(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
    }
  }
}
</script>
