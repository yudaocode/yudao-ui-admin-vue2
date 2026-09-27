<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="780px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 基础信息 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="计划类型" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择计划类型"
              style="width: 100%"
              @change="handlePlanTypeChange"
            >
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择计划状态" style="width: 100%">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="计划标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入计划标题"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="计划标签" prop="label">
        <el-input v-model="formData.label" maxlength="255" placeholder="例如：重点、销售" />
      </el-form-item>
      <!-- 计划周期 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              placeholder="请选择开始时间"
              type="datetime"
              value-format="timestamp"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              placeholder="请选择结束时间"
              type="datetime"
              value-format="timestamp"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 计划内容 -->
      <el-form-item label="计划内容" prop="content">
        <el-input
          v-model="formData.content"
          placeholder="请输入计划内容"
          type="textarea"
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="计划总结" prop="summary">
        <el-input
          v-model="formData.summary"
          placeholder="请输入计划总结"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item v-if="formType === 'update'" label="计划点评">
        <el-input
          :value="formData.comment || '暂无点评'"
          type="textarea"
          :rows="3"
          readonly
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <UploadFile v-model="formData.fileUrls" :limit="1" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import dayjs from 'dayjs'
import * as PlanApi from '@/api/oa/plan'
import Dialog from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_PLAN_STATUS, OA_PLAN_TYPE } from '@/views/oa/utils/constants-collab'

function createDefaultFormData() {
  return {
    id: undefined,
    type: OA_PLAN_TYPE.DAY,
    status: OA_PLAN_STATUS.UNFINISHED,
    title: '',
    label: '',
    content: '',
    summary: undefined,
    comment: undefined,
    startTime: '',
    endTime: '',
    fileUrls: []
  }
}

export default {
  name: 'OaPlanForm',
  components: { Dialog, UploadFile },
  data() {
    const validateSummary = (rule, value, callback) => {
      if (!value || value.trim().length >= 20) {
        callback()
        return
      }
      callback(new Error('计划总结不能少于 20 个字符'))
    }
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        type: [{ required: true, message: '计划类型不能为空', trigger: 'change' }],
        status: [{ required: true, message: '计划状态不能为空', trigger: 'change' }],
        title: [
          { required: true, message: '计划标题不能为空', trigger: 'blur' },
          { max: 50, message: '计划标题不能超过 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '计划内容不能为空', trigger: 'blur' },
          { min: 20, message: '计划内容不能少于 20 个字符', trigger: 'blur' }
        ],
        summary: [{ validator: validateSummary, trigger: 'blur' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PLAN_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PLAN_STATUS)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '添加工作计划' : '修改工作计划'
      this.formType = type
      this.resetForm()
      // 修改时，加载工作计划详情
      if (id) {
        this.formLoading = true
        PlanApi.getPlan(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 校验计划时间
        if (Number(this.formData.endTime) <= Number(this.formData.startTime)) {
          this.$modal.msgError('结束时间必须晚于开始时间')
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? PlanApi.createPlan(this.formData)
          : PlanApi.updatePlan(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '添加成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 切换计划类型 */
    handlePlanTypeChange(type) {
      // 按日、周、月计划初始化周期，用户仍可手动调整起止时间
      const beginTime = dayjs().second(0).millisecond(0)
      const endTime =
        type === OA_PLAN_TYPE.DAY
          ? beginTime.add(1, 'day')
          : type === OA_PLAN_TYPE.WEEK
            ? beginTime.add(7, 'day')
            : beginTime.add(1, 'month')
      this.formData.startTime = beginTime.valueOf()
      this.formData.endTime = endTime.valueOf()
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.handlePlanTypeChange(this.formData.type)
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
