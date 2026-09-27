<!-- CRM 业绩目标设置 -->
<template>
  <div class="app-container crm-performance-config">
    <el-card
      shadow="never"
      class="query-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
      >
        <el-form-item
          label="年份"
          prop="year"
        >
          <el-date-picker
            v-model="queryParams.year"
            type="year"
            value-format="yyyy"
            placeholder="请选择年份"
            class="query-control"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="目标类型"
          prop="bizType"
        >
          <el-select
            v-model="queryParams.bizType"
            clearable
            placeholder="请选择目标类型"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="item in bizTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="对象类型"
          prop="objectType"
        >
          <el-select
            v-model="queryParams.objectType"
            clearable
            placeholder="请选择对象类型"
            class="query-control"
            @change="handleObjectTypeChange"
          >
            <el-option
              v-for="item in objectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="queryParams.objectType === PerformanceConfigObjectTypeEnum.DEPT"
          label="部门"
          prop="objectId"
        >
          <el-cascader
            v-model="queryParams.objectId"
            :options="deptList"
            :props="deptCascaderProps"
            clearable
            filterable
            placeholder="请选择部门"
            class="query-control"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item
          v-if="queryParams.objectType === PerformanceConfigObjectTypeEnum.USER"
          label="员工"
          prop="objectId"
        >
          <el-select
            v-model="queryParams.objectId"
            clearable
            filterable
            placeholder="请选择员工"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
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
            v-hasPermi="['crm:performance-config:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      shadow="never"
      class="table-card"
    >
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="年份"
          align="center"
          prop="year"
          width="90"
          fixed
        />
        <el-table-column
          label="对象类型"
          align="center"
          prop="objectType"
          width="100"
          fixed
        >
          <template slot-scope="scope">{{ getObjectTypeLabel(scope.row.objectType) }}</template>
        </el-table-column>
        <el-table-column
          label="目标对象"
          align="center"
          prop="objectName"
          min-width="140"
          fixed
        />
        <el-table-column
          label="目标类型"
          align="center"
          prop="bizType"
          width="100"
        >
          <template slot-scope="scope">{{ getBizTypeLabel(scope.row.bizType) }}</template>
        </el-table-column>
        <el-table-column
          v-for="item in monthFields"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :formatter="erpPriceTableColumnFormatter"
          align="right"
          width="120"
        />
        <el-table-column
          label="年度目标"
          align="right"
          prop="yearTargetPrice"
          :formatter="erpPriceTableColumnFormatter"
          width="140"
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
          fixed="right"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:performance-config:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['crm:performance-config:delete']"
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
    </el-card>

    <performance-config-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  PerformanceConfigApi,
  PerformanceConfigObjectTypeEnum
} from '@/api/crm/performance/config'
import { BizTypeEnum } from '@/api/crm/permission'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import { dateFormatter, erpPriceTableColumnFormatter } from '@/utils'
import { handleTree } from '@/utils/ruoyi'
import PerformanceConfigForm from './PerformanceConfigForm.vue'

function createQueryParams() {
  return {
    pageNo: 1,
    pageSize: 10,
    year: String(new Date().getFullYear()),
    bizType: undefined,
    objectType: undefined,
    objectId: undefined
  }
}

export default {
  name: 'CrmPerformanceConfig',
  components: { PerformanceConfigForm },
  data() {
    return {
      PerformanceConfigObjectTypeEnum,
      bizTypeOptions: [
        { label: '销售目标', value: BizTypeEnum.CRM_CONTRACT },
        { label: '回款目标', value: BizTypeEnum.CRM_RECEIVABLE }
      ],
      objectTypeOptions: [
        { label: '部门', value: PerformanceConfigObjectTypeEnum.DEPT },
        { label: '员工', value: PerformanceConfigObjectTypeEnum.USER }
      ],
      monthFields: [
        { label: '一月', prop: 'januaryTargetPrice' },
        { label: '二月', prop: 'februaryTargetPrice' },
        { label: '三月', prop: 'marchTargetPrice' },
        { label: '四月', prop: 'aprilTargetPrice' },
        { label: '五月', prop: 'mayTargetPrice' },
        { label: '六月', prop: 'juneTargetPrice' },
        { label: '七月', prop: 'julyTargetPrice' },
        { label: '八月', prop: 'augustTargetPrice' },
        { label: '九月', prop: 'septemberTargetPrice' },
        { label: '十月', prop: 'octoberTargetPrice' },
        { label: '十一月', prop: 'novemberTargetPrice' },
        { label: '十二月', prop: 'decemberTargetPrice' }
      ],
      loading: false,
      total: 0,
      list: [],
      queryParams: createQueryParams(),
      deptList: [],
      userList: [],
      deptCascaderProps: {
        checkStrictly: true,
        emitPath: false,
        value: 'id',
        label: 'name',
        children: 'children'
      }
    }
  },
  created() {
    this.loadOptions()
    this.getList()
  },
  methods: {
    dateFormatter,
    erpPriceTableColumnFormatter,
    /** 获取接口参数 */
    getApiParams() {
      return Object.assign({}, this.queryParams, {
        year: this.queryParams.year ? Number(this.queryParams.year) : undefined
      })
    },
    /** 查询业绩目标列表 */
    async getList() {
      this.loading = true
      try {
        const data = (await PerformanceConfigApi.getPerformanceConfigPage(this.getApiParams())).data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 对象类型变化时重置目标对象 */
    handleObjectTypeChange() {
      this.queryParams.objectId = undefined
      this.handleQuery()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    /** 打开表单 */
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    /** 删除业绩目标 */
    handleDelete(id) {
      this.$modal.confirm('是否确认删除编号为“' + id + '”的业绩目标？').then(() => {
        return PerformanceConfigApi.deletePerformanceConfig(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    /** 获取目标类型名称 */
    getBizTypeLabel(value) {
      const option = this.bizTypeOptions.find(item => item.value === value)
      return option ? option.label : ''
    },
    /** 获取对象类型名称 */
    getObjectTypeLabel(value) {
      const option = this.objectTypeOptions.find(item => item.value === value)
      return option ? option.label : ''
    },
    /** 加载部门和员工选项 */
    async loadOptions() {
      const responses = await Promise.all([
        getSimpleDeptList(),
        getSimpleUserList()
      ])
      const depts = (responses[0]).data
      const users = (responses[1]).data
      this.deptList = handleTree(depts, 'id', 'parentId')
      this.userList = users
    }
  }
}
</script>

<style scoped>
.query-card {
  margin-bottom: 16px;
}

.query-card ::v-deep .el-card__body {
  padding-bottom: 2px;
}

.query-control {
  width: 240px;
}

.table-card ::v-deep .el-card__body {
  padding-bottom: 4px;
}

.danger-text {
  color: #f56c6c;
}
</style>
