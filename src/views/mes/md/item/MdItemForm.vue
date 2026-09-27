<!-- MES 物料产品的新增/修改 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px" :disabled="isDetail">
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="物料编码" prop="code"><el-input v-model="formData.code" placeholder="请输入物料编码"><el-button slot="append" @click="generateCode">生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="物料名称" prop="name"><el-input v-model="formData.name" placeholder="请输入物料名称" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="规格型号" prop="specification"><el-input v-model="formData.specification" placeholder="请输入规格型号" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="单位" prop="unitMeasureId"><md-unit-measure-select v-model="formData.unitMeasureId" placeholder="请选择计量单位" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="物料分类" prop="itemTypeId"><md-item-type-select v-model="formData.itemTypeId" @change="handleItemTypeChange" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="状态" prop="status"><el-radio-group v-model="formData.status" disabled><el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="高值物料" prop="highValue"><el-switch v-model="formData.highValue" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="批次管理" prop="batchFlag"><el-switch v-model="formData.batchFlag" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="安全库存" prop="safeStockFlag"><el-switch v-model="formData.safeStockFlag" /></el-form-item></el-col>
        <el-col v-if="formData.safeStockFlag" :span="8"><el-form-item label="最低库存量" prop="minStock"><el-input-number v-model="formData.minStock" :min="0" :precision="2" controls-position="right" class="full-width" /></el-form-item></el-col>
        <el-col v-if="formData.safeStockFlag" :span="8"><el-form-item label="最高库存量" prop="maxStock"><el-input-number v-model="formData.maxStock" :min="0" :precision="2" controls-position="right" class="full-width" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item></el-col>
      </el-row>
    </el-form>

    <el-tabs v-if="formType !== 'create' && formData.id" v-model="activeTab">
      <el-tab-pane label="BOM 组成" name="bom" lazy><md-product-bom-form :item-id="formData.id" :form-type="formType" /></el-tab-pane>
      <el-tab-pane v-if="formData.batchFlag" label="批次属性" name="batch" lazy><md-item-batch-config-form :item-id="formData.id" :item-or-product="currentItemOrProduct" :form-type="formType" /></el-tab-pane>
      <!-- TODO @芋艿：【对齐】替代品，目前没这个，可忽略 -->
      <el-tab-pane label="替代品" name="substitute" lazy><el-empty description="替代品（待实现）" /></el-tab-pane>
      <el-tab-pane label="SIP" name="sip" lazy><md-product-sip-form :item-id="formData.id" :form-type="formType" /></el-tab-pane>
      <el-tab-pane label="SOP" name="sop" lazy><md-product-sop-form :item-id="formData.id" :form-type="formType" /></el-tab-pane>
    </el-tabs>

    <span slot="footer">
      <el-button v-if="isDetail && formData.id" type="primary" plain @click="handleBarcode">查看条码</el-button>
      <el-button v-if="!isDetail" type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
    <barcode-detail ref="barcodeDetail" />
  </el-dialog>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { MdItemApi } from '@/api/mes/md/item'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import MdItemBatchConfigForm from './MdItemBatchConfigForm.vue'
import MdProductBomForm from './MdProductBomForm.vue'
import MdProductSopForm from './MdProductSopForm.vue'
import MdProductSipForm from './MdProductSipForm.vue'
import MdUnitMeasureSelect from '@/views/mes/md/unitmeasure/components/MdUnitMeasureSelect.vue'
import MdItemTypeSelect from '@/views/mes/md/item/type/components/MdItemTypeSelect.vue'
import { MesAutoCodeRuleCode, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import BarcodeDetail from '@/views/mes/wm/barcode/components/BarcodeDetail.vue'

export default {
  name: 'MdItemForm',
  components: { MdItemBatchConfigForm, MdProductBomForm, MdProductSopForm, MdProductSipForm, MdUnitMeasureSelect, MdItemTypeSelect, BarcodeDetail },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formType: '',
      activeTab: 'bom',
      formData: this.getDefaultForm(),
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formRules: {
        code: [{ required: true, message: '物料编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '物料名称不能为空', trigger: 'blur' }],
        unitMeasureId: [{ required: true, message: '计量单位不能为空', trigger: 'change' }],
        itemTypeId: [{ required: true, message: '物料分类不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return { create: '新增物料/产品', update: '修改物料/产品', detail: '查看物料/产品' }[this.formType] || this.formType
    },
    isDetail() {
      return this.formType === 'detail'
    },
    currentItemOrProduct() {
      return this.formData.itemOrProduct || ''
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        specification: undefined,
        unitMeasureId: undefined,
        itemTypeId: undefined,
        status: CommonStatusEnum.DISABLE,
        safeStockFlag: false,
        minStock: 0,
        maxStock: 0,
        highValue: false,
        batchFlag: true,
        remark: undefined,
        itemOrProduct: undefined
      }
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    async generateCode() {
      this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.MD_ITEM_CODE)).data
    },
    handleItemTypeChange(type) {
      this.formData.itemOrProduct = type && type.itemOrProduct
    },
    handleBarcode() {
      this.$refs.barcodeDetail.openByBusiness(this.formData.id, BarcodeBizTypeEnum.ITEM, this.formData.code, this.formData.name)
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.activeTab = 'bom'
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          this.formData = (await MdItemApi.getItem(id)).data
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
            this.formData.id = (await MdItemApi.createItem(this.formData)).data
            this.formType = 'update'
            this.$modal.msgSuccess('新增成功')
          } else {
            await MdItemApi.updateItem(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
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
</style>
