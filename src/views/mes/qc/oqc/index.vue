<template>
  <div class="app-container qc-migrated">
    <doc-alert
      title="【质量】出货检验（OQC）"
      url="https://doc.iocoder.cn/mes/qc/oqc/"
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
          label="检验单编号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入检验单编号"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="客户"
          prop="clientId"
        >
          <MdClientSelect
            v-model="queryParams.clientId"
            placeholder="请选择客户"
            clearable
            class="qc-w-240"
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
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="产品物料"
          prop="itemId"
        >
          <MdItemSelect
            v-model="queryParams.itemId"
            placeholder="请选择产品物料"
            clearable
            class="qc-w-240"
          />
        </el-form-item>
        <el-form-item
          label="检测结果"
          prop="checkResult"
        >
          <el-select
            v-model="queryParams.checkResult"
            placeholder="请选择检测结果"
            clearable
            class="qc-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_CHECK_RESULT)"
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
            v-hasPermi="['mes:qc-oqc:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['mes:qc-oqc:export']"
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
          label="检验单编号"
          align="center"
          prop="code"
          width="160"
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
          label="检验单名称"
          align="center"
          prop="name"
          min-width="180"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="clientNickname"
          width="120"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          width="130"
        />
        <el-table-column
          label="产品物料编码"
          align="center"
          prop="itemCode"
          width="130"
        />
        <el-table-column
          label="产品物料名称"
          align="center"
          prop="itemName"
          min-width="150"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="itemSpecification"
          min-width="150"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitName"
          width="80"
        />
        <el-table-column
          label="发货数量"
          align="center"
          prop="outQuantity"
          width="100"
        />
        <el-table-column
          label="检测数量"
          align="center"
          prop="checkQuantity"
          width="100"
        />
        <el-table-column
          label="不合格数"
          align="center"
          prop="unqualifiedQuantity"
          width="100"
        />
        <el-table-column
          label="检测结果"
          align="center"
          prop="checkResult"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_QC_CHECK_RESULT"
              :value="scope.row.checkResult"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="出货日期"
          align="center"
          prop="outDate"
          :formatter="dateFormatter2"
          width="180px"
        />
        <el-table-column
          label="检测日期"
          align="center"
          prop="inspectDate"
          :formatter="dateFormatter2"
          width="180px"
        />
        <el-table-column
          label="检测人员"
          align="center"
          prop="inspectorNickname"
          width="100"
        />
        <el-table-column
          label="单据状态"
          align="center"
          prop="status"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_ORDER_STATUS"
              :value="scope.row.status"
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
            <el-button

              v-if="scope.row.status === MesQcStatusEnum.DRAFT"
              v-hasPermi="['mes:qc-oqc:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-if="scope.row.status === MesQcStatusEnum.DRAFT"
              v-hasPermi="['mes:qc-oqc:delete']"
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
    <OqcForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/plugins/download'
import { QcOqcApi } from '@/api/mes/qc/oqc'
import OqcForm from './OqcForm.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import { MesQcStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MesQcOqc',
  components: { OqcForm, MdClientSelect, MdItemSelect },
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
      clientId: undefined,
      batchCode: undefined,
      itemId: undefined,
      checkResult: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const exportLoading = ref(false) // 导出的加载中
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await QcOqcApi.getOqcPage(queryParams)).data
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
        (await QcOqcApi.deleteOqc(id)).data
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
        const data = await QcOqcApi.exportOqc(queryParams)
        download.excel(data, '出货检验单.xls')
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
    return { DICT_TYPE, MdClientSelect, MdItemSelect, MesQcStatusEnum, OqcForm, dateFormatter2, download, exportLoading, formRef, getIntDictOptions, getList, handleDelete, handleExport, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
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
