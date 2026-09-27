<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1080px"
    append-to-body
  >
    <!-- 基本信息表单 -->
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      :disabled="isDetail"
    >
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="检验单编号"
            prop="code"
          >
            <el-input
              v-model="formData.code"
              placeholder="请输入检验单编号"
            >
              <template slot="append">
                <el-button @click="generateCode"> 生成 </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="检验单名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="请输入检验单名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row
        v-if="formData.sourceDocType"
        :gutter="16"
      >
        <el-col :span="8">
          <el-form-item label="来源单据类型">
            <el-select
              v-model="formData.sourceDocType"
              class="qc-w-full"
              disabled
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_SOURCE_DOC_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="来源单据编号">
            <el-input
              v-model="formData.sourceDocCode"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>物料与供应商</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="产品物料"
            prop="itemId"
          >
            <MdItemSelect
              v-model="formData.itemId"
              placeholder="请选择产品物料"
              class="qc-w-full"
              :disabled="isFromPendingTask || isUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="供应商"
            prop="vendorId"
          >
            <MdVendorSelect
              v-model="formData.vendorId"
              placeholder="请选择供应商"
              class="qc-w-full"
              :disabled="isFromPendingTask"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="供应商批次号"
            prop="vendorBatch"
          >
            <el-input
              v-model="formData.vendorBatch"
              placeholder="请输入供应商批次号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>检测情况</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="本次接收数量"
            prop="receivedQuantity"
          >
            <el-input-number
              v-model="formData.receivedQuantity"
              :min="0"
              :precision="2"
              placeholder="请输入本次接收数量"
              class="qc-w-full"
              :disabled="isFromPendingTask"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="合格品数量"
            prop="qualifiedQuantity"
          >
            <el-input-number
              v-model="formData.qualifiedQuantity"
              :min="0"
              placeholder="请输入合格品数量"
              class="qc-w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="不合格品数量"
            prop="unqualifiedQuantity"
          >
            <el-input-number
              v-model="formData.unqualifiedQuantity"
              :min="0"
              placeholder="请输入不合格品数量"
              class="qc-w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="来料日期"
            prop="receiveDate"
          >
            <el-date-picker
              v-model="formData.receiveDate"
              type="date"
              value-format="timestamp"
              placeholder="请选择来料日期"
              class="qc-w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="检测人员"
            prop="inspectorUserId"
          >
            <UserSelectV2
              v-model="formData.inspectorUserId"
              placeholder="请选择检测人员"
              class="qc-w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="检测日期"
            prop="inspectDate"
          >
            <el-date-picker
              v-model="formData.inspectDate"
              type="date"
              value-format="timestamp"
              placeholder="请选择检测日期"
              class="qc-w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="检测结果"
            prop="checkResult"
          >
            <el-select
              v-model="formData.checkResult"
              placeholder="请选择检测结果"
              clearable
              class="qc-w-full"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_CHECK_RESULT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
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

      <!-- 缺陷统计（只读） -->
      <el-divider>缺陷情况</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="致命缺陷数">
            <el-input
              :value="formData.criticalQuantity"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="严重缺陷数">
            <el-input
              :value="formData.majorQuantity"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="轻微缺陷数">
            <el-input
              :value="formData.minorQuantity"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="致命缺陷率">
            <el-input
              :value="formData.criticalRate + '%'"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="严重缺陷率">
            <el-input
              :value="formData.majorRate + '%'"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="轻微缺陷率">
            <el-input
              :value="formData.minorRate + '%'"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 子表标签页（编辑/详情模式下显示） -->
    <template v-if="formData.id">
      <el-divider />
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="检验项"
          name="line"
        >
          <IqcLineList
            :iqc-id="formData.id"
            :form-type="formType"
          />
        </el-tab-pane>
        <el-tab-pane
          label="检测结果"
          name="result"
        >
          <QcIndicatorResultList
            :qc-id="formData.id"
            :qc-type="MesQcTypeEnum.IQC"
          />
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
        保 存
      </el-button>
      <el-button
        v-if="formType === 'update' && formData.status === MesQcStatusEnum.DRAFT"
        type="success"
        :disabled="formLoading"
        @click="handleFinish"
      >
        完 成
      </el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { QcIqcApi } from '@/api/mes/qc/iqc'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import IqcLineList from './IqcLineList.vue'
import QcIndicatorResultList from '@/views/mes/qc/indicatorresult/components/QcIndicatorResultList.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { MesQcTypeEnum, MesQcStatusEnum, MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
export default {
  name: 'IqcForm',
  components: { MdVendorSelect, MdItemSelect, IqcLineList, QcIndicatorResultList, UserSelectV2 },
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
    const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
    const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
    const activeTab = ref('line') // 当前激活的标签页
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增来料检验单',
        update: '修改来料检验单',
        detail: '查看来料检验单'
      }
      return titles[formType.value] || t('action.' + formType.value)
    }) // 弹窗标题，根据 formType 自动显示
    const isDetail = computed(() => formType.value === 'detail') // 表单是否为详情模式（只读）
    const isUpdate = computed(() => formType.value === 'update') // 表单是否为修改模式
    const isFromPendingTask = computed(() => formType.value === 'create' && formData.value.sourceDocId != null) // 是否来自待检任务（有预填的来源单据信息）
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      status: undefined,
      sourceDocType: undefined,
      sourceDocId: undefined,
      sourceLineId: undefined,
      sourceDocCode: undefined,
      vendorId: undefined,
      vendorBatch: undefined,
      itemId: undefined,
      receivedQuantity: undefined,
      qualifiedQuantity: undefined,
      unqualifiedQuantity: undefined,
      inspectorUserId: undefined,
      inspectDate: undefined,
      checkResult: undefined,
      receiveDate: undefined,
      remark: undefined,
      // 缺陷统计（只读）
      criticalRate: 0,
      majorRate: 0,
      minorRate: 0,
      criticalQuantity: 0,
      majorQuantity: 0,
      minorQuantity: 0
    })
    const formRules = reactive({
      code: [{ required: true, message: '检验单编号不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '检验单名称不能为空', trigger: 'blur' }],
      vendorId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
      itemId: [{ required: true, message: '产品物料不能为空', trigger: 'change' }],
      receivedQuantity: [{ required: true, message: '本次接收数量不能为空', trigger: 'blur' }],
      qualifiedQuantity: [{ required: true, message: '合格品数量不能为空', trigger: 'blur' }],
      unqualifiedQuantity: [{ required: true, message: '不合格品数量不能为空', trigger: 'blur' }],
      receiveDate: [{ required: true, message: '来料日期不能为空', trigger: 'change' }],
      inspectorUserId: [{ required: true, message: '检测人员不能为空', trigger: 'change' }],
      inspectDate: [{ required: true, message: '检测日期不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const originalFormData = ref('') // 原始表单数据快照，用于脏检查
    /** 生成检验单编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.QC_IQC_CODE)).data
    }
    /** 打开弹窗 */
    const open = async(type, id, data) => {
      dialogVisible.value = true
      formType.value = type
      activeTab.value = 'line'
      resetForm()
      // 修改时，设置数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await QcIqcApi.getIqc(id)).data
        } finally {
          formLoading.value = false
        }
      } else if (data) {
        // 预填模式：来自待检任务（pending inspect）
        Object.assign(formData.value, data)
      }
      // 保存原始数据快照
      originalFormData.value = JSON.stringify(formData.value)
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
          (await QcIqcApi.createIqc(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcIqcApi.updateIqc(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        // 发送操作成功的事件
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 完成操作：表单修改过则先保存，再完成 */
    const handleFinish = async() => {
      // 校验表单
      if (!formRef.value) { return }
      const valid = await formRef.value.validate()
      if (!valid) { return }
      try {
        await message.confirm('是否完成来料检验单编制？【完成后将不能更改】')
        formLoading.value = true
        // 1. 表单有修改时，先保存
        if (JSON.stringify(formData.value) !== originalFormData.value) {
          const data = formData.value;
          (await QcIqcApi.updateIqc(data)).data
        }
        // 2. 完成检验单
        (await QcIqcApi.finishIqc(formData.value.id)).data
        message.success('完成成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
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
        status: undefined,
        sourceDocType: undefined,
        sourceDocId: undefined,
        sourceLineId: undefined,
        sourceDocCode: undefined,
        vendorId: undefined,
        vendorBatch: undefined,
        itemId: undefined,
        receivedQuantity: undefined,
        qualifiedQuantity: undefined,
        unqualifiedQuantity: undefined,
        inspectorUserId: undefined,
        inspectDate: undefined,
        checkResult: undefined,
        receiveDate: undefined,
        remark: undefined,
        criticalRate: 0,
        majorRate: 0,
        minorRate: 0,
        criticalQuantity: 0,
        majorQuantity: 0,
        minorQuantity: 0
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, IqcLineList, MdItemSelect, MdVendorSelect, MesQcStatusEnum, MesQcTypeEnum, QcIndicatorResultList, UserSelectV2, activeTab, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, handleFinish, isDetail, isFromPendingTask, isUpdate, message, open, originalFormData, resetForm, submitForm, t }
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
