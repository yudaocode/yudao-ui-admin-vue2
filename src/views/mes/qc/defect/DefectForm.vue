<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    append-to-body
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item
        label="缺陷编码"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          placeholder="请输入缺陷编码"
        >
          <template slot="append">
            <el-button @click="generateCode"> 生成 </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="缺陷描述"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          type="textarea"
          placeholder="请输入缺陷描述"
        />
      </el-form-item>
      <el-form-item
        label="检测项类型"
        prop="type"
      >
        <el-select
          v-model="formData.type"
          placeholder="请选择检测项类型"
          clearable
          class="qc-w-full"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MES_INDICATOR_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="缺陷等级"
        prop="level"
      >
        <el-select
          v-model="formData.level"
          placeholder="请选择缺陷等级"
          clearable
          class="qc-w-full"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MES_DEFECT_LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ref, reactive, getCurrentInstance } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { QcDefectApi } from '@/api/mes/qc/defect'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
export default {
  name: 'DefectForm',
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args) // 国际化
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    } // 消息弹窗
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('') // 表单的类型：create - 新增；update - 修改
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      type: undefined,
      level: undefined,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '缺陷编码不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '缺陷描述不能为空', trigger: 'blur' }],
      type: [{ required: true, message: '检测项类型不能为空', trigger: 'change' }],
      level: [{ required: true, message: '缺陷等级不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    /** 生成缺陷编码 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.QC_DEFECT_CODE)).data
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      formType.value = type
      resetForm()
      // 修改时，设置数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await QcDefectApi.getDefect(id)).data
        } finally {
          formLoading.value = false
        }
      }
    }
    /** 提交表单 */
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          (await QcDefectApi.createDefect(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcDefectApi.updateDefect(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        // 发送操作成功的事件
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        code: undefined,
        name: undefined,
        type: undefined,
        level: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, message, open, resetForm, submitForm, t }
  }
}
</script>

<style scoped>
.qc-content-wrap { margin-bottom: 20px; }
.qc-w-full { width: 100%; }
.qc-w-240 { width: 240px; }
.qc-w-220 { width: 220px; }
.qc-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
.mb-10px { margin-bottom: 10px; }
.mt-10px { margin-top: 10px; }
.-mb-15px { margin-bottom: -15px; }
.overflow-hidden { overflow: hidden; }
</style>

