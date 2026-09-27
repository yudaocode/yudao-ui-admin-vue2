<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="760px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 基础信息 -->
      <el-form-item label="任务标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入任务标题"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="任务类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择任务类型" style="width: 100%">
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
          <el-form-item label="接收人" prop="receiverUserIds">
            <user-select-v2
              v-model="formData.receiverUserIds"
              multiple
              placeholder="请选择任务接收人"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 任务状态与设置 -->
      <el-row>
        <el-col :span="8">
          <el-form-item label="任务状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择任务状态" style="width: 100%">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="置顶" prop="top">
            <el-switch v-model="formData.top" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="取消" prop="canceled">
            <el-switch v-model="formData.canceled" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 任务周期 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              placeholder="请选择开始时间"
              style="width: 100%"
              type="datetime"
              value-format="timestamp"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              placeholder="请选择结束时间"
              style="width: 100%"
              type="datetime"
              value-format="timestamp"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 任务内容 -->
      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="formData.description"
          placeholder="请输入任务描述"
          :rows="5"
          maxlength="2000"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="任务评价" prop="comment">
        <el-input
          v-model="formData.comment"
          placeholder="请输入任务评价"
          :rows="3"
          maxlength="1000"
          show-word-limit
          type="textarea"
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
import dayjs from 'dayjs'
import * as TaskApi from '@/api/oa/task'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { OA_TASK_STATUS, OA_TASK_TYPE } from '@/views/oa/utils/constants-collab'

function createDefaultFormData() {
  const startTime = dayjs().second(0).millisecond(0)
  return {
    id: undefined,
    type: OA_TASK_TYPE.WORK,
    status: OA_TASK_STATUS.NEW,
    top: false,
    canceled: false,
    title: '',
    description: '',
    comment: undefined,
    startTime: startTime.valueOf(),
    endTime: startTime.add(1, 'day').valueOf(),
    receiverUserIds: []
  }
}

export default {
  name: 'OaTaskForm',
  components: { Dialog, UserSelectV2 },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        title: [{ required: true, message: '任务标题不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '任务类型不能为空', trigger: 'change' }],
        status: [{ required: true, message: '任务状态不能为空', trigger: 'change' }],
        receiverUserIds: [{ required: true, message: '任务接收人不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
        description: [{ required: true, message: '任务描述不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_TASK_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_TASK_STATUS)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '添加任务' : '修改任务'
      this.formType = type
      this.resetForm()
      // 修改时，加载任务详情
      if (id) {
        this.formLoading = true
        TaskApi.getTask(id).then(response => {
          const task = response.data
          this.formData = Object.assign({}, task, {
            receiverUserIds: (task.receivers || []).map(receiver => receiver.userId)
          })
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (Number(this.formData.endTime) <= Number(this.formData.startTime)) {
          this.$modal.msgError('结束时间必须晚于开始时间')
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? TaskApi.createTask(this.formData)
          : TaskApi.updateTask(this.formData)
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
