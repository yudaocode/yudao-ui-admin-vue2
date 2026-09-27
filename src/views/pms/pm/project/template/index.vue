<template>
  <div class="app-container">
    <doc-alert title="【PMS】项目模板" url="https://doc.iocoder.cn/pms/pm/project/" />

    <el-card class="search-card" shadow="never">
      <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px">
        <el-form-item label="模板名称" prop="name">
          <el-input
            v-model="queryParams.name"
            class="query-control"
            clearable
            placeholder="请输入模板名称"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select
            v-model="queryParams.projectType"
            class="query-control"
            clearable
            placeholder="请选择项目类型"
          >
            <el-option label="通用项目" :value="PmsProjectType.GENERAL" />
            <el-option label="敏捷开发项目" :value="PmsProjectType.AGILE" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            class="query-control"
            clearable
            placeholder="请选择状态"
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
          <el-button @click="handleQuery">
            <Icon class="button-icon" icon="ep:search" />搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon class="button-icon" icon="ep:refresh" />重置
          </el-button>
          <el-button
            v-hasPermi="['pms:pm:project-template:create']"
            plain
            type="primary"
            @click="openForm('create')"
          >
            <Icon class="button-icon" icon="ep:plus" />新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list">
        <el-table-column align="center" label="模板名称" min-width="180" prop="name" />
        <el-table-column align="center" label="项目类型" prop="projectType" width="140">
          <template slot-scope="scope">{{ formatProjectType(scope.row.projectType) }}</template>
        </el-table-column>
        <el-table-column align="center" label="事项类型" min-width="180">
          <template slot-scope="scope">
            <el-tag
              v-for="type in scope.row.itemTypes"
              :key="type"
              class="item-type-tag"
              effect="plain"
            >
              {{ getWorkItemTypeName(type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态数" width="90">
          <template slot-scope="scope">{{ scope.row.statuses.length }}</template>
        </el-table-column>
        <el-table-column align="center" label="看板列数" width="100">
          <template slot-scope="scope">{{ scope.row.boards.length }}</template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="status" width="90">
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
              v-hasPermi="['pms:pm:project-template:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['pms:pm:project-template:delete']"
              type="text"
              class="danger-text-button"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
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
    </el-card>

    <project-template-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { Icon } from '@/components/Icon'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as ProjectTemplateApi from '@/api/pms/pm/project/template'
import { PmsProjectType } from '@/views/pms/pm/utils/constants'
import { formatProjectType, getWorkItemTypeName } from '@/views/pms/pm/utils/format'
import ProjectTemplateForm from './ProjectTemplateForm.vue'

export default {
  name: 'PmsProjectTemplate',
  components: { Icon, ProjectTemplateForm },
  data() {
    return {
      DICT_TYPE,
      PmsProjectType,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        projectType: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatProjectType,
    getIntDictOptions,
    getWorkItemTypeName,
    async getList() {
      this.loading = true
      try {
        const response = await ProjectTemplateApi.getProjectTemplatePage(this.queryParams)
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
        await this.$modal.confirm('是否确认删除该项目模板？')
        await ProjectTemplateApi.deleteProjectTemplate(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {
        // 用户取消时保留模板。
      }
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.search-card ::v-deep .el-card__body {
  padding-bottom: 2px;
}

.query-control {
  width: 240px;
}

.button-icon {
  margin-right: 5px;
}

.item-type-tag + .item-type-tag {
  margin-left: 4px;
}

.danger-text-button {
  color: #f56c6c;
}
</style>
