<template>
  <div class="app-container oa-official-doc-send">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="80px"
      @submit.native.prevent
    >
      <el-form-item label="公文标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入公文标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发文字号" prop="documentNo">
        <el-input
          v-model="queryParams.documentNo"
          placeholder="请输入发文字号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择流程状态"
          clearable
          style="width: 240px"
        >
          <el-option label="未提交" :value="BpmProcessInstanceStatus.NOT_START" />
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
          v-hasPermi="['oa:officialdoc-send:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 公文发文列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="单据编号" min-width="190">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openDetail(scope.row.id)">{{ scope.row.no }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="公文标题" prop="title" min-width="190" show-overflow-tooltip />
      <el-table-column label="发文字号" prop="documentNo" min-width="190" show-overflow-tooltip />
      <el-table-column label="密级" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_SECRET_LEVEL" :value="scope.row.secrecyLevel" />
        </template>
      </el-table-column>
      <el-table-column label="紧急程度" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_URGENCY_LEVEL" :value="scope.row.urgencyLevel" />
        </template>
      </el-table-column>
      <el-table-column label="发文部门" prop="sendDeptName" min-width="120" show-overflow-tooltip />
      <el-table-column label="主送部门" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.mainDeptNames && scope.row.mainDeptNames.join('、') }}
        </template>
      </el-table-column>
      <el-table-column label="流程状态" min-width="120" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
            未提交
          </el-tag>
          <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        min-width="180"
        :formatter="dateFormatter"
        align="center"
      />
      <el-table-column label="操作" align="center" fixed="right" width="180">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.processInstanceId"
            v-hasPermi="['oa:officialdoc-send:query']"
            type="text"
            size="mini"
            @click="handleProcessDetail(scope.row)"
          >审批进度</el-button>
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START"
            v-hasPermi="['oa:officialdoc-send:update']"
            type="text"
            size="mini"
            @click="handleSubmit(scope.row.id)"
          >提交</el-button>
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START"
            v-hasPermi="['oa:officialdoc-send:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.RUNNING"
            v-hasPermi="['oa:officialdoc-send:update']"
            type="text"
            size="mini"
            @click="handleCancel(scope.row.id)"
          >撤销</el-button>
          <el-button
            v-if="
              [BpmProcessInstanceStatus.NOT_START, BpmProcessInstanceStatus.REJECT, BpmProcessInstanceStatus.CANCEL].includes(scope.row.status)
            "
            v-hasPermi="['oa:officialdoc-send:delete']"
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
    <oa-official-doc-send-form ref="form" @success="getList" />
    <!-- 详情弹窗 -->
    <oa-official-doc-send-detail ref="detail" />
  </div>
</template>

<script>
import * as SendApi from '@/api/oa/officialdoc/send'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import OaOfficialDocSendForm from './OaOfficialDocSendForm.vue'
import OaOfficialDocSendDetail from './OaOfficialDocSendDetail.vue'

export default {
  name: 'OaOfficialDocSend',
  components: { OaOfficialDocSendForm, OaOfficialDocSendDetail },
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
        title: undefined,
        documentNo: undefined,
        status: undefined
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
      return SendApi.getSendPage(this.queryParams).then(response => {
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
    // 提交审批
    handleSubmit(id) {
      return this.$modal.confirm('确认提交当前公文？').then(() => {
        return SendApi.submitSend(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除公文发文编号为“' + id + '”的数据项？').then(() => {
        return SendApi.deleteSend(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    // 查看审批进度
    handleProcessDetail(row) {
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: row.processInstanceId }
      })
    },
    // 撤销审批
    handleCancel(id) {
      return this.$modal.confirm('确认撤销审批吗？').then(() => {
        return SendApi.cancelSend(id)
      }).then(() => {
        this.$modal.msgSuccess('撤销成功')
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
