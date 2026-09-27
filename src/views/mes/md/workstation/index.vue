<template>
  <div class="app-container"><doc-alert
                               title="【基础】车间设置、工作站设置"
                               url="https://doc.iocoder.cn/mes/md/workshop/"
                             />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="85px"
      size="small"
      @submit.native.prevent
    ><el-form-item
      label="工作站编码"
      prop="code"
    ><el-input
      v-model="queryParams.code"
      placeholder="请输入工作站编码"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="工作站名称"
      prop="name"
    ><el-input
      v-model="queryParams.name"
      placeholder="请输入工作站名称"
      clearable
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="所在车间"
      prop="workshopId"
    ><md-workshop-select
      v-model="queryParams.workshopId"
      placeholder="请选择车间"
      clearable
    /></el-form-item><el-form-item
      label="所属工序"
      prop="processId"
    ><pro-process-select
      v-model="queryParams.processId"
      placeholder="请选择工序"
      clearable
    /></el-form-item><el-form-item
      label="状态"
      prop="status"
    ><el-select
      v-model="queryParams.status"
      placeholder="请选择状态"
      clearable
    ><el-option
      v-for="dict in statusOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    /></el-select></el-form-item><el-form-item><el-button
      icon="el-icon-search"
      @click="handleQuery"
    >搜索</el-button><el-button
      icon="el-icon-refresh"
      @click="resetQuery"
    >重置</el-button><el-button
      v-hasPermi="['mes:md-workstation:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增</el-button><el-button
      v-hasPermi="['mes:md-workstation:export']"
      type="success"
      plain
      icon="el-icon-download"
      :loading="exportLoading"
      @click="handleExport"
    >导出</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    ><el-table-column
      label="工作站编码"
      align="center"
      prop="code"
      min-width="120"
    ><template v-slot="scope"><el-link
      type="primary"
      @click="openForm('detail', scope.row.id)"
    >{{ scope.row.code }}</el-link></template></el-table-column><el-table-column
      label="工作站名称"
      align="center"
      prop="name"
      min-width="150"
    /><el-table-column
      label="工作站地点"
      align="center"
      prop="address"
      min-width="150"
    /><el-table-column
      label="所在车间"
      align="center"
      prop="workshopName"
      min-width="120"
    /><el-table-column
      label="所属工序"
      align="center"
      prop="processName"
      min-width="120"
    /><el-table-column
      label="状态"
      align="center"
      prop="status"
      min-width="100"
    ><template v-slot="scope"><dict-tag
      :type="DICT_TYPE.COMMON_STATUS"
      :value="scope.row.status"
    /></template></el-table-column><el-table-column
      label="创建时间"
      align="center"
      prop="createTime"
      width="180"
    ><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column><el-table-column
      label="操作"
      align="center"
      width="190"
    ><template v-slot="scope"><el-button
      v-hasPermi="['mes:md-workstation:update']"
      type="text"
      @click="openForm('update', scope.row.id)"
    >编辑</el-button><el-button
      v-hasPermi="['mes:md-workstation:delete']"
      type="text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button><el-button
      v-hasPermi="['mes:md-workstation:query']"
      type="text"
      @click="handleBarcode(scope.row)"
    >条码</el-button></template></el-table-column></el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><workstation-form
      ref="form"
      @success="getList"
    /><barcode-detail ref="barcodeDetail" />
  </div>
</template>
<script>
import { parseTime } from '@/utils/ruoyi'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MdWorkstationApi } from '@/api/mes/md/workstation'
import { BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import MdWorkshopSelect from './components/MdWorkshopSelect.vue'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'
import WorkstationForm from './WorkstationForm.vue'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
export default { name: 'MesMdWorkstation', components: { MdWorkshopSelect, ProProcessSelect, WorkstationForm, BarcodeDetail }, data() { return { DICT_TYPE, loading: true, exportLoading: false, list: [], total: 0, statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, workshopId: undefined, processId: undefined, status: undefined }} }, created() { this.getList() }, methods: { parseTime, async getList() { this.loading = true; try { const response = await MdWorkstationApi.getWorkstationPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } }, handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.resetForm('queryForm'); return this.handleQuery() }, openForm(type, id) { this.$refs.form.open(type, id) }, async handleDelete(id) { try { await this.$modal.confirm('是否确认删除工作站？'); await MdWorkstationApi.deleteWorkstation(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } }, handleBarcode(row) { return this.$refs.barcodeDetail.openByBusiness(row.id, BarcodeBizTypeEnum.WORKSTATION, row.code, row.name) }, async handleExport() { try { await this.$modal.confirm('是否确认导出所有工作站数据项？'); this.exportLoading = true; const response = await MdWorkstationApi.exportWorkstation(this.queryParams); this.$download.excel(response, '工作站.xls') } catch (error) { /* 取消导出 */ } finally { this.exportLoading = false } } }}
</script>
