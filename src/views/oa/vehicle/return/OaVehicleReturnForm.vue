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
      <el-form-item label="用车申请" prop="applyId">
        <oa-vehicle-apply-select
          v-model="formData.applyId"
          :status="BpmProcessInstanceStatus.APPROVE"
          :return-status="OA_VEHICLE_RETURN_STATUS.PENDING_RETURN"
          style="width: 100%"
          @change="handleApplyChange"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="实际出车时间" prop="actualStartTime">
            <el-date-picker
              v-model="formData.actualStartTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择实际出车时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际出车地点" prop="startLocation">
            <el-input
              v-model="formData.startLocation"
              placeholder="请输入实际出车地点"
              maxlength="255"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="用车事由" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          placeholder="请输入用车事由"
          maxlength="500"
        />
      </el-form-item>
      <el-form-item label="随行人" prop="passenger">
        <el-input v-model="formData.passenger" placeholder="请输入随行人" maxlength="500" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="实际回车时间" prop="actualReturnTime">
            <el-date-picker
              v-model="formData.actualReturnTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择实际回车时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际回车地点" prop="returnLocation">
            <el-input
              v-model="formData.returnLocation"
              placeholder="请输入实际回车地点"
              maxlength="255"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="还车说明" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入还车说明"
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
import * as VehicleReturnApi from '@/api/oa/vehicle/return'
import * as VehicleApplyApi from '@/api/oa/vehicle/apply'
import { formatDate } from '@/utils/formatTime'
import OaVehicleApplySelect from '../apply/components/OaVehicleApplySelect.vue'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import { OA_VEHICLE_RETURN_STATUS } from '@/views/oa/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    no: '',
    applyId: undefined,
    actualStartTime: undefined,
    startLocation: '',
    reason: '',
    passenger: '',
    actualReturnTime: undefined,
    returnLocation: '',
    remark: '',
    fileUrls: []
  }
}

export default {
  name: 'OaVehicleReturnForm',
  components: { Dialog, OaVehicleApplySelect },
  data() {
    return {
      BpmProcessInstanceStatus,
      OA_VEHICLE_RETURN_STATUS,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        applyId: [{ required: true, message: '用车申请不能为空', trigger: 'change' }],
        actualStartTime: [{ required: true, message: '实际出车时间不能为空', trigger: 'change' }],
        startLocation: [{ required: true, message: '实际出车地点不能为空', trigger: 'blur' }],
        reason: [{ required: true, message: '用车事由不能为空', trigger: 'blur' }],
        actualReturnTime: [{ required: true, message: '实际回车时间不能为空', trigger: 'change' }],
        returnLocation: [{ required: true, message: '实际回车地点不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(type, id, applyId) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增还车申请' : '修改还车申请'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        VehicleReturnApi.getVehicleReturn(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
        }).finally(() => {
          this.formLoading = false
        })
      } else if (applyId) {
        // 从用车申请发起还车时，回填关联申请
        this.formData.applyId = applyId
        this.formLoading = true
        VehicleApplyApi.getVehicleApply(applyId).then(response => {
          this.handleApplyChange(response.data)
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    // 切换申请时带入计划值，还车人可按实际行程修改
    handleApplyChange(apply) {
      this.formData.actualStartTime = apply && apply.startTime ? formatDate(apply.startTime) : undefined
      this.formData.startLocation = (apply && apply.startLocation) || ''
      this.formData.reason = (apply && apply.reason) || ''
      this.formData.passenger = (apply && apply.passenger) || ''
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const api = this.formType === 'create'
          ? VehicleReturnApi.createVehicleReturn
          : VehicleReturnApi.updateVehicleReturn
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
