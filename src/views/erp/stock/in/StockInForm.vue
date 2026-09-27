<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1080px"
    append-to-body
    custom-class="stock-in-dialog"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="disabled"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="入库单号"
            prop="no"
          >
            <el-input
              v-model="formData.no"
              disabled
              placeholder="保存时自动生成"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="入库时间"
            prop="inTime"
          >
            <el-date-picker
              v-model="formData.inTime"
              type="date"
              value-format="timestamp"
              placeholder="选择入库时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="供应商"
            prop="supplierId"
          >
            <el-select
              v-model="formData.supplierId"
              clearable
              filterable
              placeholder="请选择供应商"
              style="width: 100%"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
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
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="附件"
            prop="fileUrl"
          >
            <FileUpload
              v-if="!disabled"
              v-model="formData.fileUrl"
              :is-show-tip="false"
              :limit="1"
            />
            <el-link
              v-else-if="formData.fileUrl"
              :href="formData.fileUrl"
              type="primary"
              target="_blank"
            >查看附件</el-link>
            <span v-else>-</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-card
      shadow="never"
      class="item-card"
    >
      <el-tabs v-model="subTabsName">
        <el-tab-pane
          label="入库产品清单"
          name="item"
        >
          <StockInItemForm
            ref="itemForm"
            :items="formData.items"
            :disabled="disabled"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        v-if="!disabled"
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import { getSupplierSimpleList } from '@/api/erp/purchase/supplier'
import { StockInApi } from '@/api/erp/stock/in'
import StockInItemForm from './components/StockInItemForm.vue'

export default {
  name: 'StockInForm',
  components: { FileUpload, StockInItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      supplierList: [],
      subTabsName: 'item',
      formData: this.defaultForm(),
      formRules: {
        inTime: [{ required: true, message: '入库时间不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    disabled() {
      return this.formType === 'detail'
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        supplierId: undefined,
        inTime: undefined,
        remark: undefined,
        fileUrl: '',
        items: [],
        no: undefined
      }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail'
        ? '其它入库详情'
        : this.formType === 'update' ? '修改其它入库' : '新增其它入库'
      this.formData = this.defaultForm()
      this.supplierList = []
      this.subTabsName = 'item'
      this.dialogVisible = true
      this.formLoading = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })

      const detailRequest = id !== undefined && id !== null
        ? StockInApi.getStockIn(id)
        : Promise.resolve(null)
      return Promise.all([detailRequest, getSupplierSimpleList()])
        .then(([detailResponse, supplierResponse]) => {
          if (detailResponse) {
            const detail = detailResponse.data
            this.formData = Object.assign(this.defaultForm(), detail)
            this.formData.items = detail.items || []
          }
          this.supplierList = supplierResponse.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.defaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        const itemForm = this.$refs.itemForm
        const submit = () => {
          this.formLoading = true
          const request = this.formType === 'create'
            ? StockInApi.createStockIn(this.formData)
            : StockInApi.updateStockIn(this.formData)
          request
            .then(() => {
              this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
              this.dialogVisible = false
              this.$emit('success')
            })
            .finally(() => {
              this.formLoading = false
            })
        }
        if (itemForm && itemForm.validate) {
          itemForm.validate((itemValid) => {
            if (itemValid) submit()
          })
        } else {
          submit()
        }
      })
    }
  }
}
</script>

<style scoped>
.item-card {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
