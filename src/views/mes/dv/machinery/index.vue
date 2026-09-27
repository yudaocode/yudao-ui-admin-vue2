<!-- MES 设备台账列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【设备】设备类型、设备台账" url="https://doc.iocoder.cn/mes/dv/device/" />
    <el-row :gutter="20">
      <el-col :span="4" :xs="24"><machinery-type-tree @node-click="handleTypeNodeClick" /></el-col>
      <el-col :span="20" :xs="24">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px" size="small" @submit.native.prevent>
          <el-form-item label="设备编码" prop="code"><el-input v-model="queryParams.code" placeholder="请输入设备编码" clearable @keyup.enter.native="handleQuery" /></el-form-item>
          <el-form-item label="设备名称" prop="name"><el-input v-model="queryParams.name" placeholder="请输入设备名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
          <el-form-item label="所属车间" prop="workshopId"><el-select v-model="queryParams.workshopId" placeholder="请选择所属车间" clearable><el-option v-for="item in workshopList" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="设备状态" prop="status"><el-select v-model="queryParams.status" placeholder="请选择状态" clearable><el-option v-for="dict in machineryStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            <el-button v-hasPermi="['mes:dv-machinery:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
            <el-button v-hasPermi="['mes:dv-machinery:import']" type="warning" plain icon="el-icon-upload2" @click="handleImport">导入</el-button>
            <el-button v-hasPermi="['mes:dv-machinery:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
          <el-table-column label="设备编码" align="center" prop="code" width="120"><template v-slot="scope"><el-link type="primary" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-link></template></el-table-column>
          <el-table-column label="设备名称" align="center" prop="name" min-width="150" />
          <el-table-column label="品牌" align="center" prop="brand" width="100" />
          <el-table-column label="规格型号" align="center" prop="specification" width="120" />
          <el-table-column label="设备类型" align="center" prop="machineryTypeName" width="120" />
          <el-table-column label="所属车间" align="center" prop="workshopName" width="120" />
          <el-table-column label="设备状态" align="center" prop="status" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_MACHINERY_STATUS" :value="scope.row.status" /></template></el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="180"><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
          <el-table-column label="操作" align="center" width="170">
            <template v-slot="scope">
              <el-button v-hasPermi="['mes:dv-machinery:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
              <el-button v-hasPermi="['mes:dv-machinery:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
              <el-button v-hasPermi="['mes:dv-machinery:query']" type="text" size="mini" @click="handleBarcode(scope.row)">条码</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <machinery-form ref="form" @success="getList" />
    <machinery-import-form ref="importForm" @success="getList" />
    <barcode-detail ref="barcodeDetail" />
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { DvMachineryApi } from '@/api/mes/dv/machinery'
import { MdWorkshopApi } from '@/api/mes/md/workstation/workshop'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
import { BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import MachineryForm from './MachineryForm.vue'
import MachineryImportForm from './MachineryImportForm.vue'
import MachineryTypeTree from './type/components/MachineryTypeTree.vue'

const MES_DV_MACHINERY_STATUS = 'mes_dv_machinery_status'

export default {
  name: 'MesDvMachinery',
  components: { BarcodeDetail, MachineryForm, MachineryImportForm, MachineryTypeTree },
  data() {
    return {
      MES_DV_MACHINERY_STATUS,
      loading: true,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, machineryTypeId: undefined, workshopId: undefined, status: undefined },
      machineryStatusOptions: getIntDictOptions(MES_DV_MACHINERY_STATUS),
      workshopList: [],
      exportLoading: false
    }
  },
  async created() {
    await this.getList()
    const response = await MdWorkshopApi.getWorkshopSimpleList()
    this.workshopList = response.data
  },
  methods: {
    parseTime,
    async getList() {
      this.loading = true
      try {
        const response = await DvMachineryApi.getMachineryPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.machineryTypeId = undefined
      return this.handleQuery()
    },
    handleTypeNodeClick(row) {
      this.queryParams.machineryTypeId = row ? row.id : undefined
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除设备？')
        await DvMachineryApi.deleteMachinery(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持列表
      }
    },
    handleBarcode(row) {
      return this.$refs.barcodeDetail.openByBusiness(row.id, BarcodeBizTypeEnum.MACHINERY, row.code, row.name)
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有设备台账数据项？')
        this.exportLoading = true
        const response = await DvMachineryApi.exportMachinery(this.queryParams)
        this.$download.excel(response, '设备台账.xls')
      } catch (error) {
        // 取消导出时不处理
      } finally {
        this.exportLoading = false
      }
    },
    handleImport() {
      this.$refs.importForm.open()
    }
  }
}
</script>
