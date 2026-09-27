<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="收文类型" prop="receiveType">
            <el-select
              v-model="formData.receiveType"
              placeholder="请选择收文类型"
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="dict in receiveTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 关联发文信息 -->
        <template v-if="formData.sendId">
          <el-col :span="12">
            <el-form-item label="发文单位">
              <el-input :value="formData.sendDeptName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发文日期">
              <el-input
                :value="formData.issueTime ? formatDate(formData.issueTime, 'YYYY-MM-DD') : ''"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="签发人">
              <el-input :value="formData.signerName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公开类别">
              <el-select v-model="formData.disclosureType" disabled style="width: 100%">
                <el-option
                  v-for="dict in publicCategoryOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="12">
          <el-form-item label="来文字号" prop="documentNo">
            <el-input v-model="formData.documentNo" placeholder="请输入来文字号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公文标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入公文标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密级" prop="secrecyLevel">
            <el-select v-model="formData.secrecyLevel" style="width: 100%">
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
            <el-select v-model="formData.urgencyLevel" style="width: 100%">
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
          <el-form-item label="收文日期" prop="receiveTime">
            <el-date-picker
              v-model="formData.receiveTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择收文日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收文部门" prop="receiveDeptId">
            <dept-select
              v-model="formData.receiveDeptId"
              :disabled="!formData.sendId"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="主办人" prop="handlerUserId">
            <user-select v-model="formData.handlerUserId" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="领导批示" prop="instruction">
            <el-input
              v-model="formData.instruction"
              placeholder="请输入领导批示"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="办理结果" prop="result">
            <el-input
              v-model="formData.result"
              placeholder="请输入办理结果"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="办理期限" prop="deadlineTime">
            <el-date-picker
              v-model="formData.deadlineTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择办理期限"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="内容摘要" prop="summary">
            <el-input
              v-model="formData.summary"
              placeholder="请输入内容摘要"
              type="textarea"
              :rows="3"
            />
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
        <el-col :span="24">
          <el-form-item label="附件" prop="fileUrls">
            <upload-file
              v-model="formData.fileUrls"
              :limit="10"
              :disabled="!!formData.sendId"
              :is-show-tip="!formData.sendId"
            />
          </el-form-item>
        </el-col>
        <!-- 正式公文 -->
        <el-col :span="24">
          <el-form-item label="正式公文" prop="formalFileUrl">
            <upload-file
              v-model="formData.formalFileUrl"
              :limit="1"
              :disabled="!!formData.sendId"
              :is-show-tip="!formData.sendId"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as ReceiveApi from '@/api/oa/officialdoc/receive'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import Dialog from '@/components/Dialog'
import { formatDate } from '@/utils/formatTime'

function createDefaultForm() {
  return {
    id: undefined,
    title: '',
    documentNo: '',
    receiveType: 0,
    receiveTime: formatDate(new Date()),
    receiveDeptId: undefined,
    handlerUserId: undefined,
    secrecyLevel: 0,
    urgencyLevel: 0,
    disclosureType: undefined,
    instruction: '',
    result: '',
    deadlineTime: undefined,
    summary: '',
    remark: '',
    fileUrls: [],
    formalFileUrl: ''
  }
}

export default {
  name: 'OaOfficialDocReceiveForm',
  components: { Dialog, DeptSelect, UserSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        title: [{ required: true, message: '公文标题不能为空', trigger: 'blur' }],
        secrecyLevel: [{ required: true, message: '密级不能为空', trigger: 'change' }],
        urgencyLevel: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
        receiveType: [{ required: true, message: '收文类型不能为空', trigger: 'change' }],
        receiveTime: [{ required: true, message: '收文日期不能为空', trigger: 'change' }],
        receiveDeptId: [{ required: true, message: '收文部门不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    receiveTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_RECEIVE_TYPE)
    },
    publicCategoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_PUBLIC_CATEGORY)
    },
    secretLevelOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_SECRET_LEVEL)
    },
    urgencyLevelOptions() {
      return getIntDictOptions(DICT_TYPE.OA_OFFICIAL_DOC_URGENCY_LEVEL)
    }
  },
  methods: {
    formatDate,
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增公文收文' : '修改公文收文'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        ReceiveApi.getReceive(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
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
        const api = this.formType === 'create' ? ReceiveApi.createReceive : ReceiveApi.updateReceive
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
      const form = createDefaultForm()
      form.receiveDeptId = this.$store.state.user.deptId || undefined
      this.formData = form
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
    }
  }
}
</script>
