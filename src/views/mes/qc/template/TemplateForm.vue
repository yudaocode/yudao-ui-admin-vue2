<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
  >
    <!-- 基本信息表单 -->
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="isDetail"
    >
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="方案编号"
            prop="code"
          >
            <el-input
              v-model="formData.code"
              placeholder="请输入方案编号"
            >
              <template slot="append">
                <el-button @click="generateCode"> 生成 </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="方案名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="请输入方案名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-select
              v-model="formData.status"
              placeholder="请选择"
              class="qc-w-full"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="检测种类"
            prop="types"
          >
            <el-select
              v-model="formData.types"
              multiple
              filterable
              placeholder="请选择检测种类"
              class="qc-w-full"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
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
        </el-col>
      </el-row>
    </el-form>

    <!-- 子表标签页（编辑模式下显示） -->
    <template v-if="formData.id">
      <el-divider />
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="检测指标项"
          name="indicator"
        >
          <TemplateIndicatorList :template-id="formData.id" />
        </el-tab-pane>
        <el-tab-pane
          label="产品关联"
          name="item"
        >
          <TemplateItemList :template-id="formData.id" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <span slot="footer">
      <el-button
        v-if="!isDetail"
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { QcTemplateApi } from '@/api/mes/qc/template'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import TemplateIndicatorList from './TemplateIndicatorList.vue'
import TemplateItemList from './TemplateItemList.vue'
export default {
  name: 'TemplateForm',
  components: { TemplateIndicatorList, TemplateItemList },
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
    const activeTab = ref('indicator') // 子表当前激活的 Tab
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      types: [],
      status: CommonStatusEnum.ENABLE,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '方案编号不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
      types: [
        { required: true, message: '检测种类不能为空', trigger: 'change', type: 'array', min: 1 }
      ],
      status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const isDetail = computed(() => formType.value === 'detail') // 表单是否为详情模式（只读）
    /** 生成方案编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.QC_TEMPLATE_CODE)).data
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      formType.value = type
      activeTab.value = 'indicator'
      resetForm()
      // 修改时，设置数据
      if (id) {
        formLoading.value = true
        try {
          const data = (await QcTemplateApi.getTemplate(id)).data
          formData.value = {
            ...data,
            types: data.types
          }
        } finally {
          formLoading.value = false
        }
      }
    }
    const submitForm = async() => {
      // 校验表单
      if (!formRef.value) { return }
      const valid = await formRef.value.validate()
      if (!valid) { return }
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          (await QcTemplateApi.createTemplate(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcTemplateApi.updateTemplate(data)).data
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
        types: [],
        status: CommonStatusEnum.ENABLE,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, TemplateIndicatorList, TemplateItemList, activeTab, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, isDetail, message, open, resetForm, submitForm, t }
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
