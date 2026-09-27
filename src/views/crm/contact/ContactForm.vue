<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="800px"
    append-to-body
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="联系人姓名"
          prop="name"
        ><el-input
          v-model="formData.name"
          placeholder="请输入姓名"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="负责人"
          prop="ownerUserId"
        ><el-select
          v-model="formData.ownerUserId"
          :disabled="formType === 'update'"
          filterable
          placeholder="请选择负责人"
          style="width: 100%"
        ><el-option
          v-for="item in userOptions"
          :key="item.id"
          :label="item.nickname || item.username"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="客户名称"
          prop="customerId"
        ><el-select
          v-model="formData.customerId"
          :disabled="formData.customerDefault"
          filterable
          placeholder="请选择客户"
          style="width: 100%"
          @change="handleCustomerChange"
        ><el-option
          v-for="item in customerList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="手机"
          prop="mobile"
        ><el-input
          v-model="formData.mobile"
          placeholder="请输入手机"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="电话"
          prop="telephone"
        ><el-input
          v-model="formData.telephone"
          placeholder="请输入电话"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="邮箱"
          prop="email"
        ><el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="微信"
          prop="wechat"
        ><el-input
          v-model="formData.wechat"
          placeholder="请输入微信"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="QQ"
          prop="qq"
        ><el-input
          v-model="formData.qq"
          placeholder="请输入 QQ"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="职位"
          prop="post"
        ><el-input
          v-model="formData.post"
          placeholder="请输入职位"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="关键决策人"
          prop="master"
        ><el-radio-group v-model="formData.master"><el-radio
          v-for="item in boolDictDatas"
          :key="String(item.value)"
          :label="toBoolean(item.value)"
        >{{ item.label }}</el-radio></el-radio-group></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="性别"
          prop="sex"
        ><el-select
          v-model="formData.sex"
          clearable
          placeholder="请选择"
          style="width: 100%"
        ><el-option
          v-for="item in sexDictDatas"
          :key="item.value"
          :label="item.label"
          :value="toNumber(item.value)"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="直属上级"
          prop="parentId"
        ><el-select
          v-model="formData.parentId"
          :disabled="!formData.customerId"
          clearable
          placeholder="请选择直属上级"
          style="width: 100%"
        ><el-option
          v-for="item in contactList"
          :key="item.id"
          :disabled="item.id === formData.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="地址"
          prop="areaId"
        ><el-cascader
          v-model="formData.areaId"
          :options="areaList"
          :props="areaProps"
          clearable
          filterable
          placeholder="请选择城市"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="详细地址"
          prop="detailAddress"
        ><el-input
          v-model="formData.detailAddress"
          placeholder="请输入详细地址"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="下次联系时间"
          prop="contactNextTime"
        ><el-date-picker
          v-model="formData.contactNextTime"
          type="datetime"
          value-format="timestamp"
          placeholder="选择下次联系时间"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      type="primary"
      :loading="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as ContactApi from '@/api/crm/contact'
import * as CustomerApi from '@/api/crm/customer'
import { getSimpleUserList } from '@/api/system/user'
import { getAreaTree } from '@/api/system/area'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

const blank = () => ({ id: undefined, name: undefined, customerId: undefined, contactNextTime: undefined, ownerUserId: undefined, mobile: undefined, telephone: undefined, qq: undefined, wechat: undefined, email: undefined, areaId: undefined, detailAddress: undefined, sex: undefined, master: false, post: undefined, parentId: undefined, remark: undefined, businessId: undefined, customerDefault: false })

export default {
  name: 'CrmContactForm',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: blank(),
      userOptions: [],
      customerList: [],
      contactList: [],
      areaList: [],
      areaProps: { value: 'id', label: 'name', children: 'children', emitPath: false },
      rules: {
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    boolDictDatas() { return getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING) },
    sexDictDatas() { return getDictDatas(DICT_TYPE.SYSTEM_USER_SEX) }
  },
  methods: {
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    toBoolean(value) { return value === true || value === 'true' || value === '1' || value === 1 },
    async getContactList() {
      if (!this.formData.customerId) { this.contactList = []; return }
      this.contactList = (await ContactApi.getContactListByCustomer(this.formData.customerId)).data
    },
    async handleCustomerChange() { this.formData.parentId = undefined; await this.getContactList() },
    async open(type, id, customerId, businessId) {
      this.visible = true
      this.formType = type
      this.title = type === 'update' ? '修改联系人' : '新增联系人'
      this.formData = blank()
      this.loading = true
      try {
        const requests = [getSimpleUserList(), CustomerApi.getCustomerSimpleList(), getAreaTree()]
        if (type === 'update' && id !== undefined) requests.push(ContactApi.getContact(id))
        const result = await Promise.all(requests)
        this.userOptions = (result[0]).data
        this.customerList = (result[1]).data
        this.areaList = (result[2]).data
        if (type === 'update' && result[3]) this.formData = Object.assign(blank(), (result[3]).data)
        if (customerId !== undefined && type === 'create') { this.formData.customerId = customerId; this.formData.customerDefault = true }
        if (businessId !== undefined) this.formData.businessId = businessId
        await this.getContactList()
        if (type === 'create') this.formData.ownerUserId = this.$store.getters.userId
      } finally { this.loading = false }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'update' ? ContactApi.updateContact : ContactApi.createContact
        action(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.visible = false
          this.$emit('success')
        }).finally(() => { this.loading = false })
      })
    },
    resetForm() {
      this.formData = blank(); this.userOptions = []; this.customerList = []; this.contactList = []; this.areaList = []
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
