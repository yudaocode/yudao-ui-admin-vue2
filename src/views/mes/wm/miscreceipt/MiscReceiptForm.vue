<template>
  <div class="wm-migrated">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="960px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        :disabled="isDetail"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="入库单编号"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入入库单编号"
                :disabled="isHeaderReadonly"
              >
                <template slot="append">
                  <el-button
                    :disabled="isHeaderReadonly"
                    @click="generateCode"
                  > 生成 </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="入库单名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入入库单名称"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- DONE @AI：业务类型（已使用"杂项类型"标签） -->
            <el-form-item
              label="杂项类型"
              prop="type"
            >
              <el-select
                v-model="formData.type"
                placeholder="请选择杂项类型"
                class="wm-w-full"
                :disabled="isHeaderReadonly"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_MISC_RECEIPT_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="来源单据类型"
              prop="sourceDocType"
            >
              <el-input
                v-model="formData.sourceDocType"
                placeholder="请输入来源单据类型"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="来源单据编码"
              prop="sourceDocCode"
            >
              <el-input
                v-model="formData.sourceDocCode"
                placeholder="请输入来源单据编码"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="入库日期"
              prop="receiptDate"
            >
              <el-date-picker
                v-model="formData.receiptDate"
                type="date"
                value-format="timestamp"
                placeholder="请选择入库日期"
                class="wm-w-full"
                :disabled="isHeaderReadonly"
              />
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
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- 非新建模式展示行项目信息（入库物料） -->
      <template v-if="formData.id">
        <el-divider content-position="center">物料信息</el-divider>
        <MiscReceiptLineList
          :receipt-id="formData.id"
          :form-type="formType"
        />
      </template>
      <span slot="footer">
        <el-button
          v-if="isEditable"
          type="primary"
          :disabled="formLoading"
          @click="submitForm"
        >
          保 存
        </el-button>
        <el-button
          v-if="isEditable && formData.status === MesWmMiscReceiptStatusEnum.PREPARE"
          type="warning"
          :disabled="formLoading"
          @click="handleSubmit"
        >
          提 交
        </el-button>
        <el-button
          v-if="isFinish"
          type="success"
          :disabled="formLoading"
          @click="handleFinish"
        >
          执行入库
        </el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { WmMiscReceiptApi } from '@/api/mes/wm/miscreceipt'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import MiscReceiptLineList from './MiscReceiptLineList.vue'
import { MesAutoCodeRuleCode, MesWmMiscReceiptStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MiscReceiptForm',
  components: { MiscReceiptLineList },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const dialogVisible = ref(false)
    const formLoading = ref(false)
    const formType = ref('create') // create / update / finish / detail
    const isEditable = computed(() => ['create', 'update'].includes(formType.value))
    const isFinish = computed(() => formType.value === 'finish')
    const isDetail = computed(() => ['detail', 'finish'].includes(formType.value))
    const isHeaderReadonly = computed(() => ['detail', 'finish'].includes(formType.value))
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增杂项入库单',
        update: '编辑杂项入库单',
        finish: '执行入库',
        detail: '杂项入库单详情'
      }
      return titles[formType.value] || formType.value
    })
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      type: undefined,
      status: undefined,
      sourceDocType: undefined,
      sourceDocId: undefined,
      sourceDocCode: undefined,
      receiptDate: undefined,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '入库单编号不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '入库单名称不能为空', trigger: 'blur' }],
      type: [{ required: true, message: '杂项类型不能为空', trigger: 'change' }],
      receiptDate: [{ required: true, message: '入库日期不能为空', trigger: 'blur' }]
    })
    const formRef = ref()
    const originalFormData = ref('') // 原始表单数据快照，用于脏检查
    /** 生成入库单编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_MISC_RECEIPT_CODE)).data
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmMiscReceiptApi.getMiscReceipt(id)).data
        } finally {
          formLoading.value = false
        }
      }
      // 保存原始数据快照
      originalFormData.value = JSON.stringify(formData.value)
    }
    /** 保存表单（create/update 模式） */
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          const res = (await WmMiscReceiptApi.createMiscReceipt(data)).data
          message.success('新增成功')
          formData.value.id = res
          formData.value.status = MesWmMiscReceiptStatusEnum.PREPARE
          formType.value = 'update'
        } else {
          (await WmMiscReceiptApi.updateMiscReceipt(data)).data
          message.success('修改成功')
        }
        // 更新快照
        originalFormData.value = JSON.stringify(formData.value)
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 提交操作：表单修改过则先保存，再提交 */
    const handleSubmit = async() => {
      await formRef.value.validate()
      try {
        await message.confirm('确认提交该杂项入库单？【提交后将不能修改】')
        formLoading.value = true
        // 1. 表单有修改时，先保存
        if (JSON.stringify(formData.value) !== originalFormData.value) {
          const data = formData.value;
          (await WmMiscReceiptApi.updateMiscReceipt(data)).data
        }
        // 2. 提交入库单
        (await WmMiscReceiptApi.submitMiscReceipt(formData.value.id)).data
        message.success('提交成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        formLoading.value = false
      }
    }
    /** 执行入库 */
    const handleFinish = async() => {
      try {
        await message.confirm('确认执行入库？执行后将更新库存台账。')
        formLoading.value = true;
        (await WmMiscReceiptApi.finishMiscReceipt(formData.value.id)).data
        message.success('入库成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
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
        status: undefined,
        sourceDocType: undefined,
        sourceDocId: undefined,
        sourceDocCode: undefined,
        receiptDate: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, MesWmMiscReceiptStatusEnum, MiscReceiptLineList, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, handleFinish, handleSubmit, isDetail, isEditable, isFinish, isHeaderReadonly, message, open, originalFormData, resetForm, submitForm }
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
