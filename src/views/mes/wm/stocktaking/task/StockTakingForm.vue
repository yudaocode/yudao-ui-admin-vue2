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
              label="任务编码"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入任务编码"
                :disabled="isDetail"
              >
                <template slot="append">
                  <el-button @click="generateCode">生成</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="任务名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入任务名称"
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="盘点方案"
              prop="planId"
            >
              <StockTakingPlanSelect
                v-model="formData.planId"
                :disabled="isDetail"
                @change="handlePlanChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="盘点类型"
              prop="type"
            >
              <el-select
                v-model="formData.type"
                placeholder="请选择盘点类型"
                class="wm-w-full"
                :disabled="isDetail"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_STOCK_TAKING_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.type === MesWmStockTakingTypeEnum.DYNAMIC"
            :span="8"
          >
            <el-form-item
              label="开始时间"
              prop="startTime"
            >
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                value-format="timestamp"
                placeholder="请选择开始时间"
                class="wm-w-full"
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.type === MesWmStockTakingTypeEnum.DYNAMIC"
            :span="8"
          >
            <el-form-item
              label="结束时间"
              prop="endTime"
            >
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                value-format="timestamp"
                placeholder="请选择结束时间"
                class="wm-w-full"
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="盘点日期"
              prop="takingDate"
            >
              <el-date-picker
                v-model="formData.takingDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择盘点日期"
                class="wm-w-full"
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="是否盲盘"
              prop="blindFlag"
            >
              <el-switch
                v-model="formData.blindFlag"
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="是否冻结库存"
              prop="frozen"
            >
              <el-switch
                v-model="formData.frozen"
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="盘点人"
              prop="userId"
            >
              <UserSelectV2
                v-model="formData.userId"
                :disabled="isDetail"
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
                :disabled="isDetail"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-tabs
        v-if="formData.id"
        v-model="activeTab"
        type="border-card"
        class="mt-16px"
      >
        <el-tab-pane
          v-if="!formData.blindFlag"
          label="盘点清单"
          name="lines"
        >
          <StockTakingTaskLineList
            :task-id="formData.id"
            :form-type="formType"
          />
        </el-tab-pane>
        <el-tab-pane
          v-if="resultVisible || isExecute"
          label="盘点结果"
          name="results"
        >
          <StockTakingTaskResultList
            ref="resultListRef"
            :task-id="formData.id"
            :form-type="isExecute ? 'execute' : 'detail'"
          />
        </el-tab-pane>
      </el-tabs>

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
          v-if="isEditable && formData.status === MesWmStockTakingTaskStatusEnum.PREPARE"
          type="warning"
          :disabled="formLoading"
          @click="handleSubmit"
        >
          提 交
        </el-button>
        <el-button
          v-if="isSubmit"
          type="warning"
          :disabled="formLoading"
          @click="handleSubmit"
        >
          提 交
        </el-button>
        <el-button
          v-if="isExecute"
          type="primary"
          :disabled="formLoading"
          @click="handleExecute"
        >
          执行盘点
        </el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { StockTakingApi } from '@/api/mes/wm/stocktaking/task/index'
import StockTakingPlanSelect from '@/views/mes/wm/stocktaking/plan/components/StockTakingPlanSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import StockTakingTaskLineList from './StockTakingTaskLineList.vue'
import StockTakingTaskResultList from './StockTakingTaskResultList.vue'
import { MesAutoCodeRuleCode, MesWmStockTakingTypeEnum, MesWmStockTakingTaskStatusEnum } from '@/views/mes/utils/constants'
import { getCurrentUserId } from '@/utils/auth'
export default {
  name: 'StockTakingForm',
  components: { StockTakingPlanSelect, UserSelectV2, StockTakingTaskLineList, StockTakingTaskResultList },
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
    const t = (...args) => vm.$t(...args) // 国际化
    const dialogVisible = ref(false) // 弹窗的是否展示
    const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
    const formType = ref('create') // 表单的类型：create / update / submit / execute / detail
    const isEditable = computed(() => ['create', 'update'].includes(formType.value)) // 是否为编辑模式
    const isSubmit = computed(() => formType.value === 'submit') // 是否为提交模式
    const isExecute = computed(() => formType.value === 'execute') // 是否为执行盘点模式
    const isDetail = computed(() => ['detail', 'submit', 'execute'].includes(formType.value)) // 是否只读
    const resultVisible = computed(() => formData.value.status && formData.value.status !== MesWmStockTakingTaskStatusEnum.PREPARE)
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增盘点任务',
        update: '编辑盘点任务',
        submit: '提交盘点任务',
        execute: '执行盘点',
        detail: '盘点任务详情'
      }
      return titles[formType.value] || formType.value
    }) // 弹窗的标题
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      takingDate: undefined,
      type: undefined,
      status: undefined,
      userId: undefined,
      userNickname: undefined,
      planId: undefined,
      startTime: undefined,
      endTime: undefined,
      blindFlag: false,
      frozen: false,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '任务编码不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
      planId: [{ required: true, message: '盘点方案不能为空', trigger: 'change' }],
      type: [{ required: true, message: '盘点类型不能为空', trigger: 'change' }],
      takingDate: [{ required: true, message: '盘点日期不能为空', trigger: 'change' }],
      blindFlag: [{ required: true, message: '是否盲盘不能为空', trigger: 'change' }],
      frozen: [{ required: true, message: '是否冻结库存不能为空', trigger: 'change' }],
      userId: [{ required: true, message: '盘点人不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const activeTab = ref('lines') // 当前激活的 tab
    const originalFormData = ref('') // 原始表单数据快照，用于脏检查
    /** 生成任务编码 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_STOCK_TAKING_CODE)).data
    }
    /** 方案变化处理 */
    const handlePlanChange = (plan) => {
      if (!plan) {
        return
      }
      formData.value.name = plan.name
      formData.value.type = plan.type
      formData.value.startTime = plan.startTime
      formData.value.endTime = plan.endTime
      formData.value.blindFlag = !!plan.blindFlag
      formData.value.frozen = !!plan.frozen
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      formType.value = type
      activeTab.value = type === 'execute' ? 'results' : 'lines'
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await StockTakingApi.getStockTaking(id)).data
        } finally {
          formLoading.value = false
        }
      } else {
        // 新建时，默认设置当前登录用户为盘点人
        formData.value.userId = getCurrentUserId()
      }
      // 保存原始数据快照
      originalFormData.value = JSON.stringify(formData.value)
    }
    /** 提交表单（create/update 模式） */
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          const res = (await StockTakingApi.createStockTaking(data)).data
          message.success(t('common.createSuccess'))
          // 创建成功后，更新表单数据和状态为编辑模式
          formData.value.id = res
          formData.value.status = MesWmStockTakingTaskStatusEnum.PREPARE
          formType.value = 'update'
        } else {
          (await StockTakingApi.updateStockTaking(data)).data
          message.success(t('common.updateSuccess'))
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
      try {
        await message.confirm('确认提交该盘点任务？【提交后将不能修改】')
        formLoading.value = true
        // 1. 编辑模式下，表单有修改时先保存
        if (isEditable.value && JSON.stringify(formData.value) !== originalFormData.value) {
          const data = formData.value;
          (await StockTakingApi.updateStockTaking(data)).data
        }
        // 2. 提交任务
        (await StockTakingApi.submitStockTaking(formData.value.id)).data
        message.success('提交成功')
        dialogVisible.value = false
        emit('success')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        formLoading.value = false
      }
    }
    /** 执行盘点 */
    const handleExecute = async() => {
      try {
        await message.confirm('确认执行盘点操作？')
        formLoading.value = true;
        (await StockTakingApi.finishStockTaking(formData.value.id)).data
        message.success('执行盘点成功')
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
        takingDate: undefined,
        type: undefined,
        status: undefined,
        userId: undefined,
        userNickname: undefined,
        planId: undefined,
        startTime: undefined,
        endTime: undefined,
        blindFlag: false,
        frozen: false,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, MesWmStockTakingTaskStatusEnum, MesWmStockTakingTypeEnum, StockTakingPlanSelect, StockTakingTaskLineList, StockTakingTaskResultList, UserSelectV2, activeTab, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, handleExecute, handlePlanChange, handleSubmit, isDetail, isEditable, isExecute, isSubmit, message, open, originalFormData, resetForm, resultVisible, submitForm, t }
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
