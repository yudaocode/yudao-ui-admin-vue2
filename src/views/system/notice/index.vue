<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="公告标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入公告标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公告状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择公告状态" clearable>
          <el-option
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
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
          v-hasPermi="['system:notice:create']"
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
          v-hasPermi="['system:notice:delete']"
        >批量删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="noticeList" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="公告编号" align="center" prop="id" />
      <el-table-column label="公告标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="公告类型" align="center" prop="type" width="100">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_NOTICE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.id)"
            v-hasPermi="['system:notice:update']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:notice:delete']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            @click="handlePush(scope.row.id)"
            v-hasPermi="['system:notice:update']"
          >推送</el-button>
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

    <NoticeForm ref="noticeForm" @success="getList" />
  </div>
</template>

<script>
import { deleteNotice, deleteNoticeList, getNoticePage, pushNotice } from '@/api/system/notice'
import NoticeForm from './NoticeForm'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'SystemNotice',
  components: { NoticeForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      total: 0,
      noticeList: [],
      checkedIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        status: undefined
      },
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询公告列表 */
    getList() {
      this.loading = true
      return getNoticePage(this.queryParams)
        .then(response => {
          const data = response.data
          this.noticeList = data.list
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
      this.$refs.noticeForm.open('create')
    },
    handleUpdate(id) {
      this.$refs.noticeForm.open('update', id)
    },
    handleDelete(id) {
      this.$modal
        .confirm('是否确认删除公告编号为"' + id + '"的数据项?')
        .then(() => deleteNotice(id))
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    handleDeleteBatch() {
      this.$modal
        .confirm('是否确认批量删除选中的公告数据?')
        .then(() => deleteNoticeList(this.checkedIds))
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
    handlePush(id) {
      this.$modal
        .confirm('是否推送所选中通知？')
        .then(() => pushNotice(id))
        .then(() => this.$modal.msgSuccess('推送成功'))
        .catch(() => {})
    }
  }
}
</script>
