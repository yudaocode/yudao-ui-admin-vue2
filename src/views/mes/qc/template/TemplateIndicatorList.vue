<template>
  <div>
    <!-- 操作栏 -->
    <el-row class="mb-10px">
      <el-button
        v-hasPermi="['mes:qc-template:create']"
        type="primary"
        plain
        size="small"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 新增指标项
      </el-button>
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="检测项编码"
        align="center"
        prop="indicatorCode"
        width="140"
      />
      <el-table-column
        label="检测项名称"
        align="center"
        prop="indicatorName"
        min-width="150"
      />
      <el-table-column
        label="检测项类型"
        align="center"
        prop="indicatorType"
        width="120"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.MES_INDICATOR_TYPE"
            :value="scope.row.indicatorType"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="检测工具"
        align="center"
        prop="indicatorTool"
        width="120"
      />
      <el-table-column
        label="检测方法"
        align="center"
        prop="checkMethod"
        min-width="180"
      />
      <el-table-column
        label="标准值"
        align="center"
        prop="standardValue"
        width="100"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitMeasureName"
        width="80"
      />
      <el-table-column
        label="误差上限"
        align="center"
        prop="thresholdMax"
        width="100"
      />
      <el-table-column
        label="误差下限"
        align="center"
        prop="thresholdMin"
        width="100"
      />
      <el-table-column
        label="操作"
        align="center"
        width="130"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button

            v-hasPermi="['mes:qc-template:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button

            v-hasPermi="['mes:qc-template:update']"
            type="text"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单弹窗：添加/修改 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="900px"
      append-to-body
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item
              label="质检指标"
              prop="indicatorId"
            >
              <QcIndicatorSelect
                v-model="formData.indicatorId"
                placeholder="请选择质检指标"
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="标准值"
              prop="standardValue"
            >
              <el-input-number
                v-model="formData.standardValue"
                placeholder="请输入标准值"
                :precision="4"
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item
              label="计量单位"
              prop="unitMeasureId"
            >
              <MdUnitMeasureSelect
                v-model="formData.unitMeasureId"
                placeholder="请选择计量单位"
                clearable
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="误差上限"
              prop="thresholdMax"
            >
              <el-input-number
                v-model="formData.thresholdMax"
                placeholder="请输入"
                :precision="4"
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="误差下限"
              prop="thresholdMin"
            >
              <el-input-number
                v-model="formData.thresholdMin"
                placeholder="请输入"
                :precision="4"
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="检测方法"
              prop="checkMethod"
            >
              <el-input
                v-model="formData.checkMethod"
                type="textarea"
                placeholder="请输入检测方法"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="说明图URL"
              prop="docUrl"
            >
              <el-input
                v-model="formData.docUrl"
                placeholder="请输入说明图URL"
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
              />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ref, reactive, watch, toRefs, getCurrentInstance } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import { QcTemplateIndicatorApi } from '@/api/mes/qc/template/indicator/index'
import QcIndicatorSelect from '@/views/mes/qc/indicator/components/QcIndicatorSelect.vue'
import MdUnitMeasureSelect from '@/views/mes/md/unitmeasure/components/MdUnitMeasureSelect.vue'
export default {
  name: 'TemplateIndicatorList',
  components: { QcIndicatorSelect, MdUnitMeasureSelect },
  props: { 'templateId': { type: Number, required: true }},
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
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 列表的数据
    /** 查询列表 */
    const getList = async() => {
      if (!props.templateId) { return }
      loading.value = true
      try {
        const data = (await QcTemplateIndicatorApi.getTemplateIndicatorPage({
          pageNo: 1,
          pageSize: 100,
          templateId: props.templateId
        })).data
        list.value = data.list
      } finally {
        loading.value = false
      }
    }
    // ==================== 添加/修改 ====================
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('') // 表单的类型：create - 新增；update - 修改
    const formRef = ref() // 表单 Ref
    const formData = ref({
      id: undefined,
      templateId: undefined,
      indicatorId: undefined,
      checkMethod: undefined,
      standardValue: undefined,
      unitMeasureId: undefined,
      thresholdMax: undefined,
      thresholdMin: undefined,
      docUrl: undefined,
      remark: undefined
    })
    const formRules = reactive({
      indicatorId: [{ required: true, message: '质检指标不能为空', trigger: 'change' }]
    })
    /** 添加/修改操作 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      formType.value = type
      resetForm()
      formData.value.templateId = props.templateId
      // 修改时，设置数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await QcTemplateIndicatorApi.getTemplateIndicator(id)).data
        } finally {
          formLoading.value = false
        }
      }
    }
    /** 提交表单 */
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
          (await QcTemplateIndicatorApi.createTemplateIndicator(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcTemplateIndicatorApi.updateTemplateIndicator(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        // 刷新列表
        await getList()
      } finally {
        formLoading.value = false
      }
    }
    /** 重置表单 */
    const resetForm = () => {
      var _a
      formData.value = {
        id: undefined,
        templateId: undefined,
        indicatorId: undefined,
        checkMethod: undefined,
        standardValue: undefined,
        unitMeasureId: undefined,
        thresholdMax: undefined,
        thresholdMin: undefined,
        docUrl: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        // 删除的二次确认
        await message.delConfirm();
        // 发起删除
        (await QcTemplateIndicatorApi.deleteTemplateIndicator(id)).data
        message.success(t('common.delSuccess'))
        // 刷新列表
        await getList()
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    /** 监听 templateId 变化，重新加载列表 */
    watch(() => props.templateId, () => getList(), { immediate: true })
    return { ...toRefs(props), DICT_TYPE, MdUnitMeasureSelect, QcIndicatorSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, getList, handleDelete, list, loading, message, openForm, resetForm, submitForm, t }
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
