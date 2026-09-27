<template>
  <dialog-component :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门" prop="deptId">
            <dept-select v-model="formData.deptId" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物品名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入物品名称" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物品编码" prop="no">
            <el-input v-model="formData.no" placeholder="请输入物品编码" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类别" prop="category">
            <el-select v-model="formData.category" placeholder="请选择类别" style="width: 100%">
              <el-option
                v-for="dict in categoryOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="管理类型" prop="manageType">
            <el-select v-model="formData.manageType" placeholder="请选择管理类型" style="width: 100%">
              <el-option
                v-for="dict in manageTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格型号" prop="model">
            <el-input v-model="formData.model" placeholder="请输入规格型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="unit">
            <el-input v-model="formData.unit" placeholder="请输入计量单位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="参考单价" prop="referencePrice">
            <el-input-number
              v-model="formData.referencePrice"
              placeholder="请输入参考单价"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存数量" prop="stockQuantity">
            <el-input-number
              v-model="formData.stockQuantity"
              placeholder="请输入库存数量"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最低库存预警" prop="minStockQuantity">
            <el-input-number
              v-model="formData.minStockQuantity"
              placeholder="请输入最低库存预警值"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物品图片" prop="picUrl">
            <upload-img v-model="formData.picUrl" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="0">正常</el-radio>
              <el-radio :label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              placeholder="请输入排序"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
              maxlength="500"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </dialog-component>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as SupplyItemApi from '@/api/oa/supply/item'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import DialogComponent from '@/components/Dialog'
import UploadImg from '@/components/UploadImg'

function createDefaultForm() {
  return {
    id: undefined,
    deptId: undefined,
    name: undefined,
    no: undefined,
    category: undefined,
    manageType: undefined,
    model: undefined,
    unit: undefined,
    referencePrice: undefined,
    picUrl: undefined,
    remark: undefined,
    stockQuantity: 0,
    minStockQuantity: 0,
    status: CommonStatusEnum.ENABLE,
    sort: 0
  }
}

export default {
  name: 'OaSupplyItemForm',
  components: { DeptSelect, DialogComponent, UploadImg },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        stockQuantity: [{ required: true, message: '库存数量不能为空', trigger: 'change' }],
        minStockQuantity: [{ required: true, message: '最低库存预警不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }],
        deptId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        name: [{ required: true, message: '物品名称不能为空', trigger: 'blur' }],
        category: [{ required: true, message: '类别不能为空', trigger: 'change' }],
        manageType: [{ required: true, message: '管理类型不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    categoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_CATEGORY)
    },
    manageTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_MANAGE_TYPE)
    }
  },
  methods: {
    open(type, id, category) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      this.formData.category = category
      if (!id) return
      this.formLoading = true
      return SupplyItemApi.getSupplyItem(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? SupplyItemApi.createSupplyItem(this.formData)
          : SupplyItemApi.updateSupplyItem(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
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
