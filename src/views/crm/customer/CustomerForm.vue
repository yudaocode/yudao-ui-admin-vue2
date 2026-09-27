<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="760px"
    append-to-body
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
          label="客户名称"
          prop="name"
        ><el-input
          v-model="formData.name"
          placeholder="请输入客户名称"
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
          label="客户来源"
          prop="source"
        ><el-select
          v-model="formData.source"
          clearable
          placeholder="请选择客户来源"
          style="width: 100%"
        ><el-option
          v-for="item in sourceDictDatas"
          :key="item.value"
          :label="item.label"
          :value="toNumber(item.value)"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="客户行业"
          prop="industryId"
        ><el-select
          v-model="formData.industryId"
          clearable
          placeholder="请选择客户行业"
          style="width: 100%"
        ><el-option
          v-for="item in industryDictDatas"
          :key="item.value"
          :label="item.label"
          :value="toNumber(item.value)"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="客户级别"
          prop="level"
        ><el-select
          v-model="formData.level"
          clearable
          placeholder="请选择客户级别"
          style="width: 100%"
        ><el-option
          v-for="item in levelDictDatas"
          :key="item.value"
          :label="item.label"
          :value="toNumber(item.value)"
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
          label="下次联系时间"
          prop="contactNextTime"
        ><el-date-picker
          v-model="formData.contactNextTime"
          type="datetime"
          value-format="timestamp"
          placeholder="选择下次联系时间"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="详细地址"
          prop="detailAddress"
        ><el-input
          v-model="formData.detailAddress"
          placeholder="请输入详细地址"
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
import * as CustomerApi from '@/api/crm/customer'
import { getSimpleUserList } from '@/api/system/user'
import { getAreaTree } from '@/api/system/area'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

const blank = () => ({ id: undefined, name: undefined, contactNextTime: undefined, ownerUserId: undefined, mobile: undefined, telephone: undefined, qq: undefined, wechat: undefined, email: undefined, areaId: undefined, detailAddress: undefined, industryId: undefined, level: undefined, source: undefined, remark: undefined })

export default {
  name: 'CrmCustomerForm',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: blank(),
      userOptions: [],
      areaList: [],
      areaProps: { value: 'id', label: 'name', children: 'children', emitPath: false },
      rules: {
        name: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    sourceDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_SOURCE) },
    industryDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_INDUSTRY) },
    levelDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_LEVEL) }
  },
  methods: {
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    async open(type, id) {
      this.visible = true
      this.formType = type
      this.title = type === 'update' ? '修改客户' : '新增客户'
      this.formData = blank()
      this.userOptions = []
      this.loading = true
      try {
        const requests = [getSimpleUserList(), getAreaTree()]
        if (type === 'update' && id !== undefined) requests.push(CustomerApi.getCustomer(id))
        const result = await Promise.all(requests)
        this.userOptions = (result[0]).data
        this.areaList = (result[1]).data
        if (type === 'update' && result[2]) this.formData = Object.assign(blank(), (result[2]).data)
        if (type === 'create') this.formData.ownerUserId = this.$store.getters.userId
      } finally {
        this.loading = false
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'update' ? CustomerApi.updateCustomer : CustomerApi.createCustomer
        action(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.visible = false
          this.$emit('success')
        }).finally(() => { this.loading = false })
      })
    }
  }
}
</script>
