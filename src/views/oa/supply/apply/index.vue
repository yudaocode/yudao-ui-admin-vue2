<template>
  <div class="app-container oa-supply-apply">
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
        <el-form-item label="单据编号" prop="no">
          <el-input
            v-model="queryParams.no"
            placeholder="请输入单据编号"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="单据状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择单据状态"
            clearable
            style="width: 240px"
          >
            <el-option label="未提交" :value="-1" />
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请部门" prop="deptId">
          <dept-select v-model="queryParams.deptId" placeholder="请选择申请部门" style="width: 240px" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
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
          <el-button
            v-hasPermi="['oa:supply-apply:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="$refs.form.open('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </content-wrap>
    <!-- 列表 -->
    <content-wrap>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="单据编号" min-width="210">
          <template slot-scope="scope">
            <el-button type="text" @click="$refs.detail.open(scope.row.id)">{{ scope.row.no }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="单据状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info">未提交</el-tag>
            <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="申请事由" prop="reason" min-width="200" show-overflow-tooltip />
        <el-table-column label="申请人" prop="creatorName" min-width="100" />
        <el-table-column label="申请部门" prop="deptName" min-width="120" />
        <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
        <el-table-column label="操作" fixed="right" width="175" align="center">
          <template slot-scope="scope">
            <template v-if="[-1, 3, 4].includes(scope.row.status)">
              <el-button
                v-hasPermi="['oa:supply-apply:update']"
                type="text"
                size="mini"
                @click="$refs.form.open('update', scope.row.id)"
              >修改</el-button>
              <el-button
                v-hasPermi="['oa:supply-apply:create']"
                type="text"
                size="mini"
                @click="handleSubmit(scope.row.id)"
              >提交</el-button>
              <el-button
                v-hasPermi="['oa:supply-apply:delete']"
                type="text"
                size="mini"
                class="danger-text"
                @click="handleDelete(scope.row.id)"
              >删除</el-button>
            </template>
            <el-button
              v-if="scope.row.processInstanceId"
              type="text"
              size="mini"
              @click="handleProcessDetail(scope.row.processInstanceId)"
            >进度</el-button>
            <el-button
              v-if="scope.row.status === BpmProcessInstanceStatus.RUNNING"
              v-hasPermi="['oa:supply-apply:update']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleCancel(scope.row.id)"
            >取消</el-button>
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
    </content-wrap>
    <!-- 表单与详情 -->
    <oa-supply-apply-form ref="form" @success="getList" />
    <oa-supply-apply-detail ref="detail" />
  </div>
</template>

<script>
import * as SupplyApplyApi from '@/api/oa/supply/apply'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import { dateFormatter } from '@/utils/formatTime'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import OaSupplyApplyForm from './OaSupplyApplyForm.vue'
import OaSupplyApplyDetail from './OaSupplyApplyDetail.vue'

export default {
  name: 'OaSupplyApply',
  components: { DeptSelect, OaSupplyApplyForm, OaSupplyApplyDetail },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        status: undefined,
        deptId: undefined,
        createTime: []
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return SupplyApplyApi.getSupplyApplyPage(this.queryParams).then(response => {
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
    handleDelete(id) {
      return this.$modal.delConfirm().then(() => {
        return SupplyApplyApi.deleteSupplyApply(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    handleSubmit(id) {
      return this.$modal.confirm('确定提交该领用申请吗？').then(() => {
        return SupplyApplyApi.submitSupplyApply(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    handleCancel(id) {
      return this.$modal.confirm('确定取消该领用申请吗？').then(() => {
        return SupplyApplyApi.cancelSupplyApply(id)
      }).then(() => {
        this.$modal.msgSuccess('取消成功')
        return this.getList()
      }).catch(() => {})
    },
    handleProcessDetail(id) {
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id }
      })
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
