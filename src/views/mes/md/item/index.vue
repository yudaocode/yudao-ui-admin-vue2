<template>
  <div class="app-container">
    <doc-alert
      title="【基础】物料产品、分类、计量单位"
      url="https://doc.iocoder.cn/mes/md/product/"
    />
    <el-row :gutter="20"><el-col
      :span="4"
      :xs="24"
    ><el-card><md-item-type-tree @node-click="handleTypeNodeClick" /></el-card></el-col><el-col
      :span="20"
      :xs="24"
    >
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="68px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="物料编码"
          prop="code"
        ><el-input
          v-model="queryParams.code"
          placeholder="请输入物料编码"
          clearable
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="物料名称"
          prop="name"
        ><el-input
          v-model="queryParams.name"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
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
        /></el-select></el-form-item>
        <el-form-item><el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button><el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button><el-button
          v-hasPermi="['mes:md-item:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button><el-button
          v-hasPermi="['mes:md-item:import']"
          type="warning"
          plain
          icon="el-icon-upload"
          @click="handleImport"
        >导入</el-button><el-button
          v-hasPermi="['mes:md-item:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button></el-form-item>
      </el-form>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="物料编码"
          align="center"
          prop="code"
        ><template v-slot="scope"><el-link
          type="primary"
          @click="openForm('detail', scope.row.id)"
        >{{ scope.row.code }}</el-link></template></el-table-column>
        <el-table-column
          label="物料名称"
          align="center"
          prop="name"
        /><el-table-column
          label="规格型号"
          align="center"
          prop="specification"
        /><el-table-column
          label="单位"
          align="center"
          prop="unitMeasureName"
        /><el-table-column
          label="物料分类"
          align="center"
          prop="itemTypeName"
        />
        <el-table-column
          label="物料/产品"
          align="center"
          prop="itemOrProduct"
        ><template v-slot="scope"><dict-tag
          :type="DICT_TYPE.MES_MD_ITEM_OR_PRODUCT"
          :value="scope.row.itemOrProduct"
        /></template></el-table-column>
        <el-table-column
          label="安全库存"
          align="center"
          prop="safeStockFlag"
        ><template v-slot="scope"><dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.safeStockFlag"
        /></template></el-table-column>
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          width="80"
        ><template v-slot="scope"><el-switch
          v-model="scope.row.status"
          :active-value="0"
          :inactive-value="1"
          :disabled="!checkPermi(['mes:md-item:update'])"
          @change="handleStatusChange(scope.row)"
        /></template></el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
        ><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="200"
        ><template v-slot="scope"><el-button
          v-hasPermi="['mes:md-item:update']"
          type="text"
          @click="openForm('update', scope.row.id)"
        >编辑</el-button><el-button
          v-hasPermi="['mes:md-item:delete']"
          type="text"
          @click="handleDelete(scope.row.id)"
        >删除</el-button><printer-label
          :biz-id="scope.row.id"
          :biz-code="scope.row.code"
          biz-type="ITEM"
        /></template></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-col></el-row>
    <md-item-form
      ref="form"
      @success="getList"
    /><md-item-import-form
      ref="importForm"
      @success="getList"
    /><barcode-detail ref="barcodeDetail" />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { parseTime } from '@/utils/ruoyi'
import { CommonStatusEnum } from '@/utils/constants'
import { MdItemApi } from '@/api/mes/md/item'
import MdItemForm from './MdItemForm.vue'
import MdItemImportForm from './MdItemImportForm.vue'
import MdItemTypeTree from './type/components/MdItemTypeTree.vue'
import { BarcodeDetail, PrinterLabel } from '@/views/mes/wm/barcode/components'
export default {
  name: 'MesMdItem', components: { MdItemForm, MdItemImportForm, MdItemTypeTree, BarcodeDetail, PrinterLabel },
  data() { return { DICT_TYPE, loading: true, exportLoading: false, list: [], total: 0, statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, itemTypeId: undefined, status: undefined }} },
  created() { this.getList() },
  methods: {
    parseTime, checkPermi,
    async getList() { this.loading = true; try { const response = await MdItemApi.getItemPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.resetForm('queryForm'); this.queryParams.itemTypeId = undefined; return this.handleQuery() }, handleTypeNodeClick(row) { this.queryParams.itemTypeId = row && row.id; return this.handleQuery() }, openForm(type, id) { this.$refs.form.open(type, id) },
    async handleStatusChange(row) { try { const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'; await this.$modal.confirm('确认要"' + text + '""' + row.name + '"物料吗?'); await MdItemApi.updateItemStatus(row.id, row.status); await this.getList() } catch (error) { row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除物料产品？'); await MdItemApi.deleteItem(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } },
    handleImport() { this.$refs.importForm.open() },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有物料产品数据项？'); this.exportLoading = true; const response = await MdItemApi.exportItem(this.queryParams); this.$download.excel(response, '物料产品.xls') } catch (error) { /* 取消导出 */ } finally { this.exportLoading = false } }
  }
}
</script>
