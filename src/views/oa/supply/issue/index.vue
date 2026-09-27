<template>
  <div class="app-container oa-supply-issue">
    <doc-alert
      title="【行政】办公用品、用印管理"
      url="https://doc.iocoder.cn/oa/administration/supply-seal/"
    />
    <!-- 搜索工作栏 -->
    <content-wrap>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="80px"
        @submit.native.prevent
      >
        <el-form-item label="物品名称" prop="itemName">
          <el-input
            v-model="queryParams.itemName"
            placeholder="请输入物品名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="申请人" prop="creatorName">
          <el-input
            v-model="queryParams.creatorName"
            placeholder="请输入申请人"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="管理类型" prop="manageType">
          <el-select
            v-model="queryParams.manageType"
            placeholder="请选择管理类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in manageTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="使用类型" prop="useType">
          <el-select
            v-model="queryParams.useType"
            placeholder="请选择使用类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in useTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间" prop="createTime">
          <el-date-picker
            v-model="queryParams.createTime"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="至"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </content-wrap>
    <!-- 列表 -->
    <content-wrap>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="申请单号" prop="no" min-width="160" />
        <el-table-column label="申请人" prop="creatorName" min-width="100" />
        <el-table-column label="申请部门" prop="deptName" min-width="120" />
        <el-table-column label="使用类型" width="100" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_USE_TYPE" :value="scope.row.useType" />
          </template>
        </el-table-column>
        <el-table-column label="物品名称" prop="itemName" min-width="140" />
        <el-table-column label="规格型号" prop="model" min-width="100" />
        <el-table-column label="计量单位" prop="unit" width="80" align="center" />
        <el-table-column label="管理类型" width="100" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_MANAGE_TYPE" :value="scope.row.manageType" />
          </template>
        </el-table-column>
        <el-table-column label="申请数量" prop="applyQuantity" width="80" align="center" />
        <el-table-column label="实发数量" prop="issuedQuantity" width="80" align="center" />
        <el-table-column label="已归还" prop="returnedQuantity" width="80" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_ITEM_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="发放人" prop="issueUserName" min-width="100" />
        <el-table-column label="发放时间" prop="issueTime" :formatter="dateFormatter" width="180" />
        <el-table-column label="操作" fixed="right" width="80" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 0"
              v-hasPermi="['oa:supply-issue:issue']"
              type="text"
              size="mini"
              @click="openIssueForm(scope.row)"
            >发放</el-button>
            <el-button
              v-if="scope.row.status === 2"
              v-hasPermi="['oa:supply-issue:return']"
              type="text"
              size="mini"
              @click="openReturnForm(scope.row)"
            >归还</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </content-wrap>
    <!-- 发放弹窗 -->
    <oa-supply-issue-form ref="issueForm" @success="getList" />
    <!-- 归还弹窗 -->
    <oa-supply-return-form ref="returnForm" @success="getList" />
  </div>
</template>

<script>
import * as SupplyIssueApi from '@/api/oa/supply/issue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaSupplyIssueForm from './OaSupplyIssueForm.vue'
import OaSupplyReturnForm from './OaSupplyReturnForm.vue'

export default {
  name: 'OaSupplyIssue',
  components: { OaSupplyIssueForm, OaSupplyReturnForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        itemName: undefined,
        creatorName: undefined,
        manageType: undefined,
        useType: undefined,
        createTime: []
      }
    }
  },
  computed: {
    manageTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_MANAGE_TYPE)
    },
    useTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_USE_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return SupplyIssueApi.getSupplyApplyItemPage(this.queryParams).then(response => {
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
    openIssueForm(row) {
      this.$refs.issueForm.open(row)
    },
    openReturnForm(row) {
      this.$refs.returnForm.open(row)
    }
  }
}
</script>
