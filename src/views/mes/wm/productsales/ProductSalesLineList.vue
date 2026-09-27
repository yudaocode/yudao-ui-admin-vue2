<!-- MES 销售出库单行列表子组件 -->
<template>
  <div class="product-sales-line-list">
    <el-button
      v-if="isUpdate"
      type="primary"
      plain
      icon="el-icon-plus"
      class="add-button"
      @click="openForm('create')"
    >添加物料</el-button>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      border
      row-key="id"
    >
      <el-table-column type="expand">
        <template #default="scope">
          <ProductSalesDetailList
            :ref="'detailList' + scope.row.id"
            :sales-id="salesId"
            :line-id="scope.row.id"
            :item-id="scope.row.itemId"
            :form-type="formType"
            @edit-detail="openDetailForm('update', scope.row.id, scope.row.itemId, $event)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="产品编码"
        align="center"
        prop="itemCode"
        min-width="120"
      />
      <el-table-column
        label="产品名称"
        align="center"
        prop="itemName"
        min-width="140"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="specification"
        min-width="120"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitMeasureName"
        width="80"
      />
      <el-table-column
        label="出库数量"
        align="center"
        prop="quantity"
        width="100"
      />
      <el-table-column
        label="批次号"
        align="center"
        prop="batchCode"
        min-width="120"
      />
      <el-table-column
        label="是否校验"
        align="center"
        prop="oqcCheckFlag"
        width="100"
      >
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.oqcCheckFlag"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isUpdate || isPick"
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-if="isUpdate"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="isUpdate"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
          <el-button
            v-if="isPick"
            type="text"
            class="success-text"
            @click="handlePick(scope.row.id)"
          >拣货</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

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
          <el-col
            v-if="hasNoticeId"
            :span="8"
          >
            <el-form-item
              label="发货通知单行"
              prop="noticeLineId"
            >
              <ProductSalesNoticeLineSelect
                v-model="formData.noticeLineId"
                :notice-id="noticeId"
                @change="handleNoticeLineChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="产品"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                placeholder="请选择产品"
                :disabled="!!formData.noticeLineId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="批次号"
              prop="batchCode"
            >
              <el-input
                v-model="formData.batchCode"
                placeholder="请输入批次号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="出库数量"
              prop="quantity"
            >
              <el-input-number
                v-model="formData.quantity"
                :precision="2"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="是否校验"
              prop="oqcCheckFlag"
            >
              <el-radio-group v-model="formData.oqcCheckFlag">
                <el-radio
                  v-for="dict in boolOptions"
                  :key="String(dict.value)"
                  :label="dict.value"
                >{{ dict.label }}</el-radio>
              </el-radio-group>
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
          :disabled="formLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <ProductSalesDetailForm
      ref="detailForm"
      :sales-id="salesId"
      @success="onDetailFormSuccess"
    />
  </div>
</template>

<script>
import { WmProductSalesLineApi } from '@/api/mes/wm/productsales/line'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import { DICT_TYPE, getBoolDictOptions } from '@/utils/dict'
import ProductSalesNoticeLineSelect from './components/ProductSalesNoticeLineSelect.vue'
import ProductSalesDetailList from './ProductSalesDetailList.vue'
import ProductSalesDetailForm from './ProductSalesDetailForm.vue'

function defaultFormData() {
  return {
    id: undefined,
    salesId: undefined,
    noticeLineId: undefined,
    itemId: undefined,
    quantity: undefined,
    batchCode: undefined,
    oqcCheckFlag: false,
    remark: undefined
  }
}

export default {
  name: 'ProductSalesLineList',
  components: { MdItemSelect, ProductSalesNoticeLineSelect, ProductSalesDetailList, ProductSalesDetailForm },
  props: {
    salesId: { type: Number, required: true },
    noticeId: { type: Number, default: undefined },
    formType: { type: String, required: true }
  },
  data() {
    return {
      DICT_TYPE,
      boolOptions: getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING),
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, salesId: undefined },
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      lineFormType: '',
      formData: defaultFormData(),
      formRules: {
        itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
        quantity: [{ required: true, message: '出库数量不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isUpdate() { return ['create', 'update'].includes(this.formType) },
    isPick() { return this.formType === 'stock' },
    hasNoticeId() { return !!this.noticeId }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        this.queryParams.salesId = this.salesId
        const response = await WmProductSalesLineApi.getProductSalesLinePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除所选数据项?')
        await WmProductSalesLineApi.deleteProductSalesLine(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败不追加提示
      }
    },
    resetForm() {
      this.formData = defaultFormData()
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    async openForm(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '添加物料出库单行' : '修改物料出库单行'
      this.lineFormType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await WmProductSalesLineApi.getProductSalesLine(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    handleNoticeLineChange(line) {
      if (!line) return
      this.formData.itemId = line.itemId
      this.formData.quantity = line.quantity
      this.formData.batchCode = line.batchCode
      this.formData.oqcCheckFlag = line.oqcCheckFlag == null ? false : line.oqcCheckFlag
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        const data = Object.assign({}, this.formData, { salesId: this.salesId })
        if (this.lineFormType === 'create') {
          await WmProductSalesLineApi.createProductSalesLine(data)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await WmProductSalesLineApi.updateProductSalesLine(data)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        await this.getList()
      } finally {
        this.formLoading = false
      }
    },
    handlePick(lineId) {
      const row = this.list.find(item => item.id === lineId)
      this.openDetailForm('create', lineId, row && row.itemId)
    },
    openDetailForm(type, lineId, itemId, detailId) {
      this.$refs.detailForm.open(type, lineId, itemId, detailId)
    },
    onDetailFormSuccess(lineId) {
      const ref = this.$refs['detailList' + lineId]
      const detailList = Array.isArray(ref) ? ref[0] : ref
      if (detailList) detailList.getList()
    }
  }
}
</script>

<style scoped>
.add-button { margin-bottom: 10px; }
.danger-text { color: #f56c6c; }
.success-text { color: #67c23a; }
</style>
