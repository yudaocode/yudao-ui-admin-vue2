<template>
  <div class="wm-migrated">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="'生成 SN 码'"
      width="600px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item
          label="物料"
          prop="itemId"
        >
          <MdItemSelect v-model="formData.itemId" />
        </el-form-item>
        <el-form-item
          label="批次号"
          prop="batchCode"
        >
          <el-input
            v-model="formData.batchCode"
            placeholder="请输入批次号"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item
          label="生成数量"
          prop="count"
        >
          <el-input-number
            v-model="formData.count"
            :min="1"
            :max="1000"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="formLoading"
          @click="submitForm"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, getCurrentInstance } from 'vue'
import * as WmSnApi from '@/api/mes/wm/sn'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
export default {
  name: 'WmSnGenerateForm',
  components: { MdItemSelect },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    } // 消息弹窗
    const dialogVisible = ref(false) // 弹窗的是否展示
    const formLoading = ref(false) // 表单的加载中：提交的按钮禁用
    const formData = ref({
      // 表单数据
      itemId: undefined,
      batchCode: undefined,
      workOrderId: undefined,
      count: 100
    })
    const formRules = reactive({
      // 表单校验
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      count: [{ required: true, message: '生成数量不能为空', trigger: 'blur' }]
    })
    const formRef = ref() // 表单 Ref
    /** 打开弹窗 */
    const open = () => {
      dialogVisible.value = true
      resetForm()
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        itemId: undefined,
        batchCode: undefined,
        workOrderId: undefined,
        count: 100
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 提交表单 */
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        (await WmSnApi.generateSnCodes(formData.value)).data
        message.success('生成成功')
        dialogVisible.value = false
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    return { MdItemSelect, dialogVisible, formData, formLoading, formRef, formRules, message, open, resetForm, submitForm }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
