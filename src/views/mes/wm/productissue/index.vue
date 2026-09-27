<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】生产领料、生产退料、物料消耗"
      url="https://doc.iocoder.cn/mes/wm/issue-return/"
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
          label="领料单编号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入领料单编号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="领料单名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入领料单名称"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="领料日期"
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
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_PRODUCT_ISSUE_STATUS)"
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
            v-hasPermi="['mes:wm-product-issue:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-product-issue:export']"
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
          label="领料单编号"
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
          label="领料单名称"
          align="center"
          prop="name"
          min-width="150"
        />
        <el-table-column
          label="生产工单"
          align="center"
          prop="workOrderCode"
          min-width="140"
        />
        <el-table-column
          label="工作站"
          align="center"
          prop="workstationName"
          min-width="120"
        />
        <el-table-column
          label="客户编号"
          align="center"
          prop="clientCode"
          min-width="120"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="clientName"
          min-width="120"
        />
        <el-table-column
          label="需求时间"
          align="center"
          prop="requiredTime"
          :formatter="dateFormatter2"
          width="180px"
        />
        <el-table-column
          label="单据状态"
          align="center"
          prop="status"
          min-width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_PRODUCT_ISSUE_STATUS"
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

              v-if="scope.row.status === MesWmProductIssueStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-product-issue:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-if="scope.row.status === MesWmProductIssueStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-product-issue:update']"
              type="text"
              @click="handleSubmit(scope.row.id)"
            >
              提交
            </el-button>
            <el-button

              v-if="scope.row.status === MesWmProductIssueStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-product-issue:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <!-- 待拣货：执行拣货 -->
            <el-button

              v-if="scope.row.status === MesWmProductIssueStatusEnum.APPROVING"
              v-hasPermi="['mes:wm-product-issue:update']"
              type="text"
              @click="openForm('stock', scope.row.id)"
            >
              执行拣货
            </el-button>
            <!-- 待执行领出：完成 -->
            <el-button

              v-if="scope.row.status === MesWmProductIssueStatusEnum.APPROVED"
              v-hasPermi="['mes:wm-product-issue:finish']"
              type="text"
              @click="openForm('finish', scope.row.id)"
            >
              完成
            </el-button>
            <!-- 待拣货、待执行领出：取消 -->
            <el-button

              v-if="
                [
                  MesWmProductIssueStatusEnum.APPROVING,
                  MesWmProductIssueStatusEnum.APPROVED
                ].includes(scope.row.status)
              "
              v-hasPermi="['mes:wm-product-issue:update']"
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

    <ProductIssueForm
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
import { WmProductIssueApi } from '@/api/mes/wm/productissue'
import ProductIssueForm from './ProductIssueForm.vue'
import { MesWmProductIssueStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MesWmProductIssue',
  components: { ProductIssueForm },
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
      status: undefined,
      issueDate: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const formRef = ref() // 表单弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmProductIssueApi.getProductIssuePage(queryParams)).data
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
    /** 取消按钮操作 */
    const handleCancel = async(id) => {
      try {
        await message.confirm('确认取消该领料出库单？取消后不可恢复。');
        (await WmProductIssueApi.cancelProductIssue(id)).data
        message.success('取消成功')
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 提交按钮操作 */
    const handleSubmit = async(id) => {
      try {
        await message.confirm('确认提交该领料出库单？提交后将不能修改。');
        (await WmProductIssueApi.submitProductIssue(id)).data
        message.success('提交成功')
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmProductIssueApi.deleteProductIssue(id)).data
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
        const data = await WmProductIssueApi.exportProductIssue(queryParams)
        download.excel(data, '领料出库单.xls')
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
    return { DICT_TYPE, MesWmProductIssueStatusEnum, ProductIssueForm, dateFormatter2, download, exportLoading, formRef, getIntDictOptions, getList, handleCancel, handleDelete, handleExport, handleQuery, handleSubmit, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
