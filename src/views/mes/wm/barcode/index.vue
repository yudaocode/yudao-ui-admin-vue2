<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】仓库与库区库位、条码赋码、SN码"
      url="https://doc.iocoder.cn/mes/wm/warehouse-setup/"
    />

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <!-- 搜索工作栏 -->
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item
          label="业务类型"
          prop="bizType"
        >
          <el-select
            v-model="queryParams.bizType"
            placeholder="请选择业务类型"
            clearable
            class="wm-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_BARCODE_BIZ_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="业务编码"
          prop="bizCode"
        >
          <el-input
            v-model="queryParams.bizCode"
            placeholder="请输入业务编码"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="业务名称"
          prop="bizName"
        >
          <el-input
            v-model="queryParams.bizName"
            placeholder="请输入业务名称"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="条码内容"
          prop="content"
        >
          <el-input
            v-model="queryParams.content"
            placeholder="请输入条码内容"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['mes:wm-barcode:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-barcode:delete']"
            type="danger"
            plain
            :disabled="!selectedIds.length"
            @click="handleDelete()"
          >
            <i class="el-icon-delete mr-5px" /> 删除
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-barcode-config:query']"
            type="success"
            plain
            @click="handleConfig"
          >
            <i class="el-icon-more mr-5px" /> 条码设置
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-barcode:export']"
            type="warning"
            plain
            :loading="exportLoading"
            @click="handleExport"
          >
            <i class="el-icon-download mr-5px" /> 导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column
          label="条码"
          align="center"
          width="150"
        >
          <template slot-scope="scope">
            <div class="flex justify-center items-center">
              <Barcode
                v-if="scope.row.content"
                :content="scope.row.content"
                :format="scope.row.format"
                :width="120"
                :height="60"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="条码格式"
          align="center"
          prop="format"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_BARCODE_FORMAT"
              :value="scope.row.format"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="业务类型"
          align="center"
          prop="bizType"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_BARCODE_BIZ_TYPE"
              :value="scope.row.bizType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="条码内容"
          align="center"
          prop="content"
          show-overflow-tooltip
        />
        <el-table-column
          label="业务编码"
          align="center"
          prop="bizCode"
        />
        <el-table-column
          label="业务名称"
          align="center"
          prop="bizName"
          show-overflow-tooltip
        />
        <el-table-column
          label="状态"
          align="center"
          prop="status"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.COMMON_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="220px"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-barcode:query']"
              type="text"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-barcode:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-barcode:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-barcode:query']"
              type="text"
              @click="handleBarcode(scope.row)"
            >
              条码
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 表单弹窗：添加/修改 -->
    <BarcodeForm
      ref="formRef"
      @success="getList"
    />

    <!-- 查看弹窗 -->
    <BarcodeDetail ref="viewDialogRef" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { WmBarcodeApi } from '@/api/mes/wm/barcode'
import { Barcode, BarcodeDetail } from './components'
import BarcodeForm from './BarcodeForm.vue'
import download from '@/plugins/download'
export default {
  name: 'MesWmBarcode',
  components: { Barcode, BarcodeDetail, BarcodeForm },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const t = (...args) => vm.$t(...args)
    const push = (...args) => vm.$router.push(...args)
    const loading = ref(true)
    const list = ref([])
    const total = ref(0)
    const selectedIds = ref([])
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      bizType: undefined,
      bizCode: undefined,
      bizName: undefined,
      content: undefined
    })
    const queryFormRef = ref()
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmBarcodeApi.getBarcodePage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 搜索按钮操作 */
    const handleQuery = () => {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置按钮操作 */
    const resetQuery = () => {
      queryFormRef.value.resetFields()
      handleQuery()
    }
    /** 多选框选中数据 */
    const handleSelectionChange = (selection) => {
      selectedIds.value = selection.map((item) => item.id)
    }
    /** 添加/修改操作 */
    const formRef = ref()
    const openForm = (type, id) => {
      formRef.value.open(type, id)
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      const ids = id ? [id] : selectedIds.value
      try {
        await message.delConfirm()
        await Promise.all(ids.map((id) => WmBarcodeApi.deleteBarcode(id)))
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 查看条码 */
    const viewDialogRef = ref()
    const handleView = (row) => {
      viewDialogRef.value.open(row)
    }
    /** 查看条码 - 打开详情弹窗 */
    const handleBarcode = (row) => {
      handleView(row)
    }
    /** 条码设置 */
    const handleConfig = () => {
      push({ name: 'MesWmBarcodeConfig' })
    }
    /** 导出按钮操作 */
    const exportLoading = ref(false)
    const handleExport = async() => {
      try {
        // 导出的二次确认
        await message.exportConfirm()
        // 发起导出
        exportLoading.value = true
        const data = await WmBarcodeApi.exportBarcode(queryParams)
        download.excel(data, '条码清单.xls')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        exportLoading.value = false
      }
    }
    onMounted(() => {
      getList()
    })
    return { Barcode, BarcodeDetail, BarcodeForm, DICT_TYPE, download, exportLoading, formRef, getIntDictOptions, getList, handleBarcode, handleConfig, handleDelete, handleExport, handleQuery, handleSelectionChange, handleView, list, loading, message, openForm, push, queryFormRef, queryParams, resetQuery, selectedIds, t, total, viewDialogRef }
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
