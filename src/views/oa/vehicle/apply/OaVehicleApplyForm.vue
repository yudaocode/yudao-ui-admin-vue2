<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item label="申请单号">
        <el-input v-model="formData.no" placeholder="保存后自动生成" disabled />
      </el-form-item>
      <el-form-item label="车辆" prop="vehicleId">
        <oa-vehicle-select
          v-model="formData.vehicleId"
          :selected-vehicle="formData.vehicleId ? { id: formData.vehicleId, no: formData.vehicleNo } : undefined"
          @change="handleVehicleSelected"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预计出车时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择出车时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计回车时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择回车时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出车地点" prop="startLocation">
            <el-input
              v-model="formData.startLocation"
              placeholder="请输入出车地点"
              maxlength="255"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计回车地点" prop="endLocation">
            <el-input v-model="formData.endLocation" placeholder="请输入回车地点" maxlength="255" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="随行人" prop="passenger">
        <el-input v-model="formData.passenger" placeholder="请输入随行人" maxlength="500" />
      </el-form-item>
      <el-form-item label="用车事由" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入用车事由"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :limit="5" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as VehicleApplyApi from '@/api/oa/vehicle/apply'
import OaVehicleSelect from '@/views/oa/vehicle/components/OaVehicleSelect.vue'

function createDefaultForm() {
  return {
    id: undefined,
    no: '',
    vehicleId: undefined,
    vehicleNo: undefined,
    startTime: undefined,
    endTime: undefined,
    startLocation: '',
    endLocation: '',
    passenger: '',
    reason: '',
    remark: '',
    fileUrls: []
  }
}

export default {
  name: 'OaVehicleApplyForm',
  components: { Dialog, OaVehicleSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        vehicleId: [{ required: true, message: '车辆不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '预计出车时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '预计回车时间不能为空', trigger: 'change' }],
        startLocation: [{ required: true, message: '出车地点不能为空', trigger: 'blur' }],
        endLocation: [{ required: true, message: '预计回车地点不能为空', trigger: 'blur' }],
        reason: [{ required: true, message: '用车事由不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增用车申请' : '修改用车申请'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      if (id) {
        VehicleApplyApi.getVehicleApply(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
        }).finally(() => {
          this.formLoading = false
        })
      } else {
        this.formLoading = false
      }
    },
    // 回填选中的车牌号
    handleVehicleSelected(vehicle) {
      this.formData.vehicleNo = vehicle ? vehicle.no : undefined
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        // 校验预计回车时间晚于出车时间
        if (this.formData.startTime >= this.formData.endTime) {
          this.$modal.msgWarning('预计回车时间必须晚于预计出车时间')
          return
        }
        this.formLoading = true
        const api = this.formType === 'create'
          ? VehicleApplyApi.createVehicleApply
          : VehicleApplyApi.updateVehicleApply
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
