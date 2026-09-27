<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="800px"
    append-to-body
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" maxlength="255" />
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgency">
        <el-select v-model="formData.urgency" placeholder="请选择紧急程度" style="width: 100%">
          <el-option
            v-for="dict in urgencyOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请假类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择请假类型" style="width: 100%">
          <el-option
            v-for="dict in leaveTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          value-format="timestamp"
          placeholder="请选择开始时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="datetime"
          value-format="timestamp"
          placeholder="请选择结束时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="申请原因" prop="reason">
        <el-input
          v-model="formData.reason"
          maxlength="5000"
          placeholder="请输入申请原因"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :is-show-tip="false" />
      </el-form-item>
      <el-form-item label="天数">
        <el-input :value="days" disabled>
          <template slot="append">天</template>
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import dayjs from 'dayjs'
import Dialog from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import * as LeaveApplyApi from '@/api/oa/leave'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

function createDefaultForm() {
  return {
    title: undefined,
    urgency: undefined,
    type: undefined,
    startTime: undefined,
    endTime: undefined,
    reason: undefined,
    fileUrls: []
  }
}

export default {
  name: 'OaLeaveApplyForm',
  components: { Dialog, UploadFile },
  data() {
    return {
      dialogVisible: false, // 弹窗是否展示
      dialogTitle: '', // 弹窗标题
      formLoading: false, // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
      formType: '', // 表单类型：create - 新增；update - 修改
      formData: createDefaultForm(), // 表单数据
      formRules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        urgency: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
        type: [{ required: true, message: '请假类型不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
        reason: [{ required: true, message: '申请原因不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    urgencyOptions() {
      return getIntDictOptions(DICT_TYPE.OA_APPLY_URGENCY)
    },
    leaveTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_LEAVE_TYPE)
    },
    /** 按请假起止时间计算天数 */
    days() {
      if (!this.formData.startTime || !this.formData.endTime) {
        return undefined
      }
      const value = dayjs(Number(this.formData.endTime))
        .diff(dayjs(Number(this.formData.startTime)), 'day', true)
      return Math.ceil(value)
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, id) {
      this.resetForm()
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      // 修改时，设置数据
      if (id) {
        this.formLoading = true
        return LeaveApplyApi.getLeaveApply(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? LeaveApplyApi.createLeaveApply(this.formData)
          : LeaveApplyApi.updateLeaveApply(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          // 发送操作成功的事件
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>
