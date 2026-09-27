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
            <el-form-item
              label="外协工单"
              prop="workOrderId"
            >
              <ProWorkOrderSelect
                v-model="formData.workOrderId"
                :type="MesProWorkOrderTypeEnum.OUTSOURCE"
                :status="MesProWorkOrderStatusEnum.CONFIRMED"
                :disabled="isHeaderReadonly"
                @change="handleWorkOrderChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="供应商"
              prop="vendorId"
            >
              <MdVendorSelect
                v-model="formData.vendorId"
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
        <OutsourceReceiptLineList
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
          v-if="isEditable && formData.status === MesWmOutsourceReceiptStatusEnum.PREPARE"
          type="warning"
          :disabled="formLoading"
          @click="handleSubmit"
        >
          提 交
        </el-button>
        <el-button
          v-if="isStock"
          type="primary"
          :disabled="formLoading"
          @click="handleStock"
        >
          执行上架
        </el-button>
        <el-button
          v-if="isFinish"
          type="success"
          :disabled="formLoading"
          @click="handleFinish"
        >
          完成入库
        </el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { WmOutsourceReceiptApi } from '@/api/mes/wm/outsourcereceipt'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import OutsourceReceiptLineList from './OutsourceReceiptLineList.vue'
import { MesProWorkOrderTypeEnum, MesProWorkOrderStatusEnum, MesWmOutsourceReceiptStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'OutsourceReceiptForm',
  components: { MdVendorSelect, ProWorkOrderSelect, OutsourceReceiptLineList },
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
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('create') // 表单的类型：create / update / stock / finish / detail
    const isEditable = computed(() => ['create', 'update'].includes(formType.value)) // 是否为编辑模式
    const isStock = computed(() => formType.value === 'stock') // 是否为上架模式
    const isFinish = computed(() => formType.value === 'finish') // 是否为完成入库模式
    const isDetail = computed(() => ['detail', 'finish'].includes(formType.value)) // 是否为详情模式
    const isHeaderReadonly = computed(() => ['stock', 'detail', 'finish'].includes(formType.value)) // 是否只读
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增外协入库单',
        update: '编辑外协入库单',
        stock: '执行上架',
        finish: '完成入库',
        detail: '外协入库单详情'
      }
      return titles[formType.value] || formType.value
    })
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      status: undefined,
      vendorId: undefined,
      workOrderId: undefined,
      receiptDate: undefined,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '入库单编号不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '入库单名称不能为空', trigger: 'blur' }],
      workOrderId: [{ required: true, message: '请选择外协工单', trigger: 'change' }],
      receiptDate: [{ required: true, message: '入库日期不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const originalFormData = ref('') // 原始表单数据快照，用于脏检查
    /** 生成入库单编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode('WM_OUTSOURCE_RECEIPT_CODE')).data
    }
    /** 工单选中回调 —— 自动回填供应商 */
    const handleWorkOrderChange = (workOrder) => {
      var _a
      formData.value.vendorId = (_a = workOrder === null || workOrder === void 0 ? void 0 : workOrder.vendorId) !== null && _a !== void 0 ? _a : undefined
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      formType.value = type
      resetForm()
      // 修改/上架/完成/详情时，加载数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmOutsourceReceiptApi.getOutsourceReceipt(id)).data
        } finally {
          formLoading.value = false
        }
      }
      // 保存原始数据快照
      originalFormData.value = JSON.stringify(formData.value)
    }
    /** 提交表单（create/update 模式） */
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          const res = (await WmOutsourceReceiptApi.createOutsourceReceipt(data)).data
          message.success('新增成功')
          // 创建成功后，更新表单数据和状态为编辑模式
          formData.value.id = res
          formData.value.status = MesWmOutsourceReceiptStatusEnum.PREPARE
          formType.value = 'update'
        } else {
          (await WmOutsourceReceiptApi.updateOutsourceReceipt(data)).data
          message.success('修改成功')
        }
        // 更新快照
        originalFormData.value = JSON.stringify(formData.value)
        // 发送操作成功的事件
        emit('success')
      } finally {
        formLoading.value = false
      }
    }
    /** 提交操作：表单修改过则先保存，再提交 */
    const handleSubmit = async() => {
      // 校验表单
      await formRef.value.validate()
      try {
        await message.confirm('确认提交该外协入库单？【提交后将不能修改】')
        formLoading.value = true
        // 1. 表单有修改时，先保存
        if (JSON.stringify(formData.value) !== originalFormData.value) {
          const data = formData.value;
          (await WmOutsourceReceiptApi.updateOutsourceReceipt(data)).data
        }
        // 2. 提交入库单
        (await WmOutsourceReceiptApi.submitOutsourceReceipt(formData.value.id)).data
        message.success('提交成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        formLoading.value = false
      }
    }
    /** 执行上架 */
    const handleStock = async() => {
      try {
        await message.confirm('确认执行上架？')
        formLoading.value = true;
        (await WmOutsourceReceiptApi.stockOutsourceReceipt(formData.value.id)).data
        message.success('上架成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        formLoading.value = false
      }
    }
    /** 完成入库 */
    const handleFinish = async() => {
      try {
        await message.confirm('确认完成入库？完成后将更新库存台账。')
        formLoading.value = true;
        (await WmOutsourceReceiptApi.finishOutsourceReceipt(formData.value.id)).data
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
        status: undefined,
        vendorId: undefined,
        workOrderId: undefined,
        receiptDate: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { MdVendorSelect, MesProWorkOrderStatusEnum, MesProWorkOrderTypeEnum, MesWmOutsourceReceiptStatusEnum, OutsourceReceiptLineList, ProWorkOrderSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, handleFinish, handleStock, handleSubmit, handleWorkOrderChange, isDetail, isEditable, isFinish, isHeaderReadonly, isStock, message, open, originalFormData, resetForm, submitForm }
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
