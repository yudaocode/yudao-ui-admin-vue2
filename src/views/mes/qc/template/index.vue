<template>
  <div class="app-container qc-migrated">
    <doc-alert
      title="【质量】质检方案"
      url="https://doc.iocoder.cn/mes/qc/template/"
    />

    <el-card
      shadow="never"
      class="qc-content-wrap"
    >
      <!-- 搜索工作栏 -->
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item
          label="方案编号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入方案编号"
            clearable
            class="qc-w-240"
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
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="检测种类"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            placeholder="请选择检测种类"
            clearable
            class="qc-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            class="qc-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
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
            v-hasPermi="['mes:qc-template:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:qc-template:export']"
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
      class="qc-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="方案编号"
          align="center"
          prop="code"
          width="150"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              @click="openForm('detail', scope.row.id)"
            >
              {{ scope.row.code }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="方案名称"
          align="center"
          prop="name"
          min-width="200"
        />
        <el-table-column
          label="检测种类"
          align="center"
          prop="types"
          min-width="200"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_QC_TYPE"
              :value="scope.row.types"
            />
          </template>
        </el-table-column>
        <el-table-column
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
          label="备注"
          align="center"
          prop="remark"
          min-width="150"
        />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          width="180px"
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

              v-hasPermi="['mes:qc-template:delete']"
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

    <!-- 表单弹窗：添加/修改（编辑时含检测指标项和产品关联子表） -->
    <TemplateForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import { QcTemplateApi } from '@/api/mes/qc/template'
import TemplateForm from './TemplateForm.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
export default {
  name: 'MesQcTemplate',
  components: { TemplateForm },
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
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      code: undefined,
      name: undefined,
      type: undefined,
      status: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const exportLoading = ref(false) // 导出的加载中
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await QcTemplateApi.getTemplatePage(queryParams)).data
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
        (await QcTemplateApi.deleteTemplate(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    /** 导出按钮操作 */
    const handleExport = async() => {
      try {
        await message.exportConfirm()
        exportLoading.value = true
        const data = await QcTemplateApi.exportTemplate(queryParams)
        download.excel(data, '质检方案.xls')
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      } finally {
        exportLoading.value = false
      }
    }
    /** 初始化 **/
    onMounted(() => {
      getList()
    })
    return { DICT_TYPE, TemplateForm, dateFormatter, download, exportLoading, formRef, getIntDictOptions, getList, handleDelete, handleExport, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
