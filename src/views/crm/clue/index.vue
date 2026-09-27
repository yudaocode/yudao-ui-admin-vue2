<template>
  <div class="app-container crm-clue-page">
    <doc-alert
      title="【线索】线索管理"
      url="https://doc.iocoder.cn/crm/clue/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />

    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="线索名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            clearable
            placeholder="请输入线索名称"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="转化状态"
          prop="transformStatus"
        >
          <el-select
            v-model="queryParams.transformStatus"
            clearable
            placeholder="请选择转化状态"
          >
            <el-option
              :value="false"
              label="未转化"
            />
            <el-option
              :value="true"
              label="已转化"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        >
          <el-input
            v-model="queryParams.mobile"
            clearable
            placeholder="请输入手机号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="电话"
          prop="telephone"
        >
          <el-input
            v-model="queryParams.telephone"
            clearable
            placeholder="请输入电话"
            @keyup.enter.native="handleQuery"
          />
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
            v-hasPermi="['crm:clue:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['crm:clue:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          label="我负责的"
          name="1"
        />
        <el-tab-pane
          label="我参与的"
          name="2"
        />
        <el-tab-pane
          label="下属负责的"
          name="3"
        />
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
      >
        <el-table-column
          label="线索名称"
          prop="name"
          fixed="left"
          min-width="160"
        >
          <template slot-scope="scope"><el-link
            type="primary"
            :underline="false"
            @click="openDetail(scope.row.id)"
          >{{ scope.row.name || '-' }}</el-link></template>
        </el-table-column>
        <el-table-column
          label="线索来源"
          prop="source"
          width="110"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
            :value="scope.row.source"
          /></template>
        </el-table-column>
        <el-table-column
          label="手机"
          prop="mobile"
          width="130"
        />
        <el-table-column
          label="电话"
          prop="telephone"
          width="130"
        />
        <el-table-column
          label="邮箱"
          prop="email"
          min-width="180"
        />
        <el-table-column
          label="地址"
          prop="detailAddress"
          min-width="180"
        />
        <el-table-column
          label="客户行业"
          prop="industryId"
          width="110"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_INDUSTRY"
            :value="scope.row.industryId"
          /></template>
        </el-table-column>
        <el-table-column
          label="客户级别"
          prop="level"
          width="110"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
            :value="scope.row.level"
          /></template>
        </el-table-column>
        <el-table-column
          label="下次联系时间"
          prop="contactNextTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="备注"
          prop="remark"
          min-width="200"
        />
        <el-table-column
          label="最后跟进时间"
          prop="contactLastTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="最后跟进记录"
          prop="contactLastContent"
          min-width="200"
        />
        <el-table-column
          label="负责人"
          prop="ownerUserName"
          width="110"
        />
        <el-table-column
          label="所属部门"
          prop="ownerUserDeptName"
          width="120"
        />
        <el-table-column
          label="更新时间"
          prop="updateTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="创建人"
          prop="creatorName"
          width="100"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="170"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:clue:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-if="!scope.row.transformStatus"
              v-hasPermi="['crm:clue:update']"
              type="text"
              size="mini"
              @click="handleTransform(scope.row)"
            >转化</el-button>
            <el-button
              v-hasPermi="['crm:clue:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row)"
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

    <clue-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import * as ClueApi from '@/api/crm/clue'
import ClueForm from './ClueForm'

export default {
  name: 'CrmClue',
  components: { ClueForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      activeName: '1',
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sceneType: '1',
        name: undefined,
        telephone: undefined,
        mobile: undefined,
        transformStatus: undefined
      }
    }
  },
  created() { this.getList() },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const data = (await ClueApi.getCluePage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() {
      this.queryParams.name = undefined
      this.queryParams.telephone = undefined
      this.queryParams.mobile = undefined
      this.queryParams.transformStatus = undefined
      this.handleQuery()
    },
    handleTabClick(tab) {
      this.queryParams.sceneType = tab.name || (tab.$props && tab.$props.name) || this.activeName
      this.handleQuery()
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openDetail(id) { this.$router.push({ name: 'CrmClueDetail', params: { id }}) },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除线索“' + (row.name || row.id) + '”？').then(() => ClueApi.deleteClue(row.id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleTransform(row) {
      this.$modal.confirm('确定将线索“' + (row.name || row.id) + '”转化为客户吗？').then(() => ClueApi.transformClue(row.id)).then(() => {
        this.$modal.msgSuccess('转化成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前线索数据？').then(() => {
        this.exportLoading = true
        return ClueApi.exportClue(this.queryParams)
      }).then(response => {
        this.$download.excel(response.data, '线索.xls')
      }).catch(() => {}).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
