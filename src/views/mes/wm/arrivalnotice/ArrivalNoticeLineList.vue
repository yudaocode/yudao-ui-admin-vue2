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
        <i class="el-icon-plus mr-5px" /> 添加物料
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
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
          label="到货数量"
          align="center"
          prop="arrivalQuantity"
          width="100"
        />
        <el-table-column
          label="是否检验"
          align="center"
          prop="iqcCheckFlag"
          width="90"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="scope.row.iqcCheckFlag"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="合格数量"
          align="center"
          prop="qualifiedQuantity"
          width="100"
        />
        <el-table-column
          label="检验单号"
          align="center"
          prop="iqcCode"
          min-width="140"
        />
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          min-width="120"
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
              label="到货数量"
              prop="arrivalQuantity"
            >
              <el-input-number
                v-model="formData.arrivalQuantity"
                :precision="2"
                :min="0.01"
                controls-position="right"
                class="wm-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="是否检验"
              prop="iqcCheckFlag"
            >
              <el-switch v-model="formData.iqcCheckFlag" />
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
import { WmArrivalNoticeLineApi } from '@/api/mes/wm/arrivalnotice/line'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
export default {
  name: 'ArrivalNoticeLineList',
  components: { MdItemSelect },
  props: { 'noticeId': { type: Number, required: true }, 'formType': { type: String }},
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
    const isEditable = computed(() => ['create', 'update'].includes(props.formType || ''))
    // ==================== 列表 ====================
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 行列表
    const total = ref(0) // 列表的总页数
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
        const data = (await WmArrivalNoticeLineApi.getArrivalNoticeLinePage(queryParams)).data
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
        (await WmArrivalNoticeLineApi.deleteArrivalNoticeLine(id)).data
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
      noticeId: undefined,
      itemId: undefined,
      arrivalQuantity: undefined,
      iqcCheckFlag: false,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '物料不能为空', trigger: 'change' }],
      arrivalQuantity: [
        { required: true, message: '到货数量不能为空', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '到货数量必须大于0', trigger: 'blur' }
      ],
      iqcCheckFlag: [{ required: true, message: '是否检验不能为空', trigger: 'change' }]
    })
    const formRef = ref() // 表单 Ref
    /** 打开表单弹窗 */
    const openForm = async(type, id) => {
      dialogVisible.value = true
      dialogTitle.value = type === 'create' ? '添加到货通知单行' : '修改到货通知单行'
      lineFormType.value = type
      resetForm()
      if (id) {
        formLoading.value = true
        try {
          formData.value = (await WmArrivalNoticeLineApi.getArrivalNoticeLine(id)).data
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
          noticeId: props.noticeId
        }
        if (lineFormType.value === 'create') {
          (await WmArrivalNoticeLineApi.createArrivalNoticeLine(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await WmArrivalNoticeLineApi.updateArrivalNoticeLine(data)).data
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
        arrivalQuantity: undefined,
        iqcCheckFlag: false,
        remark: undefined
      };
      (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { ...toRefs(props), DICT_TYPE, MdItemSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, getList, handleDelete, isEditable, lineFormType, list, loading, message, openForm, queryParams, resetForm, submitForm, t, total }
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
