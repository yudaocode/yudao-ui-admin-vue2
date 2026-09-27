<template>
  <div class="app-container oa-official-doc-template">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="80px"
      @submit.native.prevent
    >
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:officialdoc-template:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="模板名称" prop="name" min-width="120" show-overflow-tooltip />
      <el-table-column label="机关/公司名称" prop="authorityName" min-width="160" show-overflow-tooltip />
      <el-table-column label="字号前缀" prop="noPrefix" min-width="120" show-overflow-tooltip />
      <el-table-column label="分隔线样式" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_SEPARATOR_TYPE" :value="scope.row.separatorType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" min-width="80" align="center" />
      <el-table-column
        label="创建时间"
        prop="createTime"
        min-width="180"
        :formatter="dateFormatter"
        align="center"
      />
      <el-table-column label="操作" align="center" fixed="right" width="140">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:officialdoc-template:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['oa:officialdoc-template:delete']"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 表单弹窗 -->
    <oa-official-doc-template-form ref="form" @success="getList" />
  </div>
</template>

<script>
import * as TemplateApi from '@/api/oa/officialdoc/template'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaOfficialDocTemplateForm from './OaOfficialDocTemplateForm.vue'

export default {
  name: 'OaOfficialDocTemplate',
  components: { OaOfficialDocTemplateForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.COMMON_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return TemplateApi.getTemplatePage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除套红模板编号为“' + id + '”的数据项？').then(() => {
        return TemplateApi.deleteTemplate(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
