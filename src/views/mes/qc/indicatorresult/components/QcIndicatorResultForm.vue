<template>
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
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item
            label="样品编号"
            prop="code"
          >
            <el-input
              v-model="formData.code"
              placeholder="请输入样品编号"
            >
              <template slot="append">
                <el-button @click="generateCode"> 生成 </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="物资SN"
            prop="sn"
          >
            <el-input
              v-model="formData.sn"
              placeholder="请输入物资SN"
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

      <!-- 检测值列表 -->
      <el-divider>检测值</el-divider>
      <div
        v-for="(item, index) in formData.items"
        :key="index"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="'检测项' + (index + 1)">
              <el-input
                :value="item.indicatorName"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 数值（浮点/整数） -->
            <el-form-item
              v-if="
                [MesQcResultValueType.FLOAT, MesQcResultValueType.INTEGER].includes(item.valueType)
              "
              label="检测值"
            >
              <el-input-number
                v-model="item.valueNumber"
                :precision="item.valueType === MesQcResultValueType.FLOAT ? 4 : 0"
                placeholder="请输入"
                class="qc-w-full"
              />
            </el-form-item>
            <!-- 文本值 -->
            <el-form-item
              v-else-if="item.valueType === MesQcResultValueType.TEXT"
              label="检测值"
            >
              <el-input
                v-model="item.value"
                type="textarea"
                placeholder="请输入检测值"
              />
            </el-form-item>
            <!-- 字典值 -->
            <el-form-item
              v-else-if="item.valueType === MesQcResultValueType.DICT"
              label="检测值"
            >
              <el-select
                v-model="item.value"
                placeholder="请选择"
                class="qc-w-full"
              >
                <el-option
                  v-for="dict in getStrDictOptions(item.valueSpecification)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <!-- 文件值 -->
            <el-form-item
              v-else-if="item.valueType === MesQcResultValueType.FILE"
              label="检测值"
            >
              <el-input
                v-model="item.value"
                placeholder="请输入文件地址"
              />
            </el-form-item>
            <!-- 未知类型 -->
            <el-form-item
              v-else
              label="检测值"
            >
              <el-input
                v-model="item.value"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider v-if="index < formData.items.length - 1" />
      </div>
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
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { QcIndicatorResultApi } from '@/api/mes/qc/indicatorresult'
import { getStrDictOptions } from '@/utils/dict'
import { MesQcResultValueType } from '@/views/mes/utils/constants'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
export default {
  name: 'QcIndicatorResultForm',
  props: { 'qcId': { type: Number, required: true }, 'qcType': { type: Number, required: true }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args)
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('') // 表单的类型：create - 新增；update - 修改
    const formData = ref({
      id: undefined,
      code: undefined,
      qcId: undefined,
      qcType: undefined,
      sn: undefined,
      remark: undefined,
      items: []
    }) // 表单数据
    const formRules = reactive({
      code: [{ required: true, message: '样品编号不能为空', trigger: 'blur' }]
    }) // 表单校验规则
    const formRef = ref() // 表单 Ref
    /** 生成样品编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode('QC_INDICATOR_RESULT_CODE')).data
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      var _a
      dialogVisible.value = true
      dialogTitle.value = t('action.' + type)
      formType.value = type
      resetForm()
      // 加载数据
      formLoading.value = true
      try {
        formData.value = (await QcIndicatorResultApi.getDetail(props.qcId, props.qcType, id)).data
        formData.value.qcId = props.qcId
        formData.value.qcType = props.qcType;
        // 回填数值用于 el-input-number 绑定
        (_a = formData.value.items) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
          if ([MesQcResultValueType.FLOAT, MesQcResultValueType.INTEGER].includes(item.valueType) &&
                        item.value != null) {
            item.valueNumber = Number(item.value)
          }
        })
      } finally {
        formLoading.value = false
      }
    }
    const submitForm = async() => {
      // 校验表单
      if (!formRef.value) { return }
      const valid = await formRef.value.validate()
      if (!valid) { return }
      formLoading.value = true
      try {
        // 构建请求
        const data = { ...formData.value }
        data.items = data.items.map((item) => {
          const submitItem = {
            id: item.id,
            indicatorId: item.indicatorId,
            remark: item.remark
          }
          if ([MesQcResultValueType.FLOAT, MesQcResultValueType.INTEGER].includes(item.valueType)) {
            submitItem.value = item.valueNumber != null ? String(item.valueNumber) : undefined
          } else {
            submitItem.value = item.value
          }
          return submitItem
        })
        // 提交请求
        if (formType.value === 'create') {
          (await QcIndicatorResultApi.createResult(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcIndicatorResultApi.updateResult(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
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
        qcId: undefined,
        qcType: undefined,
        sn: undefined,
        remark: undefined,
        items: []
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { ...toRefs(props), MesQcResultValueType, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, getStrDictOptions, message, open, resetForm, submitForm, t }
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

