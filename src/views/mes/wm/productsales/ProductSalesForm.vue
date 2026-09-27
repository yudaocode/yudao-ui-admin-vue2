<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="960px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="出库单编号"
            prop="code"
          >
            <el-input
              v-model="formData.code"
              placeholder="请输入出库单编号"
              :disabled="isHeaderReadonly"
            >
              <el-button
                slot="append"
                @click="generateCode"
              >生成</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="出库单名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="请输入出库单名称"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="发货通知单"
            prop="noticeId"
          >
            <ProductSalesNoticeSelect
              v-model="formData.noticeId"
              :disabled="isHeaderReadonly"
              :status="MesWmSalesNoticeStatusEnum.APPROVED"
              @change="handleNoticeChange"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="销售订单编号"
            prop="salesOrderCode"
          >
            <el-input
              v-model="formData.salesOrderCode"
              placeholder="请输入销售订单编号"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="出库日期"
            prop="salesDate"
          >
            <el-date-picker
              v-model="formData.salesDate"
              type="date"
              value-format="timestamp"
              placeholder="请选择出库日期"
              style="width: 100%"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="客户"
            prop="clientId"
          >
            <MdClientSelect
              v-model="formData.clientId"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            label="收货人"
            prop="contactName"
          >
            <el-input
              v-model="formData.contactName"
              placeholder="请输入收货人"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="联系方式"
            prop="contactTelephone"
          >
            <el-input
              v-model="formData.contactTelephone"
              placeholder="请输入联系方式"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="收货地址"
            prop="contactAddress"
          >
            <el-input
              v-model="formData.contactAddress"
              placeholder="请输入收货地址"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="formData.remark"
              type="textarea"
              placeholder="请输入备注"
              :disabled="isHeaderReadonly"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <template v-if="isShipping || isDetail || formData.carrier || formData.shippingNumber">
        <el-divider content-position="left">运输信息</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="承运商"
              prop="carrier"
            >
              <el-input
                v-model="formData.carrier"
                placeholder="请输入承运商"
                :disabled="!isShipping && isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="运输单号"
              prop="shippingNumber"
            >
              <el-input
                v-model="formData.shippingNumber"
                placeholder="请输入运输单号"
                :disabled="!isShipping && isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>
    <template v-if="formData.id">
      <el-divider content-position="center">物料信息</el-divider>
      <ProductSalesLineList
        :sales-id="formData.id"
        :notice-id="formData.noticeId"
        :form-type="formType"
      />
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        v-if="isUpdate"
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >保 存</el-button>
      <el-button
        v-if="isUpdate && formData.status === MesWmProductSalesStatusEnum.PREPARE"
        type="warning"
        :disabled="formLoading"
        @click="handleSubmit"
      >提 交</el-button>
      <el-button
        v-if="isPick"
        type="primary"
        :disabled="formLoading"
        @click="handleStock"
      >执行拣货</el-button>
      <el-button
        v-if="isShipping"
        type="primary"
        :disabled="formLoading"
        @click="handleShipping"
      >确认填写</el-button>
      <el-button
        v-if="isFinish"
        type="primary"
        :disabled="formLoading"
        @click="handleFinish"
      >确认出库</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { WmProductSalesApi } from '@/api/mes/wm/productsales'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import {
  MesAutoCodeRuleCode,
  MesWmProductSalesStatusEnum,
  MesWmSalesNoticeStatusEnum
} from '@/views/mes/utils/constants'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import ProductSalesNoticeSelect from './components/ProductSalesNoticeSelect.vue'
import ProductSalesLineList from './ProductSalesLineList.vue'

function defaultFormData() {
  return {
    id: undefined,
    code: undefined,
    name: undefined,
    status: undefined,
    clientId: undefined,
    noticeId: undefined,
    salesOrderCode: undefined,
    salesDate: undefined,
    contactName: undefined,
    contactTelephone: undefined,
    contactAddress: undefined,
    carrier: undefined,
    shippingNumber: undefined,
    remark: undefined
  }
}

export default {
  name: 'ProductSalesForm',
  components: { MdClientSelect, ProductSalesNoticeSelect, ProductSalesLineList },
  data() {
    return {
      MesWmProductSalesStatusEnum,
      MesWmSalesNoticeStatusEnum,
      dialogVisible: false,
      formLoading: false,
      formType: 'create',
      formData: defaultFormData(),
      originalFormData: '',
      formRules: {
        code: [{ required: true, message: '出库单编号不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '出库单名称不能为空', trigger: 'blur' }],
        salesDate: [{ required: true, message: '出库日期不能为空', trigger: 'change' }],
        clientId: [{ required: true, message: '客户不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isUpdate() { return ['create', 'update'].includes(this.formType) },
    isPick() { return this.formType === 'stock' },
    isShipping() { return this.formType === 'shipping' },
    isFinish() { return this.formType === 'finish' },
    isDetail() { return this.formType === 'detail' },
    isHeaderReadonly() { return ['stock', 'shipping', 'finish', 'detail'].includes(this.formType) },
    dialogTitle() {
      const titles = {
        create: '新增销售出库单',
        update: '编辑销售出库单',
        stock: '执行拣货',
        shipping: '填写运单',
        finish: '执行出库',
        detail: '销售出库单详情'
      }
      return titles[this.formType] || this.formType
    }
  },
  methods: {
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_PRODUCT_SALES_CODE)
      this.formData.code = response.data
    },
    handleNoticeChange(notice) {
      if (!notice) return
      this.formData.salesOrderCode = notice.salesOrderCode
      this.formData.clientId = notice.clientId
      this.formData.contactName = notice.recipientName
      this.formData.contactTelephone = notice.recipientTelephone
      this.formData.contactAddress = notice.recipientAddress
    },
    resetForm() {
      this.formData = defaultFormData()
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await WmProductSalesApi.getProductSales(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
      this.originalFormData = JSON.stringify(this.formData)
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          const response = await WmProductSalesApi.createProductSales(this.formData)
          this.$modal.msgSuccess('新增成功')
          this.formData.id = response.data
          this.formData.status = MesWmProductSalesStatusEnum.PREPARE
          this.formType = 'update'
        } else {
          await WmProductSalesApi.updateProductSales(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.originalFormData = JSON.stringify(this.formData)
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    async handleSubmit() {
      await this.$refs.form.validate()
      try {
        await this.$modal.confirm('确认提交该销售出库单？【提交后将不能修改】')
        this.formLoading = true
        if (JSON.stringify(this.formData) !== this.originalFormData) {
          await WmProductSalesApi.updateProductSales(this.formData)
        }
        await WmProductSalesApi.submitProductSales(this.formData.id)
        this.$modal.msgSuccess('提交成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        // 与 Vue3 一致：确认取消或操作失败不追加提示
      } finally {
        this.formLoading = false
      }
    },
    async handleStock() {
      try {
        this.formLoading = true
        const response = await WmProductSalesApi.checkProductSalesQuantity(this.formData.id)
        if (!response.data) {
          await this.$modal.confirm('出库数量与拣货数量不一致，确认执行拣货？')
        }
        await WmProductSalesApi.stockProductSales(this.formData.id)
        this.$modal.msgSuccess('拣货成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        // 与 Vue3 一致：确认取消或操作失败不追加提示
      } finally {
        this.formLoading = false
      }
    },
    async handleShipping() {
      try {
        await this.$modal.confirm('确认提交运单信息？')
        this.formLoading = true
        await WmProductSalesApi.shippingProductSales({
          id: this.formData.id,
          carrier: this.formData.carrier,
          shippingNumber: this.formData.shippingNumber
        })
        this.$modal.msgSuccess('运单信息填写成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        // 与 Vue3 一致：确认取消或操作失败不追加提示
      } finally {
        this.formLoading = false
      }
    },
    async handleFinish() {
      try {
        await this.$modal.confirm('确认执行出库？执行后将扣减库存。')
        this.formLoading = true
        await WmProductSalesApi.finishProductSales(this.formData.id)
        this.$modal.msgSuccess('出库成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        // 与 Vue3 一致：确认取消或操作失败不追加提示
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>
