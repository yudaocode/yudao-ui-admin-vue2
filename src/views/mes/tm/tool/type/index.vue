<template>
  <div class="app-container">
    <doc-alert
      title="【工具】工具类型、工装夹具台账"
      url="https://doc.iocoder.cn/mes/tm/tool/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item
        label="类型编码"
        prop="code"
      >
        <el-input
          v-model="queryParams.code"
          clearable
          placeholder="请输入类型编码"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="类型名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入类型名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="保养维护类型"
        prop="maintenType"
      >
        <el-select
          v-model="queryParams.maintenType"
          clearable
          placeholder="请选择保养维护类型"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MES_TM_MAINTEN_TYPE)"
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
          v-hasPermi="['mes:tm-tool-type:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:tm-tool-type:export']"
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
        label="类型编码"
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
        label="类型名称"
        align="center"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="是否编码管理"
        align="center"
        prop="codeFlag"
        width="120"
      >
        <template slot-scope="scope">
          <dict-tag
            :options="getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :value="scope.row.codeFlag"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="保养维护类型"
        align="center"
        prop="maintenType"
        width="130"
      >
        <template slot-scope="scope">
          <dict-tag
            v-if="scope.row.codeFlag"
            :options="getIntDictOptions(DICT_TYPE.MES_TM_MAINTEN_TYPE)"
            :value="scope.row.maintenType"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="保养周期"
        align="center"
        prop="maintenPeriod"
        width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.maintenPeriod != null && scope.row.maintenType === MesMaintenTypeEnum.REGULAR">
            {{ scope.row.maintenPeriod }} 天
          </span>
          <span v-else-if="scope.row.maintenPeriod != null && scope.row.maintenType === MesMaintenTypeEnum.USAGE">
            {{ scope.row.maintenPeriod }} 次
          </span>
          <span v-else>-</span>
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
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        width="130"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['mes:tm-tool-type:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['mes:tm-tool-type:delete']"
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

    <tool-type-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import { TmToolTypeApi } from '@/api/mes/tm/tool/type'
import { getBoolDictOptions, getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { MesMaintenTypeEnum } from '@/views/mes/utils/constants'
import ToolTypeForm from './ToolTypeForm.vue'

export default {
  name: 'MesTmToolType',
  components: { ToolTypeForm },
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
        maintenType: undefined
      },
      exportLoading: false
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getBoolDictOptions,
    getIntDictOptions,
    getList() {
      this.loading = true
      return TmToolTypeApi.getToolTypePage(this.queryParams).then((response) => {
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
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该工具类型?')
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      await TmToolTypeApi.deleteToolType(id)
      this.$modal.msgSuccess('删除成功')
      return this.getList()
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有工具类型数据项?')
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        throw error
      }
      this.exportLoading = true
      try {
        const response = await TmToolTypeApi.exportToolType(this.queryParams)
        download.excel(response, '工具类型.xls')
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
