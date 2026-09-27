<template>
  <div class="app-container pms-knowledge-library-template">
    <doc-alert title="【PMS】知识库管理" url="https://doc.iocoder.cn/pms/kb/library/" />

    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入模板名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择模板状态"
          style="width: 240px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['pms:kb:library-template:create']"
          plain
          type="primary"
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column align="center" label="模板名称" min-width="180" prop="name" />
      <el-table-column
        align="center"
        label="模板描述"
        min-width="260"
        prop="description"
        show-overflow-tooltip
      />
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="80" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="140">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['pms:kb:library-template:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['pms:kb:library-template:delete']"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />

    <!-- 新增或修改知识库模板 -->
    <knowledge-library-template-form ref="form" @success="getList" />
  </div>
</template>

<script>
import * as KnowledgeLibraryTemplateApi from '@/api/pms/kb/library/template'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import KnowledgeLibraryTemplateForm from './KnowledgeLibraryTemplateForm.vue'

export default {
  name: 'PmsKnowledgeLibraryTemplate',
  components: { KnowledgeLibraryTemplateForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
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
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeLibraryTemplateApi.getKnowledgeLibraryTemplatePage(
          this.queryParams
        )
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
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
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该知识库模板？')
        await KnowledgeLibraryTemplateApi.deleteKnowledgeLibraryTemplate(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {
        // 用户取消时不改变列表。
      }
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
