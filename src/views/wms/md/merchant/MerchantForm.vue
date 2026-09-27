<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="900px"
    append-to-body
  ><el-form
    ref="form"
    v-loading="loading"
    :model="formData"
    :rules="rules"
    label-width="120px"
  ><el-row :gutter="20"><el-col :span="12"><el-form-item
    label="往来企业编号"
    prop="code"
  ><el-input
    v-model="formData.code"
    maxlength="20"
    placeholder="请输入往来企业编号"
  ><el-button
    slot="append"
    @click="formData.code = generateWmsCode('M')"
  >生成</el-button></el-input></el-form-item></el-col><el-col :span="12"><el-form-item
    label="往来企业名称"
    prop="name"
  ><el-input
    v-model="formData.name"
    maxlength="60"
    placeholder="请输入往来企业名称"
  /></el-form-item></el-col><el-col :span="12"><el-form-item
    label="往来企业类型"
    prop="type"
  ><el-select
    v-model="formData.type"
    placeholder="请选择往来企业类型"
  ><el-option
    v-for="item in merchantTypeDictDatas"
    :key="item.value"
    :label="item.label"
    :value="
      Number(item.value)
    "
  /></el-select></el-form-item></el-col><el-col :span="12"><el-form-item label="级别"><el-input
    v-model="formData.level"
    maxlength="10"
    placeholder="请输入级别"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="开户行"><el-input
    v-model="formData.bankName"
    maxlength="255"
    placeholder="请输入开户行"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="银行账户"><el-input
    v-model="formData.bankAccount"
    maxlength="40"
    placeholder="请输入银行账户"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="地址"><el-input
    v-model="formData.address"
    maxlength="200"
    placeholder="请输入地址"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="联系人"><el-input
    v-model="formData.contact"
    maxlength="30"
    placeholder="请输入联系人"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="手机号"><el-input
    v-model="formData.mobile"
    maxlength="13"
    placeholder="请输入手机号"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="座机号"><el-input
    v-model="formData.telephone"
    maxlength="13"
    placeholder="请输入座机号"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="Email"><el-input
    v-model="formData.email"
    maxlength="50"
    placeholder="请输入 Email"
  /></el-form-item></el-col><el-col :span="12"><el-form-item label="备注"><el-input
    v-model="formData.remark"
    maxlength="255"
    placeholder="请输入备注"
  /></el-form-item></el-col></el-row></el-form><span slot="footer"><el-button
    type="primary"
    :loading="loading"
    @click="submitForm"
  >确 定</el-button><el-button @click="visible = false">取 消</el-button></span></el-dialog>
</template>
<script>
import { MerchantApi } from '@/api/wms/md/merchant'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { generateWmsCode } from '@/views/wms/utils/constants'
export default {
  name: 'WmsMerchantForm',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      merchantTypeDictDatas: getDictDatas(DICT_TYPE.WMS_MERCHANT_TYPE),
      formData: this.getDefaultForm(),
      rules: {
        code: [
          { required: true, message: '往来企业编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '往来企业名称不能为空', trigger: 'blur' }
        ],
        type: [
          {
            required: true,
            message: '往来企业类型不能为空',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    generateWmsCode,
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        type: undefined,
        level: undefined,
        bankName: undefined,
        bankAccount: undefined,
        address: undefined,
        mobile: undefined,
        telephone: undefined,
        contact: undefined,
        email: undefined,
        remark: undefined
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type
      this.title = type === 'create' ? '新增往来企业' : '修改往来企业'
      this.formData = this.getDefaultForm()
      if (id) {
        this.loading = true
        MerchantApi.getMerchant(id)
          .then((response) => {
            this.formData = response.data
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action =
          this.formType === 'create'
            ? MerchantApi.createMerchant
            : MerchantApi.updateMerchant
        action(this.formData)
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === 'create' ? '新增成功' : '修改成功'
            )
            this.visible = false
            this.$emit('success')
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>
