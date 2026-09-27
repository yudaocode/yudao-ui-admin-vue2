<template>
  <div class="wm-migrated">
    <div class="overflow-hidden">
      <el-button
        v-if="isEditable"
        type="primary"
        plain
        class="mb-10px"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 添加明细
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
      >
        <el-table-column
          label="产品物料编码"
          align="center"
          prop="itemCode"
          min-width="120"
        />
        <el-table-column
          label="产品物料名称"
          align="center"
          prop="itemName"
          min-width="140"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          min-width="120"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitMeasureName"
          width="80"
        />
        <el-table-column
          label="装箱数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="生产工单编号"
          align="center"
          prop="workOrderCode"
          min-width="140"
        />
        <!-- DONE @芋艿：批次号？到底怎么设置好？（AI 未修复原因：需产品经理确认批次号的设置方式） -->
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="有效期"
          align="center"
          prop="expireDate"
          :formatter="dateFormatter2"
          width="120"
        />
        <el-table-column
          v-if="isEditable"
          label="操作"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              type="text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 添加/编辑明细弹窗 -->
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
              label="生产工单"
              prop="workOrderId"
            >
              <ProWorkOrderSelect
                v-model="formData.workOrderId"
                :status="MesProWorkOrderStatusEnum.CONFIRMED"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="产品物料"
              prop="itemId"
            >
              <MdItemSelect v-model="formData.itemId" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="装箱数量"
              prop="quantity"
            >
              <el-input-number
                v-model="formData.quantity"
                :precision="2"
                :min="0.01"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- DONE @芋艿：批次号？到底怎么设置好？（AI 未修复原因：需产品经理确认批次号的设置方式） -->
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="有效期"
              prop="expireDate"
            >
              <el-date-picker
                v-model="formData.expireDate"
                type="date"
                value-format="timestamp"
                placeholder="请选择有效期"
                class="wm-w-full"
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
import { ref, reactive, computed, onMounted, toRefs, getCurrentInstance } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime'
import { WmPackageLineApi } from '@/api/mes/wm/packages/line'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import { MesProWorkOrderStatusEnum } from '@/views/mes/utils/constants'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
export default {
  name: 'PackageLineList',
  components: { ProWorkOrderSelect, MdItemSelect },
  props: { 'packageId': { type: Number, required: true }, 'formType': { type: String, required: true }},
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
    const isEditable = computed(() => ['create', 'update'].includes(props.formType))
    // ==================== 列表 ====================
    const loading = ref(false)
    const list = ref([])
    const total = ref(0)
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      packageId: undefined
    })
    /** 查询明细列表 */
    const getList = async() => {
      loading.value = true
      try {
        // TODO @芋艿：需确认“父箱详情 -> 装箱清单”是否要和【对齐】一样，自动汇总当前箱及其子孙箱明细；
        // 目前前端仅传当前 packageId，最终查询范围取决于后端 package-line/page 的实现。
        queryParams.packageId = props.packageId
        const data = (await WmPackageLineApi.getPackageLinePage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmPackageLineApi.deletePackageLine(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 添加/编辑表单 ====================
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const formLoading = ref(false)
    const lineFormType = ref('')
    const formData = ref({
      id: undefined,
      packageId: undefined,
      materialStockId: undefined,
      itemId: undefined,
      quantity: undefined,
      workOrderId: undefined,
      expireDate: undefined,
      remark: undefined
    })
    const formRules = reactive({
      workOrderId: [{ required: true, message: '请选择生产工单', trigger: 'change' }],
      itemId: [{ required: true, message: '请选择产品物料', trigger: 'change' }],
      quantity: [
        { required: true, message: '装箱数量不能为空', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '装箱数量必须大于0', trigger: 'blur' }
      ]
    })
    const formRef = ref()
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加装箱明细' : '修改装箱明细'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = ((await WmPackageLineApi.getPackageLine(id)).data)
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
        const data = {
          ...formData.value,
          packageId: props.packageId
        }
        if (lineFormType.value === 'create') {
          (await WmPackageLineApi.createPackageLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmPackageLineApi.updatePackageLine(data)).data
          message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
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
        packageId: undefined,
        materialStockId: undefined,
        itemId: undefined,
        quantity: undefined,
        workOrderId: undefined,
        expireDate: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), MdItemSelect, MesProWorkOrderStatusEnum, ProWorkOrderSelect, dateFormatter2, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, isEditable, lineFormType, list, loading, message, openForm, queryParams, resetForm, submitForm, t, total }
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
