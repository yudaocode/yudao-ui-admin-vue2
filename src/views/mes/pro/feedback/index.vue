<!-- MES 生产报工列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【生产】生产报工"
      url="https://doc.iocoder.cn/mes/pro/feedback/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="报工单号"
        prop="code"
      ><el-input
        v-model="queryParams.code"
        placeholder="请输入报工单号"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="报工类型"
        prop="type"
      ><el-select
        v-model="queryParams.type"
        placeholder="请选择报工类型"
        clearable
      ><el-option
        v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_FEEDBACK_TYPE)"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="生产工单"
        prop="workOrderId"
      ><pro-work-order-select
        v-model="queryParams.workOrderId"
        placeholder="请选择工单"
      /></el-form-item>
      <el-form-item
        label="产品物料"
        prop="itemId"
      ><md-item-select
        v-model="queryParams.itemId"
        placeholder="请选择产品物料"
      /></el-form-item>
      <el-form-item
        label="报工人"
        prop="feedbackUserId"
      ><user-select-v2
        v-model="queryParams.feedbackUserId"
        placeholder="请选择报工人"
      /></el-form-item>
      <el-form-item
        label="记录人"
        prop="creator"
      ><user-select-v2
        v-model="queryParams.creator"
        placeholder="请选择记录人"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
      ><el-option
        v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_FEEDBACK_STATUS)"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="报工时间"
        prop="feedbackTime"
      ><el-date-picker
        v-model="queryParams.feedbackTime"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
      /></el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          v-hasPermi="['mes:pro-feedback:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:pro-feedback:export']"
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
      show-overflow-tooltip
      row-key="id"
    >
      <el-table-column
        label="报工单号"
        align="center"
        prop="code"
        width="160"
      ><template #default="scope"><el-button
        type="text"
        @click="openForm('detail', scope.row.id)"
      >{{ scope.row.code }}</el-button></template></el-table-column>
      <el-table-column
        label="报工类型"
        align="center"
        prop="type"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.MES_PRO_FEEDBACK_TYPE"
        :value="scope.row.type"
      /></template></el-table-column>
      <el-table-column
        label="工作站"
        align="center"
        prop="workstationName"
        width="120"
      />
      <el-table-column
        label="工序"
        align="center"
        prop="processName"
        width="100"
      />
      <el-table-column
        label="生产工单编码"
        align="center"
        prop="workOrderCode"
        width="160"
      />
      <el-table-column
        label="产品物料编码"
        align="center"
        prop="itemCode"
        width="120"
      />
      <el-table-column
        label="产品物料名称"
        align="center"
        prop="itemName"
        width="120"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="itemSpecification"
        width="120"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitMeasureName"
        width="80"
      />
      <el-table-column
        label="报工数量"
        align="center"
        prop="feedbackQuantity"
        width="100"
      />
      <el-table-column
        label="报工人"
        align="center"
        prop="feedbackUserNickname"
        width="100"
      />
      <el-table-column
        label="报工时间"
        align="center"
        prop="feedbackTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="审核人"
        align="center"
        prop="approveUserNickname"
        width="100"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.MES_PRO_FEEDBACK_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="240"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-if="scope.row.status === MesProFeedbackStatusEnum.PREPARE"
            v-hasPermi="['mes:pro-feedback:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === MesProFeedbackStatusEnum.PREPARE"
            v-hasPermi="['mes:pro-feedback:update']"
            type="text"
            class="success-text"
            @click="openForm('submit', scope.row.id)"
          >提交</el-button>
          <el-button
            v-if="scope.row.status === MesProFeedbackStatusEnum.PREPARE"
            v-hasPermi="['mes:pro-feedback:delete']"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
          <el-button
            v-if="scope.row.status === MesProFeedbackStatusEnum.APPROVING && scope.row.approveUserId === currentUserId"
            v-hasPermi="['mes:pro-feedback:approve']"
            type="text"
            @click="openForm('approve', scope.row.id)"
          >审批</el-button>
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
    <feedback-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/plugins/download'
import { ProFeedbackApi } from '@/api/mes/pro/feedback'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import FeedbackForm from './FeedbackForm.vue'
import { MesProFeedbackStatusEnum } from '@/views/mes/utils/constants'
import { getCurrentUserId } from '@/utils/auth'

export default {
  name: 'MesProFeedback',
  components: { ProWorkOrderSelect, MdItemSelect, UserSelectV2, FeedbackForm },
  data() {
    return {
      DICT_TYPE,
      MesProFeedbackStatusEnum,
      currentUserId: getCurrentUserId(),
      loading: true,
      list: [],
      total: 0,
      exportLoading: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        type: undefined,
        workOrderId: undefined,
        itemId: undefined,
        feedbackUserId: undefined,
        creator: undefined,
        status: undefined,
        feedbackTime: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getIntDictOptions,
    async getList() {
      this.loading = true
      try {
        const response = await ProFeedbackApi.getFeedbackPage(this.queryParams)
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
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该生产报工？')
        await ProFeedbackApi.deleteFeedback(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消时不改变列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有生产报工数据项？')
        this.exportLoading = true
        const response = await ProFeedbackApi.exportFeedback(this.queryParams)
        download.excel(response, '生产报工.xls')
      } catch (error) {
        // 用户取消时不导出
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
.success-text { color: #67c23a; }
</style>
