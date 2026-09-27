<template>
  <div class="wm-migrated">
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
          label="条码格式"
          prop="format"
        >
          <el-select
            v-model="formData.format"
            placeholder="请选择条码格式"
            class="wm-w-full"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_BARCODE_FORMAT)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="业务类型"
          prop="bizType"
        >
          <el-select
            v-model="formData.bizType"
            placeholder="请选择业务类型"
            class="wm-w-full"
            :disabled="formType === 'update'"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_BARCODE_BIZ_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="内容格式模板"
          prop="contentFormat"
        >
          <el-input
            v-model="formData.contentFormat"
            placeholder="支持{BUSINESSCODE}占位符，如：WH-{BUSINESSCODE}"
            class="wm-w-full"
          />
        </el-form-item>
        <el-form-item
          label="内容样例"
          prop="contentExample"
        >
          <el-input
            v-model="formData.contentExample"
            placeholder="如：WH-WH001"
            class="wm-w-full"
          />
        </el-form-item>
        <el-form-item
          label="自动生成"
          prop="autoGenerateFlag"
        >
          <el-switch v-model="formData.autoGenerateFlag" />
        </el-form-item>
        <!-- TODO @芋艿：后续对接 UReport 报表选择器，实现打印模板选择功能 -->
        <el-form-item
          label="默认打印模板"
          prop="defaultTemplate"
        >
          <el-input
            v-model="formData.defaultTemplate"
            placeholder="请选择打印模板"
            readonly
            class="wm-w-full"
          >
            <template slot="append">
              <el-button @click="handleSelectTemplate">设置</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="formData.status">
            <el-radio
              v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
              :key="dict.value"
              :label="dict.value"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
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
  </div>
</template>

<script>
import { ref, reactive, getCurrentInstance } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { WmBarcodeConfigApi as BarcodeConfigApi } from '@/api/mes/wm/barcode/config'
export default {
  name: 'BarcodeConfigForm',
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
    const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
    const formType = ref('') // 表单的类型：create - 新增；update - 修改
    const formData = ref({
      id: undefined,
      format: undefined,
      bizType: undefined,
      contentFormat: '',
      contentExample: '',
      autoGenerateFlag: true,
      defaultTemplate: '',
      status: 0,
      remark: ''
    })
    const formRules = reactive({
      format: [{ required: true, message: '条码格式不能为空', trigger: 'change' }],
      bizType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
      contentFormat: [{ required: true, message: '内容格式模板不能为空', trigger: 'blur' }],
      autoGenerateFlag: [{ required: true, message: '是否自动生成不能为空', trigger: 'blur' }]
    })
    const formRef = ref() // 表单 Ref
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '新增条码配置' : '修改条码配置'
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await BarcodeConfigApi.getBarcodeConfig(id)).data
        } finally {
          formLoading.value = false
        }
      }
    }
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          (await BarcodeConfigApi.createBarcodeConfig(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await BarcodeConfigApi.updateBarcodeConfig(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 选择打印模板 */
    // TODO @芋艿：后续对接 UReport 报表选择器（reportSelect），实现打印模板选择功能
    const handleSelectTemplate = () => {
      vm.$modal.msgWarning('打印模板选择功能暂未实现，敬请期待')
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        format: undefined,
        bizType: undefined,
        contentFormat: '',
        contentExample: '',
        autoGenerateFlag: true,
        defaultTemplate: '',
        status: 0,
        remark: ''
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, getIntDictOptions, handleSelectTemplate, message, open, resetForm, submitForm, t }
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
