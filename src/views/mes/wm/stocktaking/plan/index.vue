<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】库存盘点"
      url="https://doc.iocoder.cn/mes/wm/stocktaking/"
    />

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-width="100px"
        class="-mb-15px"
      >
        <el-form-item
          label="方案编码"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入方案编码"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="方案名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入方案名称"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="盘点类型"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            placeholder="请选择盘点类型"
            clearable
            class="wm-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_STOCK_TAKING_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" />搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" />重置</el-button>
          <el-button
            v-hasPermi="['mes:wm-stock-taking-plan:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-stock-taking-plan:export']"
            type="success"
            plain
            :loading="exportLoading"
            @click="handleExport"
          >
            <i class="el-icon-download mr-5px" />导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="方案编码"
          align="center"
          prop="code"
          min-width="160"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openForm('detail', scope.row.id)"
            >
              {{ scope.row.code }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="方案名称"
          align="center"
          prop="name"
          min-width="160"
        />
        <el-table-column
          label="盘点类型"
          align="center"
          prop="type"
          min-width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_STOCK_TAKING_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="开始时间"
          align="center"
          prop="startTime"
          :formatter="dateFormatter"
          width="180"
        />
        <el-table-column
          label="结束时间"
          align="center"
          prop="endTime"
          :formatter="dateFormatter"
          width="180"
        />
        <el-table-column
          label="是否盲盘"
          align="center"
          prop="blindFlag"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="scope.row.blindFlag"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="是否冻结库存"
          align="center"
          prop="frozen"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="scope.row.frozen"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          width="120"
        >
          <template slot-scope="scope">
            <el-switch
              :value="scope.row.status"
              :active-value="CommonStatusEnum.ENABLE"
              :inactive-value="CommonStatusEnum.DISABLE"
              :disabled="loading"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="220"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-tooltip
              :disabled="scope.row.status === CommonStatusEnum.DISABLE"
              content="仅关闭状态，才可以操作"
              placement="top"
            >
              <span class="inline-block cursor-not-allowed">
                <el-button

                  v-hasPermi="['mes:wm-stock-taking-plan:update']"
                  type="text"
                  :disabled="scope.row.status !== CommonStatusEnum.DISABLE"
                  @click="openForm('update', scope.row.id)"
                >
                  编辑
                </el-button>
              </span>
            </el-tooltip>
            <el-tooltip
              :disabled="scope.row.status === CommonStatusEnum.DISABLE"
              content="仅关闭状态，才可以操作"
              placement="top"
            >
              <span class="inline-block cursor-not-allowed ml-10px">
                <el-button

                  v-hasPermi="['mes:wm-stock-taking-plan:delete']"
                  type="text"
                  :disabled="scope.row.status !== CommonStatusEnum.DISABLE"
                  @click="handleDelete(scope.row.id)"
                >
                  删除
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改盘点方案对话框 -->
    <StockTakingPlanForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import { CommonStatusEnum } from '@/utils/constants'
import { StockTakingPlanApi } from '@/api/mes/wm/stocktaking/plan/index'
import StockTakingPlanForm from './StockTakingPlanForm.vue'
export default {
  name: 'MesWmStockTakingPlan',
  components: { StockTakingPlanForm },
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
    const loading = ref(true) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const exportLoading = ref(false) // 导出的加载中
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      code: undefined,
      name: undefined,
      type: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const formRef = ref() // 表单弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await StockTakingPlanApi.getStockTakingPlanPage(queryParams)).data
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
    const openForm = (type, id) => {
      formRef.value.open(type, id)
    }
    /** 修改盘点方案状态 */
    const handleStatusChange = async(row) => {
      try {
        const newStatus = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
        const text = newStatus === CommonStatusEnum.ENABLE ? '启用' : '停用'
        await message.confirm(`确认要${text}”${row.name}”盘点方案吗？`);
        (await StockTakingPlanApi.updateStockTakingPlanStatus(row.id, newStatus)).data
        message.success(`${text}成功`)
        await getList()
      } catch {
        await getList()
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await StockTakingPlanApi.deleteStockTakingPlan(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 导出按钮操作 */
    const handleExport = async() => {
      try {
        await message.exportConfirm()
        exportLoading.value = true
        const data = await StockTakingPlanApi.exportStockTakingPlan(queryParams)
        download.excel(data, '盘点方案.xls')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        exportLoading.value = false
      }
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    return { CommonStatusEnum, DICT_TYPE, StockTakingPlanForm, dateFormatter, download, exportLoading, formRef, getIntDictOptions, getList, handleDelete, handleExport, handleQuery, handleStatusChange, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
