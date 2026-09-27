<template>
  <div class="app-container member-tag-page">
    <doc-alert
      title="会员用户、标签、分组"
      url="https://doc.iocoder.cn/member/user/"
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
          label="标签名称"
          prop="name"
        ><el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入标签名称"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="创建时间"
          prop="createTime"
        ><el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        /></el-form-item>
        <el-form-item><el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button><el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button><el-button
          v-hasPermi="['member:tag:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column
          label="编号"
          prop="id"
          width="150"
        />
        <el-table-column
          label="标签名称"
          prop="name"
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="操作"
          width="150"
          fixed="right"
        ><template #default="scope"><el-button
          v-hasPermi="['member:tag:update']"
          type="text"
          size="mini"
          @click="openForm('update', scope.row.id)"
        >编辑</el-button><el-button
          v-hasPermi="['member:tag:delete']"
          type="text"
          size="mini"
          class="danger-text"
          @click="handleDelete(scope.row.id)"
        >删除</el-button></template></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
    <tag-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as TagApi from '@/api/member/tag'
import TagForm from './TagForm'
import { dateFormatter } from '@/utils'

export default {
  name: 'MemberTag',
  components: { TagForm },
  data() { return { loading: false, total: 0, list: [], queryParams: { pageNo: 1, pageSize: 10, name: undefined, createTime: [] }} },
  created() { this.getList() },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await TagApi.getMemberTagPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleDelete(id) { this.$modal.confirm('是否确认删除该会员标签？').then(() => TagApi.deleteMemberTag(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
