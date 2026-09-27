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
              label="通知单编号"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入通知单编号"
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
              label="通知单名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入通知单名称"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="采购订单编号"
              prop="purchaseOrderCode"
            >
              <el-input
                v-model="formData.purchaseOrderCode"
                placeholder="请输入采购订单编号"
                :disabled="isHeaderReadonly"
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
              label="到货日期"
              prop="arrivalDate"
            >
              <el-date-picker
                v-model="formData.arrivalDate"
                type="date"
                value-format="timestamp"
                placeholder="请选择到货日期"
                class="wm-w-full"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="联系人"
              prop="contactName"
            >
              <el-input
                v-model="formData.contactName"
                placeholder="请输入联系人"
                :disabled="isHeaderReadonly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="联系方式"
              prop="contactTelephone"
            >
              <el-input
                v-model="formData.contactTelephone"
                placeholder="请输入联系方式"
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
      <!-- 编辑/详情时展示物料信息 -->
      <template v-if="formData.id">
        <el-divider content-position="center">物料信息</el-divider>
        <ArrivalNoticeLineList
          :notice-id="formData.id"
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
          v-if="isEditable && formData.status === MesWmArrivalNoticeStatusEnum.PREPARE"
          type="warning"
          :disabled="formLoading"
          @click="handleSubmit"
        >
          提 交
        </el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { WmArrivalNoticeApi } from '@/api/mes/wm/arrivalnotice'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import ArrivalNoticeLineList from './ArrivalNoticeLineList.vue'
import { MesAutoCodeRuleCode, MesWmArrivalNoticeStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'ArrivalNoticeForm',
  components: { MdVendorSelect, ArrivalNoticeLineList },
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
    const formType = ref('create') // 表单的类型：create / update / detail
    const isEditable = computed(() => ['create', 'update'].includes(formType.value)) // 是否为编辑模式
    const isDetail = computed(() => formType.value === 'detail') // 是否为详情模式
    const isHeaderReadonly = computed(() => formType.value === 'detail') // 表头是否只读
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增到货通知单',
        update: '编辑到货通知单',
        detail: '到货通知单详情'
      }
      return titles[formType.value] || formType.value
    })
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      status: undefined,
      purchaseOrderCode: undefined,
      vendorId: undefined,
      arrivalDate: undefined,
      contactName: undefined,
      contactTelephone: undefined,
      remark: undefined
    })
    const formRules = reactive({
      code: [{ required: true, message: '通知单编号不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '通知单名称不能为空', trigger: 'blur' }],
      vendorId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
      arrivalDate: [{ required: true, message: '请选择到货日期', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    const originalFormData = ref('') // 原始表单数据快照，用于脏检查
    /** 生成通知单编号 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_ARRIVAL_NOTICE_CODE)).data
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      formType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmArrivalNoticeApi.getArrivalNotice(id)).data
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
          const res = (await WmArrivalNoticeApi.createArrivalNotice(data)).data
          message.success('新增成功')
          // 创建成功后，更新表单数据和状态为编辑模式
          formData.value.id = res
          formData.value.status = MesWmArrivalNoticeStatusEnum.PREPARE
          formType.value = 'update'
        } else {
          (await WmArrivalNoticeApi.updateArrivalNotice(data)).data
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
        await message.confirm('确认提交该到货通知单？【提交后将不能修改】')
        formLoading.value = true
        // 1. 表单有修改时，先保存
        if (JSON.stringify(formData.value) !== originalFormData.value) {
          const data = formData.value;
          (await WmArrivalNoticeApi.updateArrivalNotice(data)).data
        }
        // 2. 提交通知单
        (await WmArrivalNoticeApi.submitArrivalNotice(formData.value.id)).data
        message.success('提交成功')
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
        purchaseOrderCode: undefined,
        vendorId: undefined,
        arrivalDate: undefined,
        contactName: undefined,
        contactTelephone: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { ArrivalNoticeLineList, MdVendorSelect, MesWmArrivalNoticeStatusEnum, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, handleSubmit, isDetail, isEditable, isHeaderReadonly, message, open, originalFormData, resetForm, submitForm }
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
