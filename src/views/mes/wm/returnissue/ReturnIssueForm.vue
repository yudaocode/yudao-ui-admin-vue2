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
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="退料单编号"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入退料单编号"
                :disabled="isHeaderReadonly"
              >
                <template slot="append">
                  <el-button @click="generateCode"> 生成 </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="退料单名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入退料单名称"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="退料类型"
              prop="type"
            >
              <el-select
                v-model="formData.type"
                placeholder="请选择退料类型"
                :disabled="isHeaderReadonly"
                class="wm-w-full"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_RETURN_ISSUE_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="生产工单"
              prop="workOrderId"
            >
              <ProWorkOrderSelect
                v-model="formData.workOrderId"
                :status="MesProWorkOrderStatusEnum.CONFIRMED"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="工作站"
              prop="workstationId"
            >
              <MdWorkstationSelect
                v-model="formData.workstationId"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="退料日期"
              prop="returnDate"
            >
              <el-date-picker
                v-model="formData.returnDate"
                type="datetime"
                value-format="timestamp"
                placeholder="选择退料日期"
                :disabled="isHeaderReadonly"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
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
      <!-- 非新建模式展示行项目信息（退料物料） -->
      <template v-if="formData.id">
        <el-divider content-position="center">物料信息</el-divider>
        <ReturnIssueLineList
          :issue-id="formData.id"
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
          v-if="isEditable && formData.status === MesWmReturnIssueStatusEnum.PREPARE"
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
          入库上架
        </el-button>
        <el-button
          v-if="isFinish"
          type="success"
          :disabled="formLoading"
          @click="handleFinish"
        >
          执行退料
        </el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { WmReturnIssueApi } from '@/api/mes/wm/returnissue'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode, MesProWorkOrderStatusEnum, MesWmReturnIssueStatusEnum } from '@/views/mes/utils/constants'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import ReturnIssueLineList from './ReturnIssueLineList.vue'
export default {
  name: 'ReturnIssueForm',
  components: { ProWorkOrderSelect, MdWorkstationSelect, ReturnIssueLineList },
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
    const isStock = computed(() => formType.value === 'stock') // 是否为入库上架模式
    const isFinish = computed(() => formType.value === 'finish') // 是否为执行退料模式
    const isHeaderReadonly = computed(() => ['stock', 'detail', 'finish'].includes(formType.value)) // 表头是否只读
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增生产退料单',
        update: '编辑生产退料单',
        stock: '入库上架',
        finish: '执行退料',
        detail: '生产退料单详情'
      }
      return titles[formType.value] || formType.value
    })
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      status: undefined,
      workOrderId: undefined,
      workstationId: undefined,
      type: undefined,
      returnDate: undefined,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '退料单编号不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '退料单名称不能为空', trigger: 'blur' }],
      type: [{ required: true, message: '退料类型不能为空', trigger: 'change' }],
      workOrderId: [{ required: true, message: '生产工单不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const originalFormData = ref('') // 原始表单数据快照，用于脏检查
    /** 生成退料单编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_RETURN_ISSUE_CODE)).data
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
          formData.value = (await WmReturnIssueApi.getReturnIssue(id)).data
        } finally {
          formLoading.value = false
        }
      }
      // 保存原始数据快照
      originalFormData.value = JSON.stringify(formData.value)
    }
    /** 保存表单（create/update 模式的保存按钮） */
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          const res = (await WmReturnIssueApi.createReturnIssue(data)).data
          message.success('新增成功')
          // 创建成功后，更新表单数据和状态为编辑模式
          formData.value.id = res
          formData.value.status = MesWmReturnIssueStatusEnum.PREPARE
          formType.value = 'update'
        } else {
          (await WmReturnIssueApi.updateReturnIssue(data)).data
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
        await message.confirm('确认提交该退料单？【提交后将不能修改】')
        formLoading.value = true
        // 1. 表单有修改时，先保存
        if (JSON.stringify(formData.value) !== originalFormData.value) {
          const data = formData.value;
          (await WmReturnIssueApi.updateReturnIssue(data)).data
        }
        // 2. 提交退料单
        (await WmReturnIssueApi.submitReturnIssue(formData.value.id)).data
        message.success('提交成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        formLoading.value = false
      }
    }
    /** 入库上架 */
    const handleStock = async() => {
      try {
        formLoading.value = true;
        (await WmReturnIssueApi.stockReturnIssue(formData.value.id)).data
        message.success('入库上架成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        formLoading.value = false
      }
    }
    /** 执行退料 */
    const handleFinish = async() => {
      try {
        await message.confirm('确认完成该退料单并执行入库吗？')
        formLoading.value = true;
        (await WmReturnIssueApi.finishReturnIssue(formData.value.id)).data
        message.success('完成成功')
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
        workOrderId: undefined,
        workstationId: undefined,
        type: undefined,
        returnDate: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, MdWorkstationSelect, MesProWorkOrderStatusEnum, MesWmReturnIssueStatusEnum, ProWorkOrderSelect, ReturnIssueLineList, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, handleFinish, handleStock, handleSubmit, isEditable, isFinish, isHeaderReadonly, isStock, message, open, originalFormData, resetForm, submitForm }
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
