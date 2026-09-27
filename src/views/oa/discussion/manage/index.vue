<template>
  <div class="app-container oa-discussion-manage">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入讨论标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="讨论类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择讨论类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isSuperAdmin" label="发布人" prop="userId">
        <user-select-v2 v-model="queryParams.userId" placeholder="请选择发布人" style="width: 240px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:discussion:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >发布</el-button>
      </el-form-item>
    </el-form>

    <!-- 讨论列表 -->
    <el-table v-loading="loading" :data="list" border stripe @sort-change="handleSortChange">
      <el-table-column label="标题" prop="title" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" class="link-button" @click="openDetail(scope.row.id)">
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" align="center" width="90" sortable="custom">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_DISCUSSION_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="发布人" prop="userName" align="center" width="120" />
      <el-table-column label="浏览" prop="visitCount" align="center" width="80" sortable="custom" />
      <el-table-column label="回复" prop="replyCount" align="center" width="80" />
      <el-table-column label="点赞" prop="likeCount" align="center" width="80" />
      <el-table-column label="附件" align="center" width="80">
        <template slot-scope="scope">{{ (scope.row.fileUrls && scope.row.fileUrls.length) || 0 }}</template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
        sortable="custom"
      />
      <el-table-column label="操作" align="center" width="130" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.userId === currentUserId"
            v-hasPermi="['oa:discussion:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="isSuperAdmin || scope.row.userId === currentUserId"
            v-hasPermi="['oa:discussion:delete']"
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

    <!-- 添加或修改讨论对话框 -->
    <oa-discussion-form ref="formRef" @success="getList" />
  </div>
</template>

<script>
import * as DiscussionApi from '@/api/oa/discussion'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import OaDiscussionForm from './OaDiscussionForm.vue'

/** 表格排序字段 */
function buildSortingField({ prop, order }) {
  return { field: prop, order: order === 'ascending' ? 'asc' : 'desc' }
}

export default {
  name: 'OaDiscussionManage',
  components: { UserSelectV2, OaDiscussionForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        userId: undefined,
        sortingFields: []
      }
    }
  },
  computed: {
    currentUserId() {
      return this.$store.getters.userId
    },
    isSuperAdmin() {
      return (this.$store.getters.roles || []).includes('super_admin')
    },
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_DISCUSSION_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return DiscussionApi.getDiscussionManagePage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
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
    /** 表格排序操作 */
    handleSortChange({ prop, order }) {
      this.queryParams.sortingFields = order ? [buildSortingField({ prop, order })] : []
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    },
    /** 打开讨论详情 */
    openDetail(id) {
      this.$router.push({ name: 'OaDiscussionDetail', params: { id } })
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除讨论编号为“' + id + '”的数据项？').then(() => {
        return DiscussionApi.deleteDiscussion(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
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
