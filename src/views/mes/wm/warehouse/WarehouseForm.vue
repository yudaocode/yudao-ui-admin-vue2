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
              label="仓库编码"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入仓库编码"
              >
                <template slot="append">
                  <el-button @click="generateCode"> 生成 </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="仓库名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入仓库名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="负责人"
              prop="chargeUserId"
            >
              <el-select
                v-model="formData.chargeUserId"
                placeholder="请选择负责人"
                clearable
                class="wm-w-full"
              >
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.nickname"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="仓库地址"
              prop="address"
            >
              <el-input
                v-model="formData.address"
                placeholder="请输入仓库地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="面积（㎡）"
              prop="area"
            >
              <el-input-number
                v-model="formData.area"
                :precision="2"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="是否冻结"
              prop="frozen"
            >
              <el-switch v-model="formData.frozen" />
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
          v-if="isDetail && formData.id"
          type="primary"
          plain
          @click="handleBarcode"
        >
          查看条码
        </el-button>
        <el-button
          v-if="!isDetail"
          type="primary"
          :disabled="formLoading"
          @click="submitForm"
        >
          确 定
        </el-button>
        <el-button @click="dialogVisible = false">{{ isDetail ? '关 闭' : '取 消' }}</el-button>
      </span>
    </el-dialog>
    <!-- 条码详情弹窗（详情模式下展示） -->
    <BarcodeDetail ref="barcodeDetailRef" />
  </div>
</template>

<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { WmWarehouseApi } from '@/api/mes/wm/warehouse'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import * as UserApi from '@/api/system/user'
import { MesAutoCodeRuleCode, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
export default {
  name: 'WarehouseForm',
  components: { BarcodeDetail },
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
    const dialogTitle = computed(() => {
      const titles = {
        create: '新增仓库',
        update: '编辑仓库',
        detail: '仓库详情'
      }
      return titles[formType.value] || formType.value
    })
    const formLoading = ref(false) // 表单的加载中
    const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
    const isDetail = computed(() => formType.value === 'detail') // 是否详情模式（只读）
    const userList = ref([]) // 用户列表
    /** 生成仓库编码 */
    const generateCode = async() => {
      formData.value.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.WM_WAREHOUSE_CODE)).data
    }
    const formData = ref({
      id: undefined,
      code: undefined,
      name: undefined,
      address: undefined,
      area: undefined,
      chargeUserId: undefined,
      frozen: false,
      remark: undefined
    }) // 表单数据
    const formRules = reactive({
      code: [{ required: true, message: '仓库编码不能为空', trigger: 'blur' }],
      name: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
      frozen: [{ required: true, message: '是否冻结不能为空', trigger: 'change' }]
    }) // 表单校验规则
    const formRef = ref() // 表单 Ref
    const barcodeDetailRef = ref() // 条码详情弹窗 Ref
    /** 查看条码 */
    const handleBarcode = () => {
      var _a;
      (_a = barcodeDetailRef.value) === null || _a === void 0 ? void 0 : _a.openByBusiness(formData.value.id, BarcodeBizTypeEnum.WAREHOUSE, formData.value.code, formData.value.name)
    }
    /** 打开弹窗 */
    const open = async(type, id) => {
      dialogVisible.value = true
      formType.value = type
      resetForm()
      // 加载用户列表
      userList.value = (await UserApi.getSimpleUserList()).data
      // 修改时，设置数据
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmWarehouseApi.getWarehouse(id)).data
        } finally {
          formLoading.value = false
        }
      }
    }
    const submitForm = async() => {
      // 校验表单
      await formRef.value.validate()
      // 提交请求
      formLoading.value = true
      try {
        const data = formData.value
        if (formType.value === 'create') {
          (await WmWarehouseApi.createWarehouse(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmWarehouseApi.updateWarehouse(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        // 发送操作成功的事件
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
        address: undefined,
        area: undefined,
        chargeUserId: undefined,
        frozen: false,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    return { BarcodeDetail, barcodeDetailRef, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, generateCode, handleBarcode, isDetail, message, open, resetForm, submitForm, t, userList }
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
