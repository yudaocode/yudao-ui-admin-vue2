<template>
  <div>
    <Dialog
      title="添加跟进记录"
      v-model="dialogVisible"
      width="50%"
      @closed="handleClosed"
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="110px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item
              label="跟进类型"
              prop="type"
            >
              <el-select
                v-model="formData.type"
                placeholder="请选择跟进类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in followUpTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="下次联系时间"
              prop="nextTime"
            >
              <el-date-picker
                v-model="formData.nextTime"
                type="datetime"
                value-format="timestamp"
                placeholder="选择下次联系时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="跟进内容"
              prop="content"
            >
              <el-input
                v-model="formData.content"
                :rows="3"
                type="textarea"
                maxlength="5000"
                show-word-limit
                placeholder="请输入跟进内容"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="图片"
              prop="picUrls"
            >
              <image-upload
                v-model="picValue"
                :limit="9"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="附件"
              prop="fileUrls"
            >
              <file-upload
                v-model="fileValue"
                :limit="9"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="isCustomer"
            :span="24"
          >
            <el-form-item
              label="关联联系人"
              prop="contactIds"
            >
              <el-button
                size="small"
                icon="el-icon-plus"
                @click="openContactSelector"
              >
                添加联系人
              </el-button>
              <follow-up-record-contact-form
                v-if="formData.contacts.length > 0"
                class="relation-table"
                :contacts="formData.contacts"
                @remove="removeContact"
              />
              <el-empty
                v-else
                description="暂未关联联系人"
                :image-size="60"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="isCustomer"
            :span="24"
          >
            <el-form-item
              label="关联商机"
              prop="businessIds"
            >
              <el-button
                size="small"
                icon="el-icon-plus"
                @click="openBusinessSelector"
              >
                添加商机
              </el-button>
              <follow-up-record-business-form
                v-if="formData.businesses.length > 0"
                class="relation-table"
                :businesses="formData.businesses"
                @remove="removeBusiness"
              />
              <el-empty
                v-else
                description="暂未关联商机"
                :image-size="60"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          :disabled="formLoading"
          @click="dialogVisible = false"
        >取 消</el-button>
        <el-button
          type="primary"
          :loading="formLoading"
          @click="submitForm"
        >确 定</el-button>
      </div>
    </Dialog>

    <contact-list-modal ref="contactTableSelect" :customer-id="formData.bizId" @success="handleAddContact" />
    <business-list-modal ref="businessTableSelect" :customer-id="formData.bizId" @success="handleAddBusiness" />
  </div>
</template>

<script>
import { FollowUpRecordApi } from '@/api/crm/followup'
import Dialog from '@/components/Dialog'
import ContactListModal from '@/views/crm/contact/components/ContactListModal.vue'
import BusinessListModal from '@/views/crm/business/components/BusinessListModal.vue'
import { BizTypeEnum } from '@/api/crm/permission'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import FollowUpRecordBusinessForm from './components/FollowUpRecordBusinessForm.vue'
import FollowUpRecordContactForm from './components/FollowUpRecordContactForm.vue'

const toUrlArray = value => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value).split(',').map(item => item.trim()).filter(Boolean)
}

const createFormData = () => ({
  bizType: undefined,
  bizId: undefined,
  type: undefined,
  content: '',
  picUrls: [],
  fileUrls: [],
  nextTime: undefined,
  businesses: [],
  contacts: []
})

export default {
  name: 'FollowUpRecordForm',
  components: { Dialog, FollowUpRecordBusinessForm, FollowUpRecordContactForm, ContactListModal, BusinessListModal },
  data() {
    return {
      BizTypeEnum,
      dialogVisible: false,
      formLoading: false,
      formData: createFormData(),
      formRules: {
        type: [{ required: true, message: '跟进类型不能为空', trigger: 'change' }],
        content: [{ required: true, message: '跟进内容不能为空', trigger: 'blur' }],
        nextTime: [{ required: true, message: '下次联系时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isCustomer() {
      return Number(this.formData.bizType) === BizTypeEnum.CRM_CUSTOMER
    },
    followUpTypeOptions() {
      return getIntDictOptions(DICT_TYPE.CRM_FOLLOW_UP_TYPE)
    },
    picValue: {
      get() { return this.formData.picUrls.join(',') },
      set(value) { this.formData.picUrls = toUrlArray(value) }
    },
    fileValue: {
      get() { return this.formData.fileUrls.join(',') },
      set(value) { this.formData.fileUrls = toUrlArray(value) }
    }
  },
  methods: {
    open(bizType, bizId) {
      this.formData = createFormData()
      this.formData.bizType = bizType
      this.formData.bizId = bizId
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid || this.formLoading) return
        this.formLoading = true
        try {
          const data = {
            ...this.formData,
            contactIds: this.formData.contacts.map(item => item.id),
            businessIds: this.formData.businesses.map(item => item.id)
          }
          delete data.contacts
          delete data.businesses
          await FollowUpRecordApi.createFollowUpRecord(data)
          this.$modal.msgSuccess('新增跟进记录成功')
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    openContactSelector() {
      this.$refs.contactTableSelect.open()
    },
    openBusinessSelector() {
      this.$refs.businessTableSelect.open()
    },
    handleAddContact(_contactIds, newContacts) {
      newContacts.forEach(contact => {
        if (!this.formData.contacts.some(item => item.id === contact.id)) {
          this.formData.contacts.push(contact)
        }
      })
    },
    handleAddBusiness(_businessIds, newBusinesses) {
      newBusinesses.forEach(business => {
        if (!this.formData.businesses.some(item => item.id === business.id)) {
          this.formData.businesses.push(business)
        }
      })
    },
    removeContact(index) {
      this.formData.contacts.splice(index, 1)
    },
    removeBusiness(index) {
      this.formData.businesses.splice(index, 1)
    },
    handleClosed() {
      this.formLoading = false
      this.formData = createFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.relation-table { margin-top: 10px; }
</style>
