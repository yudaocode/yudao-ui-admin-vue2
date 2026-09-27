<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="720px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <!-- 基础信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="日程类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择日程类型" style="width: 100%">
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
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="item in priorityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="日程标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入日程标题"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      <!-- 日程时间 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
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
              type="datetime"
              value-format="timestamp"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 参与和提醒 -->
      <el-form-item label="参与人">
        <user-select-v2 v-model="formData.participantUserIds" multiple placeholder="请选择参与人" />
      </el-form-item>
      <el-form-item label="日程提醒" prop="remind">
        <el-switch v-model="formData.remind" />
      </el-form-item>
      <el-form-item label="日程描述">
        <el-input
          v-model="formData.description"
          placeholder="请输入日程描述"
          type="textarea"
          :rows="4"
          maxlength="1000"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as ScheduleApi from '@/api/oa/schedule'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { OA_PRIORITY, OA_SCHEDULE_TYPE } from '@/views/oa/utils/constants-collab'

function createDefaultFormData() {
  return {
    id: undefined,
    type: OA_SCHEDULE_TYPE.REMINDER,
    priority: OA_PRIORITY.NORMAL,
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    remind: false,
    participantUserIds: []
  }
}

export default {
  name: 'OaScheduleForm',
  components: { Dialog, UserSelectV2 },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        type: [{ required: true, message: '日程类型不能为空', trigger: 'change' }],
        priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }],
        title: [{ required: true, message: '日程标题不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SCHEDULE_TYPE)
    },
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增日程' : '修改日程'
      this.formType = type
      this.resetForm()
      // 修改时，加载日程详情
      if (id) {
        this.formLoading = true
        ScheduleApi.getSchedule(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      if (this.formLoading) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 校验日程时间
        if (Number(this.formData.endTime) <= Number(this.formData.startTime)) {
          this.$modal.msgError('结束时间必须晚于开始时间')
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? ScheduleApi.createSchedule(this.formData)
          : ScheduleApi.updateSchedule(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '添加成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
