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
      <el-form-item label="试用期心得" prop="experience">
        <el-input
          v-model="formData.experience"
          maxlength="255"
          placeholder="请输入试用期心得"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="岗位职责理解" prop="understanding">
        <el-input
          v-model="formData.understanding"
          maxlength="255"
          placeholder="请输入岗位职责理解"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="试用期成长" prop="growth">
        <el-input
          v-model="formData.growth"
          maxlength="255"
          placeholder="请输入试用期成长"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="目前不足" prop="deficiency">
        <el-input
          v-model="formData.deficiency"
          maxlength="255"
          placeholder="请输入目前不足"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="工作改进" prop="improvement">
        <el-input
          v-model="formData.improvement"
          maxlength="255"
          placeholder="请输入工作改进"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="产品意见建议" prop="suggestion">
        <el-input
          v-model="formData.suggestion"
          maxlength="255"
          placeholder="请输入产品意见建议"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="天数">
        <el-input :value="days" disabled />
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
import * as RegularApplyApi from '@/api/oa/regular'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

function createDefaultForm() {
  return {
    title: undefined,
    urgency: undefined,
    startTime: undefined,
    endTime: undefined,
    experience: undefined,
    understanding: undefined,
    growth: undefined,
    deficiency: undefined,
    improvement: undefined,
    suggestion: undefined
  }
}

export default {
  name: 'OaRegularApplyForm',
  components: { Dialog },
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
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
        experience: [
          { required: true, whitespace: true, message: '试用期心得不能为空', trigger: 'blur' }
        ],
        understanding: [
          { required: true, whitespace: true, message: '岗位职责理解不能为空', trigger: 'blur' }
        ],
        growth: [
          { required: true, whitespace: true, message: '试用期成长不能为空', trigger: 'blur' }
        ],
        deficiency: [
          { required: true, whitespace: true, message: '目前不足不能为空', trigger: 'blur' }
        ],
        improvement: [
          { required: true, whitespace: true, message: '工作改进不能为空', trigger: 'blur' }
        ],
        suggestion: [
          { required: true, whitespace: true, message: '产品意见建议不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    urgencyOptions() {
      return getIntDictOptions(DICT_TYPE.OA_APPLY_URGENCY)
    },
    /** 按申请起止时间计算天数 */
    days() {
      if (!this.formData.startTime || !this.formData.endTime) {
        return undefined
      }
      const value = dayjs(Number(this.formData.endTime)).diff(
        dayjs(Number(this.formData.startTime)),
        'day',
        true
      )
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
        return RegularApplyApi.getRegularApply(id).then(response => {
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
          ? RegularApplyApi.createRegularApply(this.formData)
          : RegularApplyApi.updateRegularApply(this.formData)
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
