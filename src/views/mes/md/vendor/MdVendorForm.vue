<!-- MES 供应商表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="960px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px" :disabled="isDetail">
      <el-row>
        <el-col :span="12"><el-form-item label="供应商编码" prop="code"><el-input v-model="formData.code" placeholder="请输入供应商编码"><el-button slot="append" @click="generateCode">生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="供应商名称" prop="name"><el-input v-model="formData.name" placeholder="请输入供应商名称" /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="8"><el-form-item label="供应商简称" prop="nickname"><el-input v-model="formData.nickname" placeholder="请输入供应商简称" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="英文名称" prop="englishName"><el-input v-model="formData.englishName" placeholder="请输入供应商英文名称" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="供应商等级" prop="level"><el-select v-model="formData.level" placeholder="请选择供应商等级" class="full-width"><el-option v-for="dict in vendorLevelOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item></el-col>
      </el-row>
      <el-row><el-col :span="24"><el-form-item label="供应商简介" prop="description"><el-input v-model="formData.description" type="textarea" placeholder="请输入供应商简介" /></el-form-item></el-col></el-row>
      <el-row><el-col :span="24"><el-form-item label="供应商地址" prop="address"><el-input v-model="formData.address" type="textarea" placeholder="请输入供应商地址" /></el-form-item></el-col></el-row>
      <el-row>
        <el-col :span="12"><el-form-item label="官网地址" prop="website"><el-input v-model="formData.website" placeholder="请输入供应商官网地址" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="邮箱地址" prop="email"><el-input v-model="formData.email" placeholder="请输入供应商邮箱地址" /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><el-form-item label="供应商电话" prop="telephone"><el-input v-model="formData.telephone" placeholder="请输入供应商电话" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="供应商评分" prop="score"><el-input-number v-model="formData.score" :min="0" :max="100" class="full-width" /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="8"><el-form-item label="联系人1" prop="contact1Name"><el-input v-model="formData.contact1Name" placeholder="请输入联系人1" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="联系人1-电话" prop="contact1Telephone"><el-input v-model="formData.contact1Telephone" placeholder="请输入联系人1电话" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="联系人1-邮箱" prop="contact1Email"><el-input v-model="formData.contact1Email" placeholder="请输入联系人1邮箱" /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="8"><el-form-item label="联系人2" prop="contact2Name"><el-input v-model="formData.contact2Name" placeholder="请输入联系人2" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="联系人2-电话" prop="contact2Telephone"><el-input v-model="formData.contact2Telephone" placeholder="请输入联系人2电话" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="联系人2-邮箱" prop="contact2Email"><el-input v-model="formData.contact2Email" placeholder="请输入联系人2邮箱" /></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><el-form-item label="社会信用代码" prop="creditCode"><el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="状态" prop="status"><el-radio-group v-model="formData.status"><el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><el-form-item label="供应商 LOGO" prop="logo"><el-input v-model="formData.logo" placeholder="请输入供应商 LOGO 地址" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item></el-col>
      </el-row>
    </el-form>

    <el-tabs v-if="formData.id" v-model="activeTab" class="related-tabs">
      <el-tab-pane label="物料清单" name="itemReceiptLine" lazy><vendor-item-receipt-line-list :vendor-id="formData.id" /></el-tab-pane>
      <el-tab-pane label="采购记录" name="itemReceipt" lazy><vendor-item-receipt-list :vendor-id="formData.id" /></el-tab-pane>
    </el-tabs>

    <span slot="footer"><el-button v-if="!isDetail" type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { MdVendorApi } from '@/api/mes/md/vendor'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import VendorItemReceiptLineList from './VendorItemReceiptLineList.vue'
import VendorItemReceiptList from './VendorItemReceiptList.vue'

const MD_VENDOR_CODE = 'MD_VENDOR_CODE'

export default {
  name: 'MdVendorForm',
  components: { VendorItemReceiptLineList, VendorItemReceiptList },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formType: '',
      activeTab: 'itemReceiptLine',
      formData: this.getDefaultForm(),
      vendorLevelOptions: getStrDictOptions(DICT_TYPE.MES_VENDOR_LEVEL),
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formRules: {
        code: [{ required: true, message: '供应商编码不能为空', trigger: 'blur' }],
        name: [
          { required: true, message: '供应商名称不能为空', trigger: 'blur' },
          { max: 100, message: '供应商名称不能超过 100 个字符', trigger: 'blur' }
        ],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        contact1Email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        contact2Email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return { create: '新增供应商', update: '修改供应商', detail: '查看供应商' }[this.formType] || this.formType
    },
    isDetail() {
      return this.formType === 'detail'
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        nickname: undefined,
        englishName: undefined,
        description: undefined,
        logo: undefined,
        level: undefined,
        score: undefined,
        address: undefined,
        website: undefined,
        email: undefined,
        telephone: undefined,
        contact1Name: undefined,
        contact1Telephone: undefined,
        contact1Email: undefined,
        contact2Name: undefined,
        contact2Telephone: undefined,
        contact2Email: undefined,
        creditCode: undefined,
        status: CommonStatusEnum.ENABLE,
        remark: undefined
      }
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    async generateCode() {
      this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MD_VENDOR_CODE)).data
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.activeTab = 'itemReceiptLine'
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          this.formData = (await MdVendorApi.getVendor(id)).data
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
            await MdVendorApi.createVendor(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await MdVendorApi.updateVendor(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.related-tabs { margin-top: 10px; }
</style>
