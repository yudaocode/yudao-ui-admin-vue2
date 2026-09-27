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
        label="检测项编码"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          placeholder="请输入检测项编码"
          :maxlength="64"
        >
          <template slot="append">
            <el-button @click="generateCode"> 生成 </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="检测项名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入检测项名称"
          :maxlength="100"
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
        label="检测工具"
        prop="tool"
      >
        <el-input
          v-model="formData.tool"
          placeholder="请输入检测工具"
          :maxlength="100"
        />
      </el-form-item>
      <el-form-item
        label="结果值类型"
        prop="resultType"
      >
        <el-select
          v-model="formData.resultType"
          placeholder="请选择结果值类型"
          clearable
          class="qc-w-full"
          @change="handleResultTypeChange"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_RESULT_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <!-- 动态显示：FILE 类型 -->
      <el-form-item
        v-if="formData.resultType === MesQcResultValueType.FILE"
        label="文件类型"
        prop="resultSpecification"
      >
        <el-radio-group v-model="formData.resultSpecification">
          <el-radio label="IMG">图片/照片</el-radio>
          <el-radio label="FILE">文件</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 动态显示：DICT 类型 -->
      <el-form-item
        v-else-if="formData.resultType === MesQcResultValueType.DICT"
        label="字典类型"
        prop="resultSpecification"
      >
        <el-select
          v-model="formData.resultSpecification"
          placeholder="请选择字典类型"
          filterable
          class="qc-w-full"
        >
          <el-option
            v-for="dictType in dictTypeList"
            :key="dictType.type"
            :label="dictType.name"
            :value="dictType.type"
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
          :maxlength="250"
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
import { QcIndicatorApi } from '@/api/mes/qc/indicator'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { getSimpleDictTypeList } from '@/api/system/dict/type'
import { MesAutoCodeRuleCode, MesQcResultValueType } from '@/views/mes/utils/constants'
export default {
  name: 'IndicatorForm',
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
      tool: undefined,
      resultType: undefined,
      resultSpecification: undefined,
      remark: undefined
    })
    const formRules = reactive({
      code: [
        { required: true, message: '检测项编码不能为空', trigger: 'blur' },
        { max: 64, message: '检测项编码长度不能超过 64 个字符', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '检测项名称不能为空', trigger: 'blur' },
        { max: 100, message: '检测项名称长度不能超过 100 个字符', trigger: 'blur' }
      ],
      type: [{ required: true, message: '检测项类型不能为空', trigger: 'change' }],
      resultType: [{ required: true, message: '结果值类型不能为空', trigger: 'change' }],
      resultSpecification: [{ required: true, message: '结果值属性不能为空', trigger: 'change' }],
      remark: [{ max: 250, message: '备注长度不能超过 250 个字符', trigger: 'blur' }]
    })
    const formRef = ref() // 表单 Ref
    const dictTypeList = ref([]) // 系统字典类型列表
    /** 生成检测项编码 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.QC_INDICATOR_CODE)).data
    }
    /** 结果值类型变更时清空结果值属性 */
    const handleResultTypeChange = () => {
      formData.value.resultSpecification = undefined
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      formType.value = type
      resetForm()
      // 加载字典类型列表（供 DICT 类型选择使用）
      if (dictTypeList.value.length === 0) {
        dictTypeList.value = (await getSimpleDictTypeList()).data
      }
      // 修改时，设置数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await QcIndicatorApi.getIndicator(id)).data
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
          (await QcIndicatorApi.createIndicator(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcIndicatorApi.updateIndicator(data)).data
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
        tool: undefined,
        resultType: undefined,
        resultSpecification: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, MesQcResultValueType, dialogTitle, dialogVisible, dictTypeList, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, handleResultTypeChange, message, open, resetForm, submitForm, t }
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
