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
          label="条码格式"
          prop="format"
        >
          <el-select
            v-model="queryParams.format"
            placeholder="请选择条码格式"
            clearable
            class="wm-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_BARCODE_FORMAT)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
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
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['mes:wm-barcode-config:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
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
        :show-overflow-tooltip="true"
      >
        <el-table-column
          key="id"
          label="编号"
          align="center"
          prop="id"
          width="100"
        />
        <el-table-column
          key="format"
          label="条码格式"
          align="center"
          prop="format"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_BARCODE_FORMAT"
              :value="scope.row.format"
            />
          </template>
        </el-table-column>
        <el-table-column
          key="bizType"
          label="业务类型"
          align="center"
          prop="bizType"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_BARCODE_BIZ_TYPE"
              :value="scope.row.bizType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="内容格式"
          align="center"
          prop="contentFormat"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          label="内容样例"
          align="center"
          prop="contentExample"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          label="默认打印模板"
          align="center"
          prop="defaultTemplate"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          key="autoGenerateFlag"
          label="自动生成"
          align="center"
          prop="autoGenerateFlag"
          width="100"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.autoGenerateFlag"
              @change="handleAutoGenerateChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          key="status"
          label="状态"
          align="center"
          prop="status"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.COMMON_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          width="180"
        />
        <el-table-column
          label="操作"
          align="center"
          width="150"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-barcode-config:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-barcode-config:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
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
    <BarcodeConfigForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { WmBarcodeConfigApi as BarcodeConfigApi } from '@/api/mes/wm/barcode/config'
import BarcodeConfigForm from './BarcodeConfigForm.vue'
export default {
  name: 'MesWmBarcodeConfig',
  components: { BarcodeConfigForm },
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
    const loading = ref(true)
    const list = ref([])
    const total = ref(0)
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      format: undefined,
      bizType: undefined
    })
    const queryFormRef = ref()
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await BarcodeConfigApi.getBarcodeConfigPage(queryParams)).data
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
    /** 添加/修改操作 */
    const formRef = ref()
    const openForm = (type, id) => {
      formRef.value.open(type, id)
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await BarcodeConfigApi.deleteBarcodeConfig(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 自动生成开关变更 */
    const handleAutoGenerateChange = async(row) => {
      const text = row.autoGenerateFlag ? '启用' : '停用'
      try {
        await message.confirm(`确认要${text}自动生成吗？`);
        (await BarcodeConfigApi.updateBarcodeConfig(row)).data
        message.success(`${text}成功`)
      } catch {
        row.autoGenerateFlag = !row.autoGenerateFlag
      }
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    return { BarcodeConfigForm, DICT_TYPE, dateFormatter, formRef, getIntDictOptions, getList, handleAutoGenerateChange, handleDelete, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
