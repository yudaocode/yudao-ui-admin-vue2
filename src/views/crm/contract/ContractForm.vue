<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1280px"
    append-to-body
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="合同编号"
            prop="no"
          >
            <el-input
              v-model="formData.no"
              disabled
              placeholder="保存后自动生成"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="合同名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="请输入合同名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="负责人"
            prop="ownerUserId"
          >
            <el-select
              v-model="formData.ownerUserId"
              filterable
              :disabled="formType !== 'create'"
              style="width: 100%"
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.nickname || item.username"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="客户名称"
            prop="customerId"
          >
            <el-select
              v-model="formData.customerId"
              filterable
              clearable
              placeholder="请选择客户"
              style="width: 100%"
              @change="handleCustomerChange"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="商机名称"
            prop="businessId"
          >
            <el-select
              v-model="formData.businessId"
              filterable
              clearable
              placeholder="请选择商机"
              style="width: 100%"
              :disabled="!formData.customerId"
              @change="handleBusinessChange"
            >
              <el-option
                v-for="item in businessOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="客户签约人"
            prop="signContactId"
          >
            <el-select
              v-model="formData.signContactId"
              filterable
              clearable
              placeholder="请选择联系人"
              style="width: 100%"
              :disabled="!formData.customerId"
            >
              <el-option
                v-for="item in contactList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="公司签约人"
            prop="signUserId"
          >
            <el-select
              v-model="formData.signUserId"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.nickname || item.username"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="下单时间"
            prop="orderDate"
          >
            <el-date-picker
              v-model="formData.orderDate"
              type="date"
              value-format="timestamp"
              placeholder="选择下单时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="开始时间"
            prop="startTime"
          >
            <el-date-picker
              v-model="formData.startTime"
              type="date"
              value-format="timestamp"
              placeholder="选择开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="结束时间"
            prop="endTime"
          >
            <el-date-picker
              v-model="formData.endTime"
              type="date"
              value-format="timestamp"
              placeholder="选择结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-tabs
        v-model="subTabName"
        class="contract-sub-tabs"
      >
        <el-tab-pane
          label="产品清单"
          name="product"
        >
          <ContractProductForm
            v-model="formData.products"
            :disabled="formType === 'detail'"
          />
        </el-tab-pane>
      </el-tabs>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="产品总金额">
            <el-input
              :value="formatMoney(formData.totalProductPrice)"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="整单折扣（%）"
            prop="discountPercent"
          >
            <el-input-number
              v-model="formData.discountPercent"
              :min="0"
              :max="100"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="折扣后金额">
            <el-input
              :value="formatMoney(formData.totalPrice)"
              disabled
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
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as ContractApi from '@/api/crm/contract'
import * as CustomerApi from '@/api/crm/customer'
import * as ContactApi from '@/api/crm/contact'
import * as BusinessApi from '@/api/crm/business'
import * as UserApi from '@/api/system/user'
import ContractProductForm from './components/ContractProductForm.vue'

function defaultForm() {
  return {
    id: undefined,
    no: '',
    name: '',
    customerId: undefined,
    businessId: undefined,
    signContactId: undefined,
    signUserId: undefined,
    ownerUserId: undefined,
    orderDate: undefined,
    startTime: undefined,
    endTime: undefined,
    remark: '',
    discountPercent: 0,
    totalProductPrice: 0,
    totalPrice: 0,
    totalReceivablePrice: 0,
    products: []
  }
}

export default {
  name: 'CrmContractForm',
  components: { ContractProductForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      subTabName: 'product',
      formData: defaultForm(),
      userList: [],
      customerList: [],
      contactList: [],
      businessList: [],
      formRules: {
        name: [{ required: true, message: '合同名称不能为空', trigger: 'blur' }],
        customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        signUserId: [{ required: true, message: '公司签约人不能为空', trigger: 'change' }],
        orderDate: [{ required: true, message: '下单时间不能为空', trigger: 'change' }]
      },
      syncingTotals: false
    }
  },
  computed: {
    businessOptions() {
      const customerId = this.formData.customerId
      if (customerId === undefined || customerId === null) return []
      return this.businessList.filter(item => Number(item.customerId) === Number(customerId))
    }
  },
  watch: {
    'formData.products': {
      deep: true,
      handler() {
        this.recalculateTotals()
      }
    },
    'formData.discountPercent': function() {
      this.recalculateTotals()
    }
  },
  methods: {
    formatMoney(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : '-'
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改合同' : '新增合同'
      this.formData = defaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })

      this.formLoading = true
      try {
        const requests = [
          UserApi.getSimpleUserList(),
          CustomerApi.getCustomerSimpleList(),
          BusinessApi.getSimpleBusinessList()
        ]
        if (id !== undefined && id !== null) {
          requests.push(ContractApi.getContract(id))
        }
        const result = await Promise.all(requests)
        this.userList = result[0].data
        this.customerList = result[1].data
        this.businessList = result[2].data
        if (id !== undefined && id !== null) {
          this.formData = Object.assign(defaultForm(), result[3].data)
        }
        if (this.formType === 'create') {
          this.formData.ownerUserId = this.$store.getters.userId
          this.formData.signUserId = this.$store.getters.userId
        }
        if (this.formData.customerId) {
          await this.loadContactList(this.formData.customerId)
        }
        this.recalculateTotals()
      } finally {
        this.formLoading = false
      }
    },
    async handleCustomerChange(customerId) {
      this.formData.signContactId = undefined
      this.formData.businessId = undefined
      this.formData.products = []
      await this.loadContactList(customerId)
    },
    async handleBusinessChange(businessId) {
      if (!businessId) return
      const response = await BusinessApi.getBusiness(businessId)
      const business = response.data
      if (!business || !Array.isArray(business.products)) return
      this.formData.products = business.products.map(item => Object.assign({}, item, { contractPrice: item.businessPrice }))
    },
    async loadContactList(customerId) {
      if (!customerId) {
        this.contactList = []
        return
      }
      const response = await ContactApi.getContactListByCustomer(customerId)
      this.contactList = response.data
    },
    recalculateTotals() {
      if (this.syncingTotals) return
      this.syncingTotals = true
      const products = Array.isArray(this.formData.products) ? this.formData.products : []
      const totalProductPrice = products.reduce((sum, row) => sum + Number(row.totalPrice || 0), 0)
      const discountPercent = Number(this.formData.discountPercent || 0)
      const totalPrice = totalProductPrice * (1 - discountPercent / 100)
      this.formData.totalProductPrice = Number(totalProductPrice.toFixed(2))
      this.formData.totalPrice = Number(totalPrice.toFixed(2))
      this.$nextTick(() => {
        this.syncingTotals = false
      })
    },
    validateProducts() {
      const products = Array.isArray(this.formData.products) ? this.formData.products : []
      for (const row of products) {
        if (!row.productId) {
          this.$modal.msgWarning('请先选择产品')
          return false
        }
        if (row.contractPrice === undefined || row.contractPrice === null) {
          this.$modal.msgWarning('请填写合同价格')
          return false
        }
        if (row.count === undefined || row.count === null) {
          this.$modal.msgWarning('请填写产品数量')
          return false
        }
      }
      return true
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateProducts()) return
        this.formLoading = true
        const action = this.formType === 'update' ? ContractApi.updateContract : ContractApi.createContract
        action(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = defaultForm()
      this.userList = []
      this.customerList = []
      this.contactList = []
      this.businessList = []
    }
  }
}
</script>

<style scoped>
.contract-sub-tabs {
  margin-top: -6px;
  margin-bottom: 8px;
}
</style>
