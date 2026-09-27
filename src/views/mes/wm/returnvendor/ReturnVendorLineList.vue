<template>
  <div class="wm-migrated">
    <div class="overflow-hidden">
      <el-button
        v-if="isUpdate"
        type="primary"
        plain
        class="mb-10px"
        @click="openForm('create')"
      >
        <i class="el-icon-plus mr-5px" /> 添加物料
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
        :row-key="(row) => row.id"
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <ReturnVendorDetailList
              :ref="(el) => setDetailListRef(scope.row.id, el)"
              :return-id="returnId"
              :line-id="scope.row.id"
              :item-id="scope.row.itemId"
              :form-type="formType"
              @edit-detail="
                (detailId) =>
                  openDetailForm('update', scope.row.id, scope.row.itemId, detailId)
              "
            />
          </template>
        </el-table-column>
        <el-table-column
          label="物料编码"
          align="center"
          prop="itemCode"
          min-width="120"
        />
        <el-table-column
          label="物料名称"
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
          label="退货数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          width="150"
        />
        <el-table-column
          v-if="isUpdate || isStock"
          label="操作"
          align="center"
          width="160"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="isUpdate"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="isUpdate"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              v-if="isStock"
              type="text"
              @click="handlePicking(scope.row.id)"
            >
              拣货
            </el-button>
            <PrinterLabel
              v-if="isStock"
              :biz-id="scope.row.batchId"
              :biz-code="scope.row.batchCode"
              biz-type="BATCH"
            />
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

    <!-- 添加/编辑行弹窗 -->
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
              label="产品物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                placeholder="请选择产品物料"
                class="wm-w-full"
                @change="handleItemChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="退货数量"
              prop="quantity"
            >
              <el-input-number
                v-model="formData.quantity"
                :precision="2"
                :min="0"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="批次号"
              prop="batchId"
            >
              <WmBatchSelect
                v-model="formData.batchId"
                :item-id="formData.itemId"
                :vendor-id="vendorId"
                @change="handleBatchChange"
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

    <!-- 拣货明细添加/编辑弹窗 -->
    <ReturnVendorDetailForm
      ref="detailFormRef"
      :return-id="returnId"
      @success="onDetailFormSuccess"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, toRefs, getCurrentInstance } from 'vue'
import { WmReturnVendorLineApi } from '@/api/mes/wm/returnvendor/line'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmBatchSelect from '@/views/mes/wm/batch/components/WmBatchSelect.vue'
import ReturnVendorDetailList from './ReturnVendorDetailList.vue'
import ReturnVendorDetailForm from './ReturnVendorDetailForm.vue'
import { PrinterLabel } from '@/views/mes/wm/barcode/components'
export default {
  name: 'ReturnVendorLineList',
  components: { MdItemSelect, WmBatchSelect, ReturnVendorDetailList, ReturnVendorDetailForm, PrinterLabel },
  props: { 'returnId': { type: Number, required: true }, 'formType': { type: String, required: true }, 'vendorId': { type: Number }},
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
    const isUpdate = computed(() => ['create', 'update'].includes(props.formType)) // 是否为编辑模式
    const isStock = computed(() => props.formType === 'stock') // 是否为拣货模式
    // ==================== 列表 ====================
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 行列表
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      returnId: undefined
    })
    /** 查询行列表 */
    const getList = async() => {
      loading.value = true
      try {
        queryParams.returnId = props.returnId
        const data = (await WmReturnVendorLineApi.getReturnVendorLinePage(queryParams)).data
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
        (await WmReturnVendorLineApi.deleteReturnVendorLine(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 添加/编辑表单 ====================
    const dialogVisible = ref(false) // 弹窗的是否展示
    const dialogTitle = ref('') // 弹窗的标题
    const formLoading = ref(false) // 表单的加载中
    const lineFormType = ref('') // 行表单的类型
    const formData = ref({
      id: undefined,
      returnId: undefined,
      itemId: undefined,
      quantity: undefined,
      batchId: undefined,
      batchCode: undefined,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      quantity: [{ required: true, message: '退货数量不能为空', trigger: 'blur' }]
    })
    const formRef = ref() // 表单 Ref
    /** 物料变化时，自动填充信息 */
    const handleItemChange = (item) => {
      if (item) {
        formData.value.itemId = item.id
      }
    }
    /** 批次选中回调，同步 batchCode */
    const handleBatchChange = (batch) => {
      formData.value.batchCode = batch === null || batch === void 0 ? void 0 : batch.code
    }
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加供应商退货单行' : '修改供应商退货单行'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmReturnVendorLineApi.getReturnVendorLine(id)).data
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
          returnId: props.returnId
        }
        if (lineFormType.value === 'create') {
          (await WmReturnVendorLineApi.createReturnVendorLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmReturnVendorLineApi.updateReturnVendorLine(data)).data
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
        returnId: undefined,
        itemId: undefined,
        quantity: undefined,
        batchId: undefined,
        batchCode: undefined,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    // ==================== 展开行：拣货明细 ====================
    const detailListRefs = ref({})
    /** 缓存子组件 ref */
    const setDetailListRef = (lineId, el) => {
      if (el) {
        detailListRefs.value[lineId] = el
      }
    }
    // ==================== 拣货明细表单（LineList 层级持有） ====================
    const detailFormRef = ref()
    /** 拣货：直接打开明细创建表单 */
    const handlePicking = (lineId) => {
      const row = list.value.find((r) => r.id === lineId)
      openDetailForm('create', lineId, row === null || row === void 0 ? void 0 : row.itemId)
    }
    /** 打开拣货明细表单 */
    const openDetailForm = (type, lineId, itemId, detailId) => {
      detailFormRef.value.open(type, lineId, itemId, detailId)
    }
    /** 明细表单提交成功后，刷新已展开行的 DetailList */
    const onDetailFormSuccess = (lineId) => {
      var _a;
      (_a = detailListRefs.value[lineId]) === null || _a === void 0 ? void 0 : _a.getList()
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), MdItemSelect, PrinterLabel, ReturnVendorDetailForm, ReturnVendorDetailList, WmBatchSelect, detailFormRef, detailListRefs, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleBatchChange, handleDelete, handleItemChange, handlePicking, isStock, isUpdate, lineFormType, list, loading, message, onDetailFormSuccess, openDetailForm, openForm, queryParams, resetForm, setDetailListRef, submitForm, t, total }
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
