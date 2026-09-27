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
        <i class="el-icon-plus mr-5px" /> 新增产品关联
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
        label="物料编码"
        align="center"
        prop="itemCode"
        width="130"
      />
      <el-table-column
        label="物料名称"
        align="center"
        prop="itemName"
        min-width="150"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="specification"
        min-width="130"
      />
      <el-table-column
        label="计量单位"
        align="center"
        prop="unitMeasureName"
        width="100"
      />
      <el-table-column
        label="最低检测数"
        align="center"
        prop="quantityCheck"
        width="110"
      />
      <el-table-column
        label="最大不合格数"
        align="center"
        prop="quantityUnqualified"
        width="120"
      >
        <template slot-scope="scope">
          {{ scope.row.quantityUnqualified === 0 ? '不启用' : scope.row.quantityUnqualified }}
        </template>
      </el-table-column>
      <el-table-column
        label="最大致命缺陷率(%)"
        align="center"
        prop="criticalRate"
        width="150"
      />
      <el-table-column
        label="最大严重缺陷率(%)"
        align="center"
        prop="majorRate"
        width="150"
      />
      <el-table-column
        label="最大轻微缺陷率(%)"
        align="center"
        prop="minorRate"
        width="150"
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
        label-width="120px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="产品物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="formData.itemId"
                placeholder="请选择产品物料"
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item
              label="最低检测数"
              prop="quantityCheck"
            >
              <el-input-number
                v-model="formData.quantityCheck"
                placeholder="请输入最低检测数"
                :min="1"
                class="qc-w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="最大不合格数"
              prop="quantityUnqualified"
            >
              <el-tooltip
                content="超出最大不合格数后整批判定不合格，0表示不启用"
                placement="top"
              >
                <el-input-number
                  v-model="formData.quantityUnqualified"
                  placeholder="0表示不启用"
                  :min="0"
                  class="qc-w-full"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item
              label="致命缺陷率(%)"
              prop="criticalRate"
            >
              <el-tooltip
                content="缺陷比例超出后整批判定不合格，0表示不允许出现"
                placement="top"
              >
                <el-input-number
                  v-model="formData.criticalRate"
                  placeholder="0表示不允许"
                  :min="0"
                  :max="100"
                  :precision="2"
                  class="qc-w-full"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="严重缺陷率(%)"
              prop="majorRate"
            >
              <el-tooltip
                content="缺陷比例超出后整批判定不合格，0表示不允许出现"
                placement="top"
              >
                <el-input-number
                  v-model="formData.majorRate"
                  placeholder="0表示不允许"
                  :min="0"
                  :max="100"
                  :precision="2"
                  class="qc-w-full"
                />
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="轻微缺陷率(%)"
              prop="minorRate"
            >
              <el-tooltip
                content="缺陷比例超出后整批判定不合格，0表示不允许出现"
                placement="top"
              >
                <el-input-number
                  v-model="formData.minorRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  class="qc-w-full"
                />
              </el-tooltip>
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
import { QcTemplateItemApi } from '@/api/mes/qc/template/item/index'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
export default {
  name: 'TemplateItemList',
  components: { MdItemSelect },
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
        const data = (await QcTemplateItemApi.getTemplateItemPage({
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
      itemId: undefined,
      quantityCheck: 1,
      quantityUnqualified: 0,
      criticalRate: 0,
      majorRate: 0,
      minorRate: 100,
      remark: undefined
    })
    const formRules = reactive({
      itemId: [{ required: true, message: '产品物料不能为空', trigger: 'change' }],
      quantityCheck: [{ required: true, message: '最低检测数不能为空', trigger: 'blur' }]
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
          formData.value = (await QcTemplateItemApi.getTemplateItem(id)).data
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
          (await QcTemplateItemApi.createTemplateItem(data)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcTemplateItemApi.updateTemplateItem(data)).data
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
        itemId: undefined,
        quantityCheck: 1,
        quantityUnqualified: 0,
        criticalRate: 0,
        majorRate: 0,
        minorRate: 100,
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
        (await QcTemplateItemApi.deleteTemplateItem(id)).data
        message.success(t('common.delSuccess'))
        // 刷新列表
        await getList()
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    /** 监听 templateId 变化，重新加载列表 */
    watch(() => props.templateId, () => getList(), { immediate: true })
    return { ...toRefs(props), MdItemSelect, dialogTitle, dialogVisible, formData, formLoading, formRef, formRules, formType, getList, handleDelete, list, loading, message, openForm, resetForm, submitForm, t }
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
