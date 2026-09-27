<template>
  <el-dialog
    title="编辑我的档案"
    :visible.sync="dialogVisible"
    width="760px"
    append-to-body
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="104px"
    >
      <el-row :gutter="20">
        <el-col
          v-if="isEditable('name')"
          :span="12"
        ><el-form-item
          label="姓名"
          prop="name"
        ><el-input
          v-model="formData.name"
          maxlength="255"
          placeholder="请输入姓名"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('mobile')"
          :span="12"
        ><el-form-item
          label="手机号"
          prop="mobile"
        ><el-input
          v-model="formData.mobile"
          maxlength="11"
          placeholder="请输入手机号"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('email')"
          :span="12"
        ><el-form-item
          label="邮箱"
          prop="email"
        ><el-input
          v-model="formData.email"
          maxlength="255"
          placeholder="请输入邮箱"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('country')"
          :span="12"
        ><el-form-item
          label="国家或地区"
          prop="country"
        ><el-input
          v-model="formData.country"
          maxlength="64"
          placeholder="请输入国家或地区"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('nation')"
          :span="12"
        ><el-form-item
          label="民族"
          prop="nation"
        ><el-input
          v-model="formData.nation"
          maxlength="64"
          placeholder="请输入民族"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('idType')"
          :span="12"
        >
          <el-form-item
            label="证件类型"
            prop="idType"
          >
            <el-select
              v-model="formData.idType"
              clearable
              placeholder="请选择证件类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in idTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="isEditable('idNumber')"
          :span="12"
        ><el-form-item
          label="证件号码"
          prop="idNumber"
        ><el-input
          v-model="formData.idNumber"
          maxlength="255"
          placeholder="请输入证件号码"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('sex')"
          :span="12"
        >
          <el-form-item
            label="性别"
            prop="sex"
          >
            <el-select
              v-model="formData.sex"
              clearable
              placeholder="请选择性别"
              style="width: 100%"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="isEditable('nativePlace')"
          :span="12"
        ><el-form-item
          label="籍贯"
          prop="nativePlace"
        ><el-input
          v-model="formData.nativePlace"
          maxlength="128"
          placeholder="请输入籍贯"
        /></el-form-item></el-col>
        <el-col
          v-if="isEditable('birthday')"
          :span="12"
        >
          <el-form-item
            label="出生时间"
            prop="birthday"
          >
            <el-date-picker
              v-model="formData.birthday"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择出生时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="isEditable('highestEducation')"
          :span="12"
        >
          <el-form-item
            label="最高学历"
            prop="highestEducation"
          >
            <el-select
              v-model="formData.highestEducation"
              clearable
              placeholder="请选择最高学历"
              style="width: 100%"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_EDUCATION)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="isEditable('address')"
          :span="24"
        ><el-form-item
          label="户籍地址"
          prop="address"
        ><el-input
          v-model="formData.address"
          maxlength="255"
          placeholder="请输入户籍地址"
        /></el-form-item></el-col>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { updateEmployee } from '@/api/hrm/portal/employee'
import { HrmEmployeeIdType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmPortalEmployeeForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      formLoading: false,
      editableFields: new Set(),
      formData: {},
      formRules: {
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      },
      idTypeOptions: [
        { label: '身份证', value: HrmEmployeeIdType.ID_CARD },
        { label: '港澳通行证', value: HrmEmployeeIdType.HONG_KONG_MACAO_PASS },
        { label: '台湾通行证', value: HrmEmployeeIdType.TAIWAN_PASS },
        { label: '护照', value: HrmEmployeeIdType.PASSPORT },
        { label: '其他', value: HrmEmployeeIdType.OTHER }
      ]
    }
  },
  methods: {
    getIntDictOptions,
    open(employee, fields) {
      this.editableFields = new Set(fields.filter(field => field.editable).map(field => field.name))
      const candidate = {
        name: employee.name || '',
        mobile: employee.mobile,
        country: employee.country,
        nation: employee.nation,
        idType: employee.idType,
        idNumber: employee.idNumber,
        sex: employee.sex,
        email: employee.email,
        nativePlace: employee.nativePlace,
        birthday: employee.birthday,
        address: employee.address,
        highestEducation: employee.highestEducation
      }
      this.formData = Object.fromEntries(Object.entries(candidate).filter(([name]) => this.editableFields.has(name)))
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    isEditable(name) { return this.editableFields.has(name) },
    async submitForm() {
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        await updateEmployee(this.formData)
        this.$modal.msgSuccess('保存成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
