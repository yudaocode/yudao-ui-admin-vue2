<template>
  <dialog-component :title="dialogTitle" v-model="dialogVisible" width="1000px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="单据编号">
        <el-input v-model="formData.no" placeholder="保存后自动生成" disabled />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="领用日期" prop="applyTime">
            <el-date-picker
              v-model="formData.applyTime"
              type="date"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择领用日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用类型" prop="useType">
            <el-select v-model="formData.useType" placeholder="请选择使用类型" style="width: 100%">
              <el-option
                v-for="dict in useTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="领取方式" prop="pickupMethod">
            <el-select v-model="formData.pickupMethod" placeholder="请选择领取方式" style="width: 100%">
              <el-option
                v-for="dict in pickupMethodOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="申请事由" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          placeholder="请输入申请事由"
          maxlength="500"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
          maxlength="500"
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :limit="10" :file-size="20" />
      </el-form-item>
      <!-- 领用明细 -->
      <div class="item-header">
        <span class="item-title">领用明细</span>
        <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="$refs.itemSelect.open()">
          添加办公用品
        </el-button>
      </div>
      <el-table :data="formData.items" border show-overflow-tooltip>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="物品名称" prop="itemName" min-width="160" />
        <el-table-column label="规格型号" prop="model" min-width="120" />
        <el-table-column label="计量单位" prop="unit" width="90" align="center" />
        <el-table-column label="管理类型" width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_MANAGE_TYPE" :value="scope.row.manageType" />
          </template>
        </el-table-column>
        <el-table-column label="领用数量" width="140">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.applyQuantity"
              :min="1"
              :precision="0"
              size="small"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="danger-text" @click="formData.items.splice(scope.$index, 1)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
    <oa-supply-item-select ref="itemSelect" @select="handleSelectItem" />
  </dialog-component>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import * as SupplyApplyApi from '@/api/oa/supply/apply'
import OaSupplyItemSelect from '@/views/oa/supply/item/components/OaSupplyItemSelect.vue'
import DialogComponent from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'

function createDefaultForm() {
  return {
    id: undefined,
    no: undefined,
    applyTime: formatDate(new Date(), 'YYYY-MM-DD') + ' 00:00:00',
    useType: 1,
    pickupMethod: 1,
    reason: undefined,
    remark: undefined,
    items: [],
    fileUrls: []
  }
}

export default {
  name: 'OaSupplyApplyForm',
  components: { OaSupplyItemSelect, DialogComponent, UploadFile },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formData: createDefaultForm(),
      formRules: {
        applyTime: [{ required: true, message: '领用日期不能为空', trigger: 'change' }],
        useType: [{ required: true, message: '使用类型不能为空', trigger: 'change' }],
        pickupMethod: [{ required: true, message: '领取方式不能为空', trigger: 'change' }],
        reason: [{ required: true, whitespace: true, message: '申请事由不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    useTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_USE_TYPE)
    },
    pickupMethodOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_PICKUP_METHOD)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      return SupplyApplyApi.getSupplyApply(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    handleSelectItem(item) {
      if (this.formData.items.some(row => row.itemId === item.id)) {
        return this.$modal.msgWarning('该物品已添加')
      }
      this.formData.items.push({
        itemId: item.id,
        itemName: item.name,
        model: item.model,
        unit: item.unit,
        manageType: item.manageType,
        applyQuantity: 1
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (!this.formData.items || !this.formData.items.length) {
          return this.$modal.msgWarning('请添加领用明细')
        }
        if (this.formData.items.some(item => !item.applyQuantity || item.applyQuantity < 1)) {
          return this.$modal.msgWarning('请填写每行领用数量，数量不能小于 1')
        }
        this.formLoading = true
        const isUpdate = !!this.formData.id
        const request = isUpdate
          ? SupplyApplyApi.updateSupplyApply(this.formData)
          : SupplyApplyApi.createSupplyApply(this.formData).then(response => {
            this.formData.id = response.data
          })
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
}

.item-title {
  font-weight: 700;
}

.danger-text {
  color: #f56c6c;
}
</style>
