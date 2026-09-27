<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门" prop="deptId">
            <dept-select v-model="formData.deptId" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="车牌号" prop="no">
            <el-input v-model="formData.no" placeholder="请输入车牌号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="车辆名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入车辆名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="车型" prop="type">
            <el-input v-model="formData.type" placeholder="请输入车型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="车辆分类" prop="category">
            <el-select v-model="formData.category" placeholder="请选择车辆分类" clearable style="width: 100%">
              <el-option
                v-for="dict in categoryOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="品牌型号" prop="brandModel">
            <el-input v-model="formData.brandModel" placeholder="请输入品牌型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="座位数" prop="seatCount">
            <el-input-number
              v-model="formData.seatCount"
              :min="1"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="裸车价格（元）" prop="barePrice">
            <el-input-number
              v-model="formData.barePrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="交强险到期时间" prop="compulsoryInsuranceExpireTime">
            <el-date-picker
              v-model="formData.compulsoryInsuranceExpireTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择交强险到期时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商业险到期时间" prop="commercialInsuranceExpireTime">
            <el-date-picker
              v-model="formData.commercialInsuranceExpireTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择商业险到期时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年检到期时间" prop="inspectionExpireTime">
            <el-date-picker
              v-model="formData.inspectionExpireTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择年检到期时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="车辆照片" prop="picUrl">
            <upload-img v-model="formData.picUrl" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { OA_VEHICLE_STATUS } from '@/views/oa/utils/constants'
import * as VehicleApi from '@/api/oa/vehicle'

function createDefaultForm() {
  return {
    id: undefined,
    no: '',
    name: '',
    deptId: undefined,
    status: OA_VEHICLE_STATUS.IDLE,
    type: '',
    category: '',
    brandModel: '',
    seatCount: undefined,
    barePrice: undefined,
    compulsoryInsuranceExpireTime: undefined,
    commercialInsuranceExpireTime: undefined,
    inspectionExpireTime: undefined,
    picUrl: '',
    sort: 0,
    remark: ''
  }
}

export default {
  name: 'OaVehicleForm',
  components: { Dialog, DeptSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        no: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '车辆名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '车型不能为空', trigger: 'blur' }],
        seatCount: [{ required: true, message: '座位数不能为空', trigger: 'change' }],
        barePrice: [{ required: true, message: '裸车价格不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '显示顺序不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_VEHICLE_STATUS)
    },
    categoryOptions() {
      return getStrDictOptions(DICT_TYPE.OA_VEHICLE_CATEGORY)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增车辆' : '修改车辆'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        VehicleApi.getVehicle(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const api = this.formType === 'create' ? VehicleApi.createVehicle : VehicleApi.updateVehicle
        api(this.formData).then(() => {
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
        this.$refs.form && this.$refs.form.resetFields()
      })
    }
  }
}
</script>
