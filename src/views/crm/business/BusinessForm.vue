<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1280px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item
          label="商机名称"
          prop="name"
        ><el-input
          v-model="formData.name"
          placeholder="请输入商机名称"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="负责人"
          prop="ownerUserId"
        ><el-select
          v-model="formData.ownerUserId"
          :disabled="formType !== 'create'"
          filterable
          style="width: 100%"
        ><el-option
          v-for="item in userOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="客户名称"
          prop="customerId"
        ><el-select
          v-model="formData.customerId"
          :disabled="formData.customerDefault"
          filterable
          placeholder="请选择客户"
          style="width: 100%"
        ><el-option
          v-for="item in customerList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item
          label="商机状态组"
          prop="statusTypeId"
        ><el-select
          v-model="formData.statusTypeId"
          :disabled="formType !== 'create'"
          clearable
          filterable
          placeholder="请选择商机状态组"
          style="width: 100%"
        ><el-option
          v-for="item in statusTypeList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="预计成交日期"
          prop="dealTime"
        ><el-date-picker
          v-model="formData.dealTime"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择预计成交日期"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>
      <el-tabs v-model="subTabsName"><el-tab-pane
        label="产品清单"
        name="product"
      ><business-product-form
        ref="productForm"
        :products="formData.products"
        :disabled="formType === 'detail'"
      /></el-tab-pane></el-tabs>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item label="产品总金额"><el-input
          :value="formatPrice(formData.totalProductPrice)"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="整单折扣（%）"><el-input-number
          v-model="formData.discountPercent"
          :min="0"
          :max="100"
          :precision="2"
          controls-position="right"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="折扣后金额"><el-input
          :value="formatPrice(formData.totalPrice)"
          disabled
        /></el-form-item></el-col>
      </el-row>
    </el-form>
    <div slot="footer"><el-button
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as BusinessApi from '@/api/crm/business'
import * as BusinessStatusApi from '@/api/crm/business/status'
import { getCustomerSimpleList } from '@/api/crm/customer'
import { getSimpleUserList } from '@/api/system/user'
import BusinessProductForm from './components/BusinessProductForm.vue'

export default {
  name: 'CrmBusinessForm',
  components: { BusinessProductForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      subTabsName: 'product',
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '商机名称不能为空', trigger: 'blur' }],
        customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        statusTypeId: [{ required: true, message: '商机状态组不能为空', trigger: 'change' }]
      },
      userOptions: [],
      customerList: [],
      statusTypeList: []
    }
  },
  watch: {
    'formData.products': { deep: true, handler() { this.recalculate() } },
    'formData.discountPercent': 'recalculate'
  },
  methods: {
    defaultForm() {
      return { id: undefined, name: '', customerId: undefined, ownerUserId: undefined, statusTypeId: undefined, dealTime: undefined, discountPercent: 0, totalProductPrice: 0, totalPrice: 0, remark: '', products: [], contactId: undefined, customerDefault: false }
    },
    formatPrice(value) { return value === undefined || value === null ? '0.00' : Number(value).toFixed(2) },
    recalculate() {
      const total = (this.formData.products || []).reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
      this.formData.totalProductPrice = Number(total.toFixed(2))
      this.formData.totalPrice = Number((total * (1 - Number(this.formData.discountPercent || 0) / 100)).toFixed(2))
    },
    open(type, id, customerId, contactId) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改商机' : (this.formType === 'detail' ? '商机详情' : '新增商机')
      this.formData = this.defaultForm()
      if (id !== undefined && id !== null) {
        this.formLoading = true
        BusinessApi.getBusiness(id).then(response => { this.formData = Object.assign(this.defaultForm(), response.data) }).finally(() => { this.formLoading = false })
      } else {
        if (customerId !== undefined && customerId !== null) { this.formData.customerId = customerId; this.formData.customerDefault = true }
        this.formData.contactId = contactId
      }
      return Promise.all([
        getCustomerSimpleList().then(response => { const data = response.data; this.customerList = data }),
        BusinessStatusApi.getBusinessStatusTypeSimpleList().then(response => { const data = response.data; this.statusTypeList = data }),
        getSimpleUserList().then(response => { const data = response.data; this.userOptions = data; if (this.formType === 'create' && this.$store.getters.userId) this.formData.ownerUserId = this.$store.getters.userId })
      ])
    },
    submitForm() {
      if (this.formType === 'detail') return
      this.$refs.form.validate(valid => {
        if (!valid) return
        const productValidation = this.$refs.productForm ? this.$refs.productForm.validate() : Promise.resolve(true)
        Promise.resolve(productValidation).then(ok => {
          if (ok === false) return
          this.formLoading = true
          const action = this.formType === 'create' ? BusinessApi.createBusiness : BusinessApi.updateBusiness
          return action(this.formData).then(() => { this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功'); this.dialogVisible = false; this.$emit('success') }).finally(() => { this.formLoading = false })
        })
      })
    }
  }
}
</script>
