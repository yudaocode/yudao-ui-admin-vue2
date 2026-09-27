<template>
  <div class="app-container">
    <doc-alert title="站内信配置" url="https://doc.iocoder.cn/notify/" />

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
      v-show="showSearch"
      @submit.native.prevent
    >
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板编号" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入模版编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择开启状态" clearable>
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:notify-template:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="checkedIds.length === 0"
          @click="handleDeleteBatch"
          v-hasPermi="['system:notify-template:delete']"
        >批量删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="模板编码"
        align="center"
        prop="code"
        width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="模板名称"
        align="center"
        prop="name"
        width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="类型" align="center" prop="type">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="发送人名称" align="center" prop="nickname" />
      <el-table-column
        label="模板内容"
        align="center"
        prop="content"
        width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="开启状态" align="center" prop="status" width="80">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="210">
        <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.id)"
            v-hasPermi="['system:notify-template:update']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-share"
            @click="handleSendNotify(scope.row)"
            v-hasPermi="['system:notify-template:send-notify']"
          >测试</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:notify-template:delete']"
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

    <NotifyTemplateForm ref="formRef" @success="getList" />
    <NotifyTemplateSendForm ref="sendFormRef" />
  </div>
</template>

<script>
import {
  deleteNotifyTemplate,
  deleteNotifyTemplateList,
  getNotifyTemplatePage
} from '@/api/system/notify/template'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import NotifyTemplateForm from './NotifyTemplateForm'
import NotifyTemplateSendForm from './NotifyTemplateSendForm'

export default {
  name: 'SystemNotifyTemplate',
  components: {
    NotifyTemplateForm,
    NotifyTemplateSendForm
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      showSearch: true,
      total: 0,
      list: [],
      checkedIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        code: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getDictDatas,
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    /** 查询站内信模板列表 */
    getList() {
      this.loading = true
      return getNotifyTemplatePage(this.queryParams)
        .then(response => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.formRef.open('create')
    },
    handleUpdate(id) {
      this.$refs.formRef.open('update', id)
    },
    handleDelete(id) {
      this.$modal
        .confirm('是否确认删除站内信模板编号为"' + id + '"的数据项?')
        .then(() => deleteNotifyTemplate(id))
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    handleDeleteBatch() {
      this.$modal
        .confirm('是否确认批量删除选中的站内信模板数据?')
        .then(() => deleteNotifyTemplateList(this.checkedIds))
        .then(() => {
          this.checkedIds = []
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    handleRowCheckboxChange(records) {
      this.checkedIds = records.map(item => item.id)
    },
    handleSendNotify(row) {
      this.$refs.sendFormRef.open(row.id)
    }
  }
}
</script>
