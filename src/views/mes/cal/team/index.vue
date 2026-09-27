<!-- MES 班组列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【排班】班组设置、节假日设置" url="https://doc.iocoder.cn/mes/cal/team/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="85px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="班组编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入班组编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="班组名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入班组名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="班组类型" prop="calendarType">
        <el-select v-model="queryParams.calendarType" placeholder="请选择班组类型" clearable>
          <el-option v-for="dict in calendarTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['mes:cal-team:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:cal-team:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="班组编码" align="center" prop="code" min-width="120">
        <template v-slot="scope">
          <el-button type="text" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="班组名称" align="center" prop="name" min-width="150" />
      <el-table-column label="班组类型" align="center" prop="calendarType" min-width="100">
        <template v-slot="scope">
          <dict-tag :type="MES_CAL_CALENDAR_TYPE" :value="scope.row.calendarType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" min-width="150" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template v-slot="scope">
          <el-button
            v-hasPermi="['mes:cal-team:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['mes:cal-team:delete']"
            type="text"
            size="mini"
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

    <cal-team-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { CalTeamApi } from '@/api/mes/cal/team'
import { getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import CalTeamForm from './CalTeamForm.vue'

const MES_CAL_CALENDAR_TYPE = 'mes_cal_calendar_type'

export default {
  name: 'MesCalTeam',
  components: { CalTeamForm },
  data() {
    return {
      MES_CAL_CALENDAR_TYPE,
      loading: true,
      exportLoading: false,
      list: [],
      total: 0,
      calendarTypeOptions: getIntDictOptions(MES_CAL_CALENDAR_TYPE),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        calendarType: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    async getList() {
      this.loading = true
      try {
        const response = await CalTeamApi.getTeamPage(this.queryParams)
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
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除班组？')
        await CalTeamApi.deleteTeam(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有班组数据项？')
        this.exportLoading = true
        const data = await CalTeamApi.exportTeam(this.queryParams)
        this.$download.excel(data, '班组.xls')
      } catch (error) {
        // 取消导出时保持当前列表
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
