<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%">
    <div class="send-form-body">
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="110px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="套红模板" prop="templateId">
              <oa-official-doc-template-select
                v-model="formData.templateId"
                style="width: 100%"
                @change="handleTemplateChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字号" prop="noPrefix">
              <el-input v-model="formData.noPrefix" placeholder="请输入字号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年份" prop="year">
              <el-input-number v-model="formData.year" :min="1" :max="9999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="第几号文" prop="sequence">
              <el-input-number v-model="formData.sequence" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密级" prop="secrecyLevel">
              <el-select v-model="formData.secrecyLevel" placeholder="请选择密级" style="width: 100%">
                <el-option
                  v-for="dict in secretLevelOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="urgencyLevel">
              <el-select v-model="formData.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%">
                <el-option
                  v-for="dict in urgencyLevelOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公开类别" prop="disclosureType">
              <el-select v-model="formData.disclosureType" placeholder="请选择公开类别" style="width: 100%">
                <el-option
                  v-for="dict in publicCategoryOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发文日期" prop="issueTime">
              <el-date-picker
                v-model="formData.issueTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择发文日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发文部门" prop="sendDeptId">
              <dept-select v-model="formData.sendDeptId" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主送部门" prop="mainDeptIds">
              <dept-select v-model="formData.mainDeptIds" multiple style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="抄送部门" prop="copyDeptIds">
              <dept-select v-model="formData.copyDeptIds" multiple style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="签发人">
              <el-input :value="formData.signerName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="附注" prop="remark">
              <el-input
                v-model="formData.remark"
                placeholder="请输入附注"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="公文内容" prop="content">
              <editor v-model="formData.content" height="320px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="附件" prop="fileUrls">
              <upload-file v-model="formData.fileUrls" :limit="10" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="正式公文" prop="formalFileUrl">
              <upload-file v-model="formData.formalFileUrl" :limit="1" :file-type="['pdf']" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- 随表单内容实时更新套红预览 -->
      <div class="send-form-preview">
        <oa-official-doc-preview :document="formData" :template="selectedTemplate" />
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as SendApi from '@/api/oa/officialdoc/send'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as TemplateApi from '@/api/oa/officialdoc/template'
import { formatDate } from '@/utils/formatTime'
import OaOfficialDocTemplateSelect from '../template/components/OaOfficialDocTemplateSelect.vue'
import OaOfficialDocPreview from '../components/OaOfficialDocPreview.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'

function createDefaultForm() {
  return {
    id: undefined,
    templateId: undefined,
    title: undefined,
    noPrefix: undefined,
    year: new Date().getFullYear(),
    sequence: undefined,
    secrecyLevel: 0,
    urgencyLevel: 0,
    disclosureType: 0,
    issueTime: formatDate(new Date()),
    sendDeptId: undefined,
    mainDeptIds: [],
    copyDeptIds: [],
    content: '',
    fileUrls: [],
    formalFileUrl: '',
    signerUserId: undefined,
    signerName: undefined,
    remark: undefined
  }
}

export default {
  name: 'OaOfficialDocSendForm',
  components: { Dialog, OaOfficialDocTemplateSelect, OaOfficialDocPreview, DeptSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      selectedTemplate: undefined,
      formRules: {
        templateId: [{ required: true, message: '套红模板不能为空', trigger: 'change' }],
        title: [{ required: true, message: '公文标题不能为空', trigger: 'blur' }],
        secrecyLevel: [{ required: true, message: '密级不能为空', trigger: 'change' }],
        urgencyLevel: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
        disclosureType: [{ required: true, message: '公开类别不能为空', trigger: 'change' }],
        issueTime: [{ required: true, message: '发文日期不能为空', trigger: 'change' }],
        sendDeptId: [{ required: true, message: '发文部门不能为空', trigger: 'change' }],
        mainDeptIds: [{ required: true, message: '主送部门不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    secretLevelOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_SECRET_LEVEL)
    },
    urgencyLevelOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_URGENCY_LEVEL)
    },
    publicCategoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_PUBLIC_CATEGORY)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增公文发文' : '修改公文发文'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      const tasks = []
      if (id) {
        tasks.push(SendApi.getSend(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
          if (this.formData.templateId) {
            return TemplateApi.getTemplate(this.formData.templateId).then(res => {
              this.selectedTemplate = res.data
            })
          }
        }))
      }
      Promise.all(tasks).finally(() => {
        this.formLoading = false
      })
    },
    // 保存草稿，提交审批由列表单独操作
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const api = this.formType === 'create' ? SendApi.createSend : SendApi.updateSend
        api(this.formData).then(response => {
          if (this.formType === 'create') {
            this.formData.id = response.data
            this.formType = 'update'
          }
          this.$modal.msgSuccess('保存成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.selectedTemplate = undefined
      const form = createDefaultForm()
      form.sendDeptId = this.$store.state.user.deptId
      this.formData = form
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
    },
    // 切换套红模板
    handleTemplateChange(templateId) {
      this.selectedTemplate = undefined
      this.formData.noPrefix = undefined
      if (!templateId) {
        return
      }
      this.formLoading = true
      TemplateApi.getTemplate(templateId).then(response => {
        this.selectedTemplate = response.data
        this.formData.noPrefix = response.data.noPrefix
      }).finally(() => {
        this.formLoading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.send-form-body {
  display: flex;
  gap: 20px;

  .el-form {
    flex: 1;
    min-width: 0;
  }

  .send-form-preview {
    flex: 1;
    min-width: 0;
    max-height: 640px;
    overflow: auto;
    border: 1px solid #e4e7ed;
  }
}
</style>
