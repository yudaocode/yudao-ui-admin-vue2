<template>
  <dialog-component :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="印章" prop="sealId">
        <oa-seal-select
          v-if="dialogVisible"
          v-model="formData.sealId"
          :selected-seal="{ id: formData.sealId, no: formData.sealNo, name: formData.sealName }"
          style="width: 100%"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="用印事由" prop="reason">
            <el-input
              v-model="formData.reason"
              placeholder="请输入用印事由"
              type="textarea"
              :rows="2"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用印类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择用印类型" style="width: 100%">
              <el-option
                v-for="dict in typeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用印方式" prop="mode">
            <el-select v-model="formData.mode" placeholder="请选择用印方式" style="width: 100%">
              <el-option
                v-for="dict in modeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="文件标题" prop="documentTitle">
            <el-input
              v-model="formData.documentTitle"
              placeholder="请输入文件标题"
              maxlength="255"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件类型" prop="documentType">
            <el-input v-model="formData.documentType" placeholder="请输入文件类型" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件份数" prop="documentCount">
            <el-input-number
              v-model="formData.documentCount"
              :min="1"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type === OaSealApplyType.CONTRACT" :span="12">
          <el-form-item label="合同金额" prop="contractPrice">
            <el-input-number
              v-model="formData.contractPrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type === OaSealApplyType.CONTRACT" :span="12">
          <el-form-item label="合同对方" prop="contractParty">
            <el-input
              v-model="formData.contractParty"
              placeholder="请输入合同对方"
              maxlength="255"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计用印时间" prop="expectedUseTime">
            <el-date-picker
              v-model="formData.expectedUseTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择预计用印时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.mode === OaSealUseMode.BORROW" :span="12">
          <el-form-item label="预计归还时间" prop="expectedReturnTime">
            <el-date-picker
              v-model="formData.expectedReturnTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择预计归还时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际归还时间" prop="actualReturnTime">
            <el-date-picker
              v-model="formData.actualReturnTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择实际归还时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否紧急" prop="urgent">
            <el-switch v-model="formData.urgent" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :rows="2"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :limit="5" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </dialog-component>
</template>

<script>
import * as SealApplyApi from '@/api/oa/seal/apply'
import OaSealSelect from '@/views/oa/seal/components/OaSealSelect.vue'
import DialogComponent from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OaSealApplyType, OaSealUseMode } from '@/views/oa/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    sealId: undefined,
    fileUrls: [],
    type: OaSealApplyType.CONTRACT,
    mode: OaSealUseMode.ONSITE,
    documentCount: 1,
    urgent: false,
    reason: '',
    documentTitle: '',
    documentType: '',
    contractPrice: undefined,
    contractParty: undefined,
    expectedUseTime: undefined,
    expectedReturnTime: undefined,
    actualReturnTime: undefined,
    remark: ''
  }
}

export default {
  name: 'OaSealApplyForm',
  components: { OaSealSelect, DialogComponent, UploadFile },
  data() {
    return {
      OaSealApplyType,
      OaSealUseMode,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        sealId: [{ required: true, message: '印章不能为空', trigger: 'change' }],
        reason: [{ required: true, message: '用印事由不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '用印类型不能为空', trigger: 'change' }],
        mode: [{ required: true, message: '用印方式不能为空', trigger: 'change' }],
        documentCount: [{ required: true, message: '文件份数不能为空', trigger: 'change' }],
        expectedUseTime: [{ required: true, message: '预计用印时间不能为空', trigger: 'change' }],
        urgent: [{ required: true, message: '是否紧急不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_APPLY_TYPE)
    },
    modeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_USE_MODE)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      const request = id ? SealApplyApi.getSealApply(id).then(response => {
        this.formData = response.data
      }) : Promise.resolve()
      return request.finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? SealApplyApi.createSealApply(this.formData).then(response => {
            this.formData.id = response.data
            this.formType = 'update'
          })
          : SealApplyApi.updateSealApply(this.formData)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
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
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
