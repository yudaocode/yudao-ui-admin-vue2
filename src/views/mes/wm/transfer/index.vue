<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】调拨单、装箱管理"
      url="https://doc.iocoder.cn/mes/wm/transfer/"
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
          label="转移单编号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入转移单编号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="转移单名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入转移单名称"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="转移单类型"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            placeholder="请选择转移单类型"
            clearable
            class="wm-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_TRANSFER_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
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
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_TRANSFER_STATUS)"
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
            v-hasPermi="['mes:wm-transfer:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-transfer:export']"
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
          label="转移单编号"
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
          label="转移单名称"
          align="center"
          prop="name"
          min-width="160"
        />
        <el-table-column
          label="转移单类型"
          align="center"
          prop="type"
          min-width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_TRANSFER_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="是否配送"
          align="center"
          prop="deliveryFlag"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.deliveryFlag ? 'success' : 'info'">
              {{ scope.row.deliveryFlag ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="转移日期"
          align="center"
          prop="transferDate"
          :formatter="dateFormatter2"
          width="180"
        />
        <el-table-column
          label="单据状态"
          align="center"
          prop="status"
          min-width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_TRANSFER_STATUS"
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
            <!-- 草稿：编辑、删除 -->
            <el-button

              v-if="scope.row.status === MesWmTransferStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-transfer:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-if="scope.row.status === MesWmTransferStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-transfer:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <!-- 待确认：到货确认、取消 -->
            <el-button

              v-if="scope.row.status === MesWmTransferStatusEnum.UNCONFIRMED"
              v-hasPermi="['mes:wm-transfer:update']"
              type="text"
              @click="openForm('confirm', scope.row.id)"
            >
              到货确认
            </el-button>
            <!-- 待上架：执行上架、取消 -->
            <el-button

              v-if="scope.row.status === MesWmTransferStatusEnum.APPROVING"
              v-hasPermi="['mes:wm-transfer:update']"
              type="text"
              @click="openForm('stock', scope.row.id)"
            >
              执行上架
            </el-button>
            <!-- 待执行：执行转移、取消 -->
            <el-button

              v-if="scope.row.status === MesWmTransferStatusEnum.APPROVED"
              v-hasPermi="['mes:wm-transfer:finish']"
              type="text"
              @click="openForm('finish', scope.row.id)"
            >
              执行转移
            </el-button>
            <el-button

              v-if="
                [
                  MesWmTransferStatusEnum.UNCONFIRMED,
                  MesWmTransferStatusEnum.APPROVING,
                  MesWmTransferStatusEnum.APPROVED
                ].includes(scope.row.status)
              "
              v-hasPermi="['mes:wm-transfer:update']"
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

    <TransferForm
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
import { WmTransferApi } from '@/api/mes/wm/transfer'
import { MesWmTransferStatusEnum } from '@/views/mes/utils/constants'
import TransferForm from './TransferForm.vue'
export default {
  name: 'MesWmTransfer',
  components: { TransferForm },
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
      status: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const formRef = ref() // 表单弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmTransferApi.getTransferPage(queryParams)).data
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
        await message.confirm('确认取消该转移单？取消后不可恢复。');
        (await WmTransferApi.cancelTransfer(id)).data
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
        (await WmTransferApi.deleteTransfer(id)).data
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
        const data = await WmTransferApi.exportTransfer(queryParams)
        download.excel(data, '转移单.xls')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        exportLoading.value = false
      }
    }
    onMounted(() => {
      getList()
    })
    return { DICT_TYPE, MesWmTransferStatusEnum, TransferForm, dateFormatter2, download, exportLoading, formRef, getIntDictOptions, getList, handleCancel, handleDelete, handleExport, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
