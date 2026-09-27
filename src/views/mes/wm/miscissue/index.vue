<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】其他入库、其他出库"
      url="https://doc.iocoder.cn/mes/wm/misc/"
    />

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item
          label="出库单编号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入出库单编号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="出库单名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入出库单名称"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="业务类型"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            placeholder="请选择业务类型"
            clearable
            class="wm-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_MISC_ISSUE_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="来源单据类型"
          prop="sourceDocType"
        >
          <el-input
            v-model="queryParams.sourceDocType"
            placeholder="请输入来源单据类型"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="来源单据编号"
          prop="sourceDocCode"
        >
          <el-input
            v-model="queryParams.sourceDocCode"
            placeholder="请输入来源单据编号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="出库日期"
          prop="issueDate"
        >
          <el-date-picker
            v-model="queryParams.issueDate"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item
          label="单据状态"
          prop="status"
        >
          <el-select
            v-model="queryParams.status"
            placeholder="请选择单据状态"
            clearable
            class="wm-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_MISC_ISSUE_STATUS)"
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
            v-hasPermi="['mes:wm-misc-issue:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-misc-issue:export']"
            type="success"
            plain
            :loading="exportLoading"
            @click="handleExport"
          >
            <i class="el-icon-download mr-5px" /> 导出
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
          label="出库单编号"
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
          label="出库单名称"
          align="center"
          prop="name"
          min-width="150"
        />
        <el-table-column
          label="业务类型"
          align="center"
          prop="type"
          min-width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_MISC_ISSUE_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="来源单据类型"
          align="center"
          prop="sourceDocType"
          min-width="120"
        />
        <el-table-column
          label="来源单据编号"
          align="center"
          prop="sourceDocCode"
          min-width="150"
        />
        <el-table-column
          label="出库日期"
          align="center"
          prop="issueDate"
          :formatter="dateFormatter2"
          width="180px"
        />
        <el-table-column
          label="单据状态"
          align="center"
          prop="status"
          min-width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_MISC_ISSUE_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="240"
          fixed="right"
        >
          <template slot-scope="scope">
            <!-- 草稿：编辑、提交、删除 -->
            <el-button

              v-if="scope.row.status === MesWmMiscIssueStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-misc-issue:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-if="scope.row.status === MesWmMiscIssueStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-misc-issue:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <!-- 待执行出库：执行出库、取消 -->
            <el-button

              v-if="scope.row.status === MesWmMiscIssueStatusEnum.APPROVED"
              v-hasPermi="['mes:wm-misc-issue:finish']"
              type="text"
              @click="openForm('finish', scope.row.id)"
            >
              执行出库
            </el-button>
            <el-button

              v-if="scope.row.status === MesWmMiscIssueStatusEnum.APPROVED"
              v-hasPermi="['mes:wm-misc-issue:update']"
              type="text"
              @click="handleCancel(scope.row.id)"
            >
              取消
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
    </el-card>

    <MiscIssueForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/plugins/download'
import { WmMiscIssueApi } from '@/api/mes/wm/miscissue'
import MiscIssueForm from './MiscIssueForm.vue'
import { MesWmMiscIssueStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MesWmMiscIssue',
  components: { MiscIssueForm },
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
      type: undefined,
      sourceDocType: undefined,
      sourceDocCode: undefined,
      issueDate: undefined,
      status: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const formRef = ref() // 表单弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmMiscIssueApi.getMiscIssuePage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 搜索 */
    const handleQuery = () => {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置 */
    const resetQuery = () => {
      queryFormRef.value.resetFields()
      handleQuery()
    }
    /** 添加/修改/详情/提交/执行出库 */
    const openForm = (type, id) => {
      formRef.value.open(type, id)
    }
    /** 取消按钮操作 */
    const handleCancel = async(id) => {
      try {
        await message.confirm('确认取消该杂项出库单？取消后不可恢复。');
        (await WmMiscIssueApi.cancelMiscIssue(id)).data
        message.success('取消成功')
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmMiscIssueApi.deleteMiscIssue(id)).data
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
        const data = await WmMiscIssueApi.exportMiscIssue(queryParams)
        download.excel(data, '杂项出库单.xls')
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
    return { DICT_TYPE, MesWmMiscIssueStatusEnum, MiscIssueForm, dateFormatter2, download, exportLoading, formRef, getIntDictOptions, getList, handleCancel, handleDelete, handleExport, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
