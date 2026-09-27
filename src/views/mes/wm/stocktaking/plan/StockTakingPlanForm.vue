<template>
  <div class="wm-migrated">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1100px"
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
              label="方案编码"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入方案编码"
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
              label="方案名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入方案名称"
                :disabled="isDetail"
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
            :span="12"
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
            :span="12"
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
              label="冻结库存"
              prop="frozen"
            >
              <el-switch
                v-model="formData.frozen"
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

      <!-- 编辑或详情时展示盘点参数 -->
      <template v-if="(formType === 'update' || formType === 'detail') && formData.id">
        <el-divider content-position="center">盘点参数</el-divider>
        <StockTakingPlanParamList
          :plan-id="formData.id"
          :disabled="formType === 'detail'"
        />
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
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { StockTakingPlanApi } from '@/api/mes/wm/stocktaking/plan/index'
import StockTakingPlanParamList from './StockTakingPlanParamList.vue'
import { MesAutoCodeRuleCode, MesWmStockTakingTypeEnum } from '@/views/mes/utils/constants'
export default {
  name: 'StockTakingPlanForm',
  components: { StockTakingPlanParamList },
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
    const formType = ref('create') // 表单的类型：create - 新增；update - 修改；detail - 详情
    const isDetail = computed(() => formType.value === 'detail') // 是否只读
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增盘点方案',
        update: '编辑盘点方案',
        detail: '盘点方案详情'
      }
      return titles[formType.value] || formType.value
    }) // 弹窗的标题
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      type: undefined,
      startTime: undefined,
      endTime: undefined,
      blindFlag: false,
      frozen: false,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '方案编码不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
      type: [{ required: true, message: '盘点类型不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    /** 生成方案编码 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_STOCK_TAKING_PLAN_CODE)).data
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await StockTakingPlanApi.getStockTakingPlan(id)).data
        } finally {
          formLoading.value = false
        }
      }
    }
    /** 提交表单 */
    const submitForm = async() => {
      await formRef.value.validate()
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          const res = (await StockTakingPlanApi.createStockTakingPlan(data)).data
          message.success(t('common.createSuccess'))
          formData.value.id = res
          formType.value = 'update'
        } else {
          (await StockTakingPlanApi.updateStockTakingPlan(data)).data
          message.success(t('common.updateSuccess'))
          dialogVisible.value = false
        }
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
        startTime: undefined,
        endTime: undefined,
        blindFlag: false,
        frozen: false,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { DICT_TYPE, MesWmStockTakingTypeEnum, StockTakingPlanParamList, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getIntDictOptions, isDetail, message, open, resetForm, submitForm, t }
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
