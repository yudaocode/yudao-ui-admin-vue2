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
          label="SN 码"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入 SN 码"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="物料"
          prop="itemId"
        >
          <MdItemSelect
            v-model="queryParams.itemId"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item
          label="批次号"
          prop="batchCode"
        >
          <el-input
            v-model="queryParams.batchCode"
            placeholder="请输入批次号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="创建时间"
          prop="createTime"
        >
          <el-date-picker
            v-model="queryParams.createTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['mes:wm-sn:create']"
            type="primary"
            plain
            @click="openForm()"
          >
            <i class="el-icon-plus mr-5px" /> 生成 SN 码
          </el-button>
          <el-button
            v-hasPermi="['mes:wm-sn:export']"
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

    <!-- 列表 -->
    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
        stripe
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
          min-width="150"
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
          prop="unitName"
          min-width="80"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="SN 码数量"
          align="center"
          prop="count"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-sn:query']"
              type="text"
              @click="openDetail(scope.row)"
            >
              {{ scope.row.count }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="生成时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          width="180px"
        />
        <el-table-column
          label="操作"
          align="center"
          width="240"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-sn:query']"
              type="text"
              @click="openDetail(scope.row)"
            >
              查看明细
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-sn:export']"
              type="text"
              @click="handleExportDetail(scope.row.uuid)"
            >
              导出明细
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-sn:delete']"
              type="text"
              @click="handleDelete(scope.row.uuid)"
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

    <!-- 表单弹窗：生成 SN 码 -->
    <WmSnGenerateForm
      ref="formRef"
      @success="getList"
    />

    <!-- SN 码明细弹窗 -->
    <WmSnDetailDialog ref="detailRef" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import * as WmSnApi from '@/api/mes/wm/sn'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmSnGenerateForm from './WmSnGenerateForm.vue'
import WmSnDetailDialog from './WmSnDetailDialog.vue'
export default {
  name: 'MesWmSn',
  components: { MdItemSelect, WmSnGenerateForm, WmSnDetailDialog },
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
    const loading = ref(true) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      // 查询参数
      pageNo: 1,
      pageSize: 10,
      uuid: undefined,
      code: undefined,
      itemId: undefined,
      batchCode: undefined,
      createTime: []
    })
    const queryFormRef = ref() // 搜索的表单
    const exportLoading = ref(false) // 导出的加载中
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmSnApi.getSnGroupPage(queryParams)).data
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
    const formRef = ref() // 表单 Ref
    const openForm = () => {
      formRef.value.open()
    }
    /** 查看 SN 码明细 */
    const detailRef = ref()
    const openDetail = (row) => {
      detailRef.value.open(row)
    }
    /** 删除按钮操作 */
    const handleDelete = async(uuid) => {
      try {
        await message.delConfirm();
        (await WmSnApi.deleteSnBatch(uuid)).data
        message.success('删除成功')
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 导出分组按钮操作 */
    const handleExport = async() => {
      try {
        // 导出的二次确认
        await message.exportConfirm()
        // 发起导出
        exportLoading.value = true
        const data = await WmSnApi.exportSnGroupExcel(queryParams)
        download.excel(data, 'SN码分组.xls')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        exportLoading.value = false
      }
    }
    /** 导出批次明细按钮操作 */
    const handleExportDetail = async(uuid) => {
      try {
        // 导出的二次确认
        await message.exportConfirm()
        // 发起导出
        const data = await WmSnApi.exportSnDetailExcel(uuid)
        download.excel(data, 'SN码明细.xls')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 初始化 **/
    onMounted(() => {
      getList()
    })
    return { MdItemSelect, WmSnDetailDialog, WmSnGenerateForm, dateFormatter, detailRef, download, exportLoading, formRef, getList, handleDelete, handleExport, handleExportDetail, handleQuery, list, loading, message, openDetail, openForm, queryFormRef, queryParams, resetQuery, total }
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
