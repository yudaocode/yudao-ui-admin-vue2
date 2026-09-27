<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1080px"
    append-to-body
    custom-class="stock-move-dialog"
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
            label="调拨单号"
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
            label="调拨时间"
            prop="moveTime"
          >
            <el-date-picker
              v-model="formData.moveTime"
              type="date"
              value-format="timestamp"
              placeholder="选择调拨时间"
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
              v-model="formData.fileUrl"
              :is-show-tip="false"
              :limit="1"
            />
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
          label="调拨产品清单"
          name="item"
        >
          <stock-move-item-form
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
import { StockMoveApi } from '@/api/erp/stock/move'
import StockMoveItemForm from './components/StockMoveItemForm.vue'

export default {
  name: 'StockMoveForm',
  components: { FileUpload, StockMoveItemForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      subTabsName: 'item',
      formData: this.defaultForm(),
      formRules: {
        moveTime: [{ required: true, message: '调拨时间不能为空', trigger: 'blur' }]
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
        customerId: undefined,
        moveTime: undefined,
        remark: undefined,
        fileUrl: '',
        items: [],
        no: undefined
      }
    },
    open(type, id) {
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'detail'
        ? '库存调拨详情'
        : this.formType === 'update' ? '修改库存调拨' : '新增库存调拨'
      this.resetForm()
      this.dialogVisible = true
      if (id === undefined || id === null) return Promise.resolve()

      this.formLoading = true
      return StockMoveApi.getStockMove(id).then(response => {
        const detail = response.data
        this.formData = Object.assign(this.defaultForm(), detail, {
          items: Array.isArray(detail.items) ? detail.items : []
        })
      }).finally(() => {
        this.formLoading = false
      })
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.defaultForm()
      this.subTabsName = 'item'
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const itemForm = this.$refs.itemForm
        const submit = () => {
          this.formLoading = true
          const request = this.formType === 'create'
            ? StockMoveApi.createStockMove(this.formData)
            : StockMoveApi.updateStockMove(this.formData)
          request.then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          }).finally(() => {
            this.formLoading = false
          })
        }
        if (itemForm && itemForm.validate) {
          itemForm.validate(itemValid => {
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
