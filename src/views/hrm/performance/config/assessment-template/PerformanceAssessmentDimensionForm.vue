<template>
  <div class="hrm-performance-page">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="760px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="88px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="维度名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                maxlength="50"
                placeholder="请输入维度名称"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="指标类型"
              prop="quotaType"
            >
              <el-select
                v-model="formData.quotaType"
                class="!w-1/1"
                placeholder="请选择指标类型"
              >
                <el-option
                  label="业绩指标"
                  :value="HrmPerformanceQuotaType.PERFORMANCE"
                />
                <el-option
                  label="行为态度指标"
                  :value="HrmPerformanceQuotaType.BEHAVIOR"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="维度权重"
              prop="weight"
            >
              <div class="flex w-1/1 items-center gap-6px">
                <el-input-number
                  v-model="formData.weight"
                  :max="100"
                  :min="0"
                  :precision="2"
                  class="!w-1/1"
                  placeholder="请输入维度权重"
                />
                <span class="text-gray-500">%</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="formData.remark"
            :rows="3"
            maxlength="200"
            placeholder="请输入备注"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item>
          <div>
            <el-checkbox
              v-model="formData.allowEdit"
              label="允许员工填写"
            />
            <div class="text-12px text-gray-500">
              勾选后，员工在制定指标时可以为当前考核维度添加指标
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="primary"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { HrmPerformanceQuotaType } from '@/views/hrm/utils/constants'
/** 绩效考核维度表单 */
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessmentDimensionForm' },
  __name: 'PerformanceAssessmentDimensionForm',
  emits: ['confirm'],
  setup(__props, { expose: __expose, emit: __emit }) {
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formData = ref(createDefaultDimension()) // 表单数据
    const formRules = reactive({
      name: [
        { required: true, message: '维度名称不能为空', trigger: 'blur' },
        { max: 50, message: '维度名称不能超过 50 个字符', trigger: 'blur' }
      ],
      quotaType: [{ required: true, message: '指标类型不能为空', trigger: 'change' }],
      weight: [{ required: true, message: '维度权重不能为空', trigger: 'change' }],
      remark: [{ max: 200, message: '备注不能超过 200 个字符', trigger: 'blur' }]
    })
    const formRef = ref() // 表单 Ref
    /** 打开弹窗 */
    function open(dimension) {
      dialogVisible.value = true
      dialogTitle.value = dimension ? '编辑考核维度' : '新增考核维度'
      resetForm()
      if (dimension) {
        formData.value = {
          ...dimension,
          allowEdit: dimension.allowEdit ?? false,
          quotas: (dimension.quotas || []).map((quota) => ({ ...quota }))
        }
      }
    }
    __expose({ open }) // 提供 open 方法，用于打开弹窗
    const emit = __emit // 定义组件事件
    /** 提交表单 */
    async function submitForm() {
      // 校验表单
      await formRef.value?.validate()
      // 发送操作成功的事件
      emit('confirm', {
        ...formData.value,
        name: formData.value.name?.trim(),
        remark: formData.value.remark?.trim()
      })
      dialogVisible.value = false
    }
    /** 重置表单 */
    function resetForm() {
      formData.value = createDefaultDimension()
            formRef.value?.resetFields()
    }
    /** 创建默认考核维度 */
    function createDefaultDimension() {
      return {
        name: '',
        quotaType: HrmPerformanceQuotaType.PERFORMANCE,
        weight: undefined,
        remark: '',
        allowEdit: false,
        quotas: []
      }
    }
    const __returned__ = { dialogVisible, dialogTitle, formData, formRules, formRef, open, emit, submitForm, resetForm, createDefaultDimension, get HrmPerformanceQuotaType() { return HrmPerformanceQuotaType } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
