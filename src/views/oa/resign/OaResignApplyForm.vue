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
      label-width="180px"
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
      <el-form-item label="工作交接人" prop="handoverUserId">
        <user-select-v2 v-model="formData.handoverUserId" placeholder="请选择工作交接人" style="width: 100%" />
      </el-form-item>
      <el-form-item label="未完成事宜" prop="unfinishedWork">
        <el-input
          v-model="formData.unfinishedWork"
          placeholder="请输入未完成事宜"
          type="textarea"
          :rows="3"
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
      <el-form-item label="是否有费用报销未完成" prop="hasPendingReimbursement">
        <el-checkbox v-model="formData.hasPendingReimbursement">有费用报销未完成</el-checkbox>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import * as ResignApplyApi from '@/api/oa/resign'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

function createDefaultForm() {
  return {
    title: undefined,
    urgency: undefined,
    handoverUserId: undefined,
    unfinishedWork: undefined,
    reason: undefined,
    hasPendingReimbursement: false
  }
}

export default {
  name: 'OaResignApplyForm',
  components: { Dialog, UserSelectV2 },
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
        handoverUserId: [{ required: true, message: '工作交接人不能为空', trigger: 'change' }],
        unfinishedWork: [{ required: true, message: '未完成事宜不能为空', trigger: 'blur' }],
        reason: [{ required: true, message: '申请原因不能为空', trigger: 'blur' }],
        hasPendingReimbursement: [
          { required: true, message: '是否有费用报销未完成不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    urgencyOptions() {
      return getIntDictOptions(DICT_TYPE.OA_APPLY_URGENCY)
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
        return ResignApplyApi.getResignApply(id).then(response => {
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
          ? ResignApplyApi.createResignApply(this.formData)
          : ResignApplyApi.updateResignApply(this.formData)
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
