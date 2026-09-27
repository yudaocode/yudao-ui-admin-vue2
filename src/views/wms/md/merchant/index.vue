<template>
  <div class="app-container">
    <doc-alert
      title="【基础】往来企业（供应商、客户）"
      url="https://doc.iocoder.cn/wms/md/merchant/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    ><el-form-item
      label="往来企业编号"
      prop="code"
    ><el-input
      v-model="queryParams.code"
      clearable
      placeholder="请输入往来企业编号"
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="往来企业名称"
      prop="name"
    ><el-input
      v-model="queryParams.name"
      clearable
      placeholder="请输入往来企业名称"
      @keyup.enter.native="handleQuery"
    /></el-form-item><el-form-item
      label="往来企业类型"
      prop="type"
    ><el-select
      v-model="queryParams.type"
      clearable
      placeholder="请选择往来企业类型"
    ><el-option
      v-for="item in merchantTypeDictDatas"
      :key="item.value"
      :label="item.label"
      :value="Number(item.value)"
    /></el-select></el-form-item><el-form-item><el-button
      type="primary"
      icon="el-icon-search"
      @click="handleQuery"
    >搜索</el-button><el-button
      icon="el-icon-refresh"
      @click="resetQuery"
    >重置</el-button><el-button
      v-hasPermi="['wms:merchant:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增</el-button><el-button
      v-hasPermi="['wms:merchant:export']"
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
      label="往来企业编号"
      prop="code"
      align="center"
      width="160"
    /><el-table-column
      label="往来企业名称"
      prop="name"
      align="center"
      min-width="160"
    /><el-table-column
      label="往来企业类型"
      prop="type"
      align="center"
      width="120"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.WMS_MERCHANT_TYPE"
      :value="scope.row.type"
    /></template></el-table-column><el-table-column
      label="级别"
      prop="level"
      align="center"
      width="100"
    /><el-table-column
      label="联系人"
      prop="contact"
      align="center"
      width="120"
    /><el-table-column
      label="备注"
      prop="remark"
      align="center"
      min-width="160"
    /><el-table-column
      label="操作"
      align="center"
      width="150"
    ><template #default="scope"><el-button
      v-hasPermi="['wms:merchant:update']"
      type="text"
      size="mini"
      @click="openForm('update', scope.row.id)"
    >修改</el-button><el-button
      v-hasPermi="['wms:merchant:delete']"
      type="text"
      size="mini"
      @click="handleDelete(scope.row)"
    >删除</el-button></template></el-table-column></el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <merchant-form
      ref="form"
      @success="getList"
    />
  </div>
</template>
<script>
import { MerchantApi } from '@/api/wms/md/merchant'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import MerchantForm from './MerchantForm.vue'
export default {
  name: 'WmsMerchant',
  components: { MerchantForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      list: [],
      total: 0,
      merchantTypeDictDatas: getDictDatas(DICT_TYPE.WMS_MERCHANT_TYPE),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        type: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return MerchantApi.getMerchantPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(row) {
      this.$modal
        .confirm('确认删除往来企业“' + row.name + '”吗？')
        .then(() => MerchantApi.deleteMerchant(row.id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.$modal
        .confirm('是否确认导出所有往来企业数据项？')
        .then(() => {
          this.exportLoading = true
          return MerchantApi.exportMerchant(this.queryParams)
        })
        .then((data) => this.$download.excel(data, '往来企业.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
}
</script>
