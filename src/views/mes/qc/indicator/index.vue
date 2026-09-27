<template>
  <div class="app-container qc-migrated">
    <doc-alert
      title="【质量】检测项设置、常见缺陷"
      url="https://doc.iocoder.cn/mes/qc/base/"
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
          label="检测项编码"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入检测项编码"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="检测项名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入检测项名称"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="检测项类型"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            placeholder="请选择检测项类型"
            clearable
            class="qc-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_INDICATOR_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="结果值类型"
          prop="resultType"
        >
          <el-select
            v-model="queryParams.resultType"
            placeholder="请选择结果值类型"
            clearable
            class="qc-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_RESULT_TYPE)"
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
            v-hasPermi="['mes:qc-indicator:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:qc-indicator:export']"
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
          label="检测项编码"
          align="center"
          prop="code"
          width="120"
        />
        <el-table-column
          label="检测项名称"
          align="center"
          prop="name"
          min-width="150"
        />
        <el-table-column
          label="检测项类型"
          align="center"
          prop="type"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_INDICATOR_TYPE"
              :value="scope.row.type"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="检测工具"
          align="center"
          prop="tool"
          width="120"
        />
        <el-table-column
          label="结果值类型"
          align="center"
          prop="resultType"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_QC_RESULT_TYPE"
              :value="scope.row.resultType"
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
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:qc-indicator:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-hasPermi="['mes:qc-indicator:delete']"
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
    <IndicatorForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import { QcIndicatorApi } from '@/api/mes/qc/indicator'
import IndicatorForm from './IndicatorForm.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
export default {
  name: 'MesQcIndicator',
  components: { IndicatorForm },
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
      resultType: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const formRef = ref() // 表单弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await QcIndicatorApi.getIndicatorPage(queryParams)).data
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
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        // 删除的二次确认
        await message.delConfirm();
        // 发起删除
        (await QcIndicatorApi.deleteIndicator(id)).data
        message.success(t('common.delSuccess'))
        // 刷新列表
        await getList()
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    /** 导出按钮操作 */
    const handleExport = async() => {
      try {
        // 导出的二次确认
        await message.exportConfirm()
        // 发起导出
        exportLoading.value = true
        const data = await QcIndicatorApi.exportIndicator(queryParams)
        download.excel(data, '质检指标.xls')
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
    return { DICT_TYPE, IndicatorForm, dateFormatter, download, exportLoading, formRef, getIntDictOptions, getList, handleDelete, handleExport, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
