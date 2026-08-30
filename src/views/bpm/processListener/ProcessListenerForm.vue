<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="110px"
    >
      <el-form-item label="名字" prop="name">
        <el-input v-model="form.name" placeholder="请输入名字" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="Number(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%" @change="handleTypeChange">
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.BPM_PROCESS_LISTENER_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事件" prop="event">
        <el-select v-model="form.event" placeholder="请选择事件" style="width: 100%">
          <el-option
            v-for="event in eventOptions"
            :key="event.value"
            :label="event.label"
            :value="event.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="值类型" prop="valueType">
        <el-select
          v-model="form.valueType"
          placeholder="请选择值类型"
          style="width: 100%"
          @change="handleValueTypeChange"
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.BPM_PROCESS_LISTENER_VALUE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="valueLabel" prop="value">
        <el-input v-model="form.value" :placeholder="valuePlaceholder" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createProcessListener,
  getProcessListener,
  updateProcessListener
} from '@/api/bpm/processListener'
import { CommonStatusEnum } from '@/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    name: undefined,
    type: undefined,
    status: CommonStatusEnum.ENABLE,
    event: undefined,
    valueType: undefined,
    value: undefined
  }
}

// Flowable expects event codes, while the UI displays their Chinese labels.
const EVENT_EXECUTION_OPTIONS = [
  { label: '开始', value: 'start' },
  { label: '结束', value: 'end' }
]
const EVENT_TASK_OPTIONS = [
  { label: '创建', value: 'create' },
  { label: '指派', value: 'assignment' },
  { label: '完成', value: 'complete' },
  { label: '删除', value: 'delete' },
  { label: '更新', value: 'update' },
  { label: '超时', value: 'timeout' }
]

/** 可复用的 BPM 流程监听器表单。 */
export default {
  name: 'ProcessListenerForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      form: createDefaultForm(),
      rules: {
        name: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        event: [{ required: true, message: '监听事件不能为空', trigger: 'change' }],
        valueType: [{ required: true, message: '值类型不能为空', trigger: 'change' }],
        value: [{ required: true, message: '值不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    eventOptions() {
      return this.form.type === 'execution'
        ? EVENT_EXECUTION_OPTIONS
        : EVENT_TASK_OPTIONS
    },
    valueLabel() {
      return this.form.valueType === 'class' ? '类路径' : '表达式'
    },
    valuePlaceholder() {
      return this.form.valueType === 'class' ? '请输入类路径' : '请输入表达式'
    }
  },
  methods: {
    async open(type, id) {
      if (this.formLoading) {
        return
      }
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'create' ? '添加流程监听器' : '修改流程监听器'
      this.resetForm()
      this.dialogVisible = true
      if (id === undefined || id === null) {
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        return
      }
      this.formLoading = true
      try {
        const response = await getProcessListener(id)
        this.form = {
          ...createDefaultForm(),
          ...((response && response.data) || {})
        }
        this.form.event = this.normalizeEvent(this.form.event)
        if (this.form.status !== undefined && this.form.status !== null) {
          this.form.status = Number(this.form.status)
        }
      } catch (e) {
        // request 拦截器已提示后端错误，保留弹窗以便取消或重试。
      } finally {
        this.formLoading = false
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
    handleTypeChange() {
      this.form.event = undefined
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate('event'))
    },
    handleValueTypeChange() {
      this.form.value = undefined
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate('value'))
    },
    normalizeEvent(event) {
      const legacyEventMap = {
        开始: 'start',
        结束: 'end',
        创建: 'create',
        指派: 'assignment',
        完成: 'complete',
        删除: 'delete',
        更新: 'update',
        超时: 'timeout'
      }
      return legacyEventMap[event] || event
    },
    async submitForm() {
      if (this.formLoading) {
        return
      }
      const form = this.$refs.form
      if (!form) {
        return
      }
      const valid = await new Promise(resolve => form.validate(resolve))
      if (!valid) {
        return
      }
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createProcessListener(this.form)
          this.showSuccess('新增成功')
        } else {
          await updateProcessListener(this.form)
          this.showSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } catch (e) {
        // request 拦截器已统一展示错误信息。
      } finally {
        this.formLoading = false
      }
    },
    showSuccess(message) {
      if (this.$modal && this.$modal.msgSuccess) {
        this.$modal.msgSuccess(message)
      } else if (this.$message) {
        this.$message.success(message)
      }
    },
    resetForm() {
      this.form = createDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    handleClosed() {
      this.formLoading = false
      this.resetForm()
    }
  }
}
</script>
