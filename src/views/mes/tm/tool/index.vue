<template>
  <div class="app-container">
    <doc-alert
      title="【工具】工具类型、工装夹具台账"
      url="https://doc.iocoder.cn/mes/tm/tool/"
    />
    <el-row :gutter="20">
      <el-col
        :span="4"
        :xs="24"
      >
        <el-card shadow="never">
          <tm-tool-type-list @node-click="handleTypeNodeClick" />
        </el-card>
      </el-col>
      <el-col
        :span="20"
        :xs="24"
      >
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          label-width="100px"
        >
          <el-form-item
            label="工具编码"
            prop="code"
          >
            <el-input
              v-model="queryParams.code"
              clearable
              placeholder="请输入工具编码"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="工具名称"
            prop="name"
          >
            <el-input
              v-model="queryParams.name"
              clearable
              placeholder="请输入工具名称"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="品牌"
            prop="brand"
          >
            <el-input
              v-model="queryParams.brand"
              clearable
              placeholder="请输入品牌"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="型号规格"
            prop="specification"
          >
            <el-input
              v-model="queryParams.specification"
              clearable
              placeholder="请输入型号规格"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-select
              v-model="queryParams.status"
              clearable
              placeholder="请选择状态"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_TM_TOOL_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              @click="resetQuery"
            >重置</el-button>
            <el-button
              v-hasPermi="['mes:tm-tool:create']"
              type="primary"
              plain
              icon="el-icon-plus"
              @click="openForm('create')"
            >新增</el-button>
            <el-button
              v-hasPermi="['mes:tm-tool:export']"
              type="success"
              plain
              icon="el-icon-download"
              :loading="exportLoading"
              @click="handleExport"
            >导出</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          :data="list"
          stripe
        >
          <el-table-column
            label="工具编码"
            align="center"
            prop="code"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="openForm('detail', scope.row.id)"
              >{{ scope.row.code }}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            label="工具名称"
            align="center"
            prop="name"
            min-width="150"
          />
          <el-table-column
            label="品牌"
            align="center"
            prop="brand"
            width="100"
          />
          <el-table-column
            label="型号规格"
            align="center"
            prop="specification"
            width="120"
          />
          <el-table-column
            label="工具类型"
            align="center"
            prop="toolTypeName"
            width="120"
          />
          <el-table-column
            label="库存数量"
            align="center"
            prop="quantity"
            width="100"
          />
          <el-table-column
            label="可用数量"
            align="center"
            prop="availableQuantity"
            width="100"
          />
          <el-table-column
            label="保养维护类型"
            align="center"
            prop="maintenType"
            width="130"
          >
            <template slot-scope="scope">
              <dict-tag
                :options="getIntDictOptions(DICT_TYPE.MES_TM_MAINTEN_TYPE)"
                :value="scope.row.maintenType"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="下次保养"
            align="center"
            width="200"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.maintenType === MesMaintenTypeEnum.REGULAR">
                {{ scope.row.nextMaintenDate ? formatDate(scope.row.nextMaintenDate) : '-' }}
              </span>
              <span v-else-if="scope.row.maintenType === MesMaintenTypeEnum.USAGE">
                {{ scope.row.nextMaintenPeriod != null ? scope.row.nextMaintenPeriod + ' 次' : '-' }}
              </span>
              <span v-else>-</span>
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
                :options="getIntDictOptions(DICT_TYPE.MES_TM_TOOL_STATUS)"
                :value="scope.row.status"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column
            label="操作"
            align="center"
            width="130"
          >
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['mes:tm-tool:update']"
                type="text"
                @click="openForm('update', scope.row.id)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['mes:tm-tool:delete']"
                type="text"
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
      </el-col>
    </el-row>

    <tool-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import download from '@/plugins/download'
import { TmToolApi } from '@/api/mes/tm/tool'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { MesMaintenTypeEnum } from '@/views/mes/utils/constants'
import TmToolTypeList from './type/components/TmToolTypeList.vue'
import ToolForm from './ToolForm.vue'

export default {
  name: 'MesTmTool',
  components: { TmToolTypeList, ToolForm },
  data() {
    return {
      DICT_TYPE,
      MesMaintenTypeEnum,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        toolTypeId: undefined,
        brand: undefined,
        specification: undefined,
        status: undefined
      },
      exportLoading: false
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatDate,
    getIntDictOptions,
    getList() {
      this.loading = true
      return TmToolApi.getToolPage(this.queryParams).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.toolTypeId = undefined
      this.handleQuery()
    },
    handleTypeNodeClick(row) {
      this.queryParams.toolTypeId = row ? row.id : undefined
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该工具台账?')
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      await TmToolApi.deleteTool(id)
      this.$modal.msgSuccess('删除成功')
      return this.getList()
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有工具台账数据项?')
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      this.exportLoading = true
      try {
        const response = await TmToolApi.exportTool(this.queryParams)
        download.excel(response, '工具台账.xls')
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .el-col { margin-bottom: 16px; }
}
</style>
