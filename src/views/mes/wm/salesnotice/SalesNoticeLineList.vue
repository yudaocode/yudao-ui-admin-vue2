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
          label="发货数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="是否检验"
          align="center"
          prop="oqcCheckFlag"
          width="90"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="scope.row.oqcCheckFlag"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          min-width="120"
        />
        <el-table-column
          v-if="isUpdate"
          label="操作"
          align="center"
          width="120"
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
              label="物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                placeholder="请选择物料"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="发货数量"
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
          <el-col :span="8">
            <el-form-item
              label="批次号"
              prop="batchCode"
            >
              <el-input
                v-model="formData.batchCode"
                placeholder="请输入批次号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              label="是否检验"
              prop="oqcCheckFlag"
            >
              <el-switch v-model="formData.oqcCheckFlag" />
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
import { DICT_TYPE } from '@/utils/dict'
import { WmSalesNoticeLineApi } from '@/api/mes/wm/salesnotice/line'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
export default {
  name: 'SalesNoticeLineList',
  components: { MdItemSelect },
  props: { 'noticeId': { type: Number, required: true }, 'formType': { type: String, required: true }},
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
    const isUpdate = computed(() => ['create', 'update'].includes(props.formType))
    // ==================== 列表 ====================
    const loading = ref(false)
    const list = ref([])
    const total = ref(0)
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      noticeId: undefined
    })
    /** 查询行列表 */
    const getList = async() => {
      loading.value = true
      try {
        queryParams.noticeId = props.noticeId
        const data = (await WmSalesNoticeLineApi.getSalesNoticeLinePage(queryParams)).data
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
        (await WmSalesNoticeLineApi.deleteSalesNoticeLine(id)).data
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
      noticeId: undefined,
      itemId: undefined,
      batchCode: undefined,
      quantity: undefined,
      oqcCheckFlag: true,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      quantity: [{ required: true, message: '发货数量不能为空', trigger: 'blur' }]
    })
    const formRef = ref()
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加发货通知单行' : '修改发货通知单行'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmSalesNoticeLineApi.getSalesNoticeLine(id)).data
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
        const data = { ...formData.value, noticeId: props.noticeId }
        if (lineFormType.value === 'create') {
          (await WmSalesNoticeLineApi.createSalesNoticeLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmSalesNoticeLineApi.updateSalesNoticeLine(data)).data
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
        noticeId: undefined,
        itemId: undefined,
        batchCode: undefined,
        quantity: undefined,
        oqcCheckFlag: true,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), DICT_TYPE, MdItemSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, isUpdate, lineFormType, list, loading, message, openForm, queryParams, resetForm, submitForm, t, total }
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
